<?php
// SEO / Open Graph injector.
//
// The site is a static export, so any project or post published after the last
// build has no page of its own and falls back to a generic shell
// (works/__fallback__.html). That shell carries a placeholder title, the site
// logo as og:image and `noindex, nofollow` — which is why shared links previewed
// as "ملف الأعمال | جهور" and why Search Console reported the pages as
// "discovered, not indexed".
//
// This proxy reads the static HTML from disk and rewrites the metadata using
// live API content, so crawlers and social scrapers get the real title,
// description and cover image without requiring a new frontend build.

const API_BASE      = 'https://johor-back.euphoria-motiva.com';
const SITE_URL      = 'https://jhoragency.com.sa';
const WORKS_ID      = 'e8c6f1f0-f640-4fb2-a28e-e0660755adc5';
const BLOG_ID       = '41e9b705-9781-49e1-88ab-9af629008a75';
const SEO_DESCS_URL = API_BASE . '/api/content/type/9996';
const CACHE_TTL     = 300; // 5 minutes

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = '/' . trim($path ?? '', '/');
if ($path !== '/') $path = rtrim($path, '/');

// --- Locate the HTML file -------------------------------------------------
$root = __DIR__;
$candidates = [
    $root . ($path === '/' ? '/index.html' : $path . '.html'),
    $root . $path . '/index.html',
];

// Fallback shells for dynamic slug routes (works / blog added after build)
$fallbackMap = [
    '#^/works/[^/]+$#'               => $root . '/works/__fallback__.html',
    '#^/blog/[^/]+$#'                => $root . '/blog/__fallback__.html',
    '#^/packages/[^/]+/[^/]+$#'      => $root . '/packages/__fallback__/__fallback__.html',
    '#^/packages/[^/]+$#'            => $root . '/packages/__fallback__.html',
    '#^/brief/[^/]+$#'               => $root . '/brief/__shell__.html',
];

$htmlFile = null;
foreach ($candidates as $c) {
    if (file_exists($c)) { $htmlFile = $c; break; }
}
if (!$htmlFile) {
    foreach ($fallbackMap as $pattern => $file) {
        if (preg_match($pattern, $path) && file_exists($file)) {
            $htmlFile = $file; break;
        }
    }
}
if (!$htmlFile) {
    $f404 = $root . '/404.html';
    http_response_code(404);
    header('Content-Type: text/html; charset=utf-8');
    echo file_exists($f404) ? file_get_contents($f404) : '404';
    exit;
}

// --- Cached API fetch -----------------------------------------------------
function jhor_fetch(string $url, string $cacheKey)
{
    $cacheFile = sys_get_temp_dir() . '/jhor_' . $cacheKey . '.json';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < CACHE_TTL)) {
        return json_decode(file_get_contents($cacheFile), true) ?? [];
    }

    $ctx = stream_context_create(['http' => ['timeout' => 3, 'ignore_errors' => true]]);
    $raw = @file_get_contents($url, false, $ctx);
    if (!$raw) {
        // On a failed refresh prefer stale cache over nothing.
        return file_exists($cacheFile)
            ? (json_decode(file_get_contents($cacheFile), true) ?? [])
            : [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) return [];

    // The API returns either a single content object or an array of them.
    $entry = isset($data['jsonContent'])
        ? $data
        : (!empty($data[0]['jsonContent']) ? $data[0] : null);
    if (!$entry) return [];

    $jc     = $entry['jsonContent'];
    $parsed = is_string($jc) ? json_decode($jc, true) : $jc;
    $parsed = is_array($parsed) ? $parsed : [];

    @file_put_contents($cacheFile, json_encode($parsed));
    return $parsed;
}

/** Find an item by slug in a list. */
function jhor_find_by_slug(array $items, string $slug)
{
    foreach ($items as $item) {
        if (isset($item['slug']) && (string) $item['slug'] === $slug) return $item;
    }
    return null;
}

/** First non-empty trimmed string from the candidates. */
function jhor_first(...$values)
{
    foreach ($values as $v) {
        if (is_string($v) && trim($v) !== '') return trim($v);
    }
    return null;
}

// --- Resolve metadata for this path ---------------------------------------
$meta      = [];      // tag name => value
$isRealPage = false;  // true once we match a live project/post

if (preg_match('#^/works/([^/]+)$#', $path, $m)) {
    $slug    = rawurldecode($m[1]);
    $content = jhor_fetch(API_BASE . '/api/content/' . WORKS_ID, 'works');
    $project = jhor_find_by_slug($content['projects'] ?? [], $slug);

    if ($project) {
        $isRealPage = true;
        $desc = jhor_first(
            $project['ogDescription'] ?? null,
            $project['listingDescription'] ?? null,
            $project['overview'] ?? null,
            $project['supportText'] ?? null
        );
        $meta = [
            'title'       => jhor_first($project['title'] ?? null) . ' | ملف الأعمال | جهور',
            'description' => $desc,
            'image'       => jhor_first($project['coverImage'] ?? null),
            'url'         => SITE_URL . '/works/' . rawurlencode($slug),
            'type'        => 'article',
        ];
    }
} elseif (preg_match('#^/blog/([^/]+)$#', $path, $m)) {
    $slug    = rawurldecode($m[1]);
    $content = jhor_fetch(API_BASE . '/api/content/' . BLOG_ID, 'blog');
    $post    = jhor_find_by_slug($content['items'] ?? [], $slug);

    if ($post) {
        $isRealPage = true;
        $meta = [
            'title'       => jhor_first($post['title'] ?? null) . ' | المدونة | جهور',
            'description' => jhor_first($post['excerpt'] ?? null),
            'image'       => jhor_first($post['coverImage'] ?? null),
            'url'         => SITE_URL . '/blog/' . rawurlencode($slug),
            'type'        => 'article',
        ];
    }
}

// Dashboard-managed description overrides always win.
$descs    = jhor_fetch(SEO_DESCS_URL, 'seo_descs');
$override = isset($descs[$path]) ? trim((string) $descs[$path]) : '';
if ($override !== '') $meta['description'] = $override;

$html = file_get_contents($htmlFile);

// --- Inject ---------------------------------------------------------------

/**
 * Replace a meta tag's content, or append the tag to <head> if it is missing.
 * Matches the attribute order Next.js emits (property/name first, then content).
 */
function jhor_set_meta(string $html, string $attr, string $key, string $value): string
{
    $safe    = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $pattern = '/<meta\s+' . $attr . '=["\']' . preg_quote($key, '/')
             . '["\']\s+content=["\'][^"\']*["\']\s*\/?>/i';
    $tag     = '<meta ' . $attr . '="' . $key . '" content="' . $safe . '"/>';

    if (preg_match($pattern, $html)) {
        return preg_replace($pattern, $tag, $html, 1);
    }
    return preg_replace('/<\/head>/i', $tag . '</head>', $html, 1);
}

if (!empty($meta['description'])) {
    $d = $meta['description'];
    $html = jhor_set_meta($html, 'name',     'description',         $d);
    $html = jhor_set_meta($html, 'property', 'og:description',      $d);
    $html = jhor_set_meta($html, 'name',     'twitter:description', $d);
}

if (!empty($meta['title'])) {
    $t    = $meta['title'];
    $safe = htmlspecialchars($t, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $html = preg_replace('/<title>.*?<\/title>/is', '<title>' . $safe . '</title>', $html, 1);
    $html = jhor_set_meta($html, 'property', 'og:title',      $t);
    $html = jhor_set_meta($html, 'name',     'twitter:title', $t);
}

if (!empty($meta['image'])) {
    $i    = $meta['image'];
    $html = jhor_set_meta($html, 'property', 'og:image',      $i);
    $html = jhor_set_meta($html, 'name',     'twitter:image', $i);
    if (!empty($meta['title'])) {
        $html = jhor_set_meta($html, 'property', 'og:image:alt', $meta['title']);
    }
}

if (!empty($meta['url'])) {
    $html = jhor_set_meta($html, 'property', 'og:url', $meta['url']);
    // The fallback shell hardcodes the canonical to /works/__fallback__, which
    // makes Search Console treat every project as a duplicate of it.
    $canonical = '<link rel="canonical" href="'
        . htmlspecialchars($meta['url'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"/>';
    if (preg_match('/<link\s+rel=["\']canonical["\'][^>]*>/i', $html)) {
        $html = preg_replace('/<link\s+rel=["\']canonical["\'][^>]*>/i', $canonical, $html, 1);
    } else {
        $html = preg_replace('/<\/head>/i', $canonical . '</head>', $html, 1);
    }
}

if (!empty($meta['type'])) {
    $html = jhor_set_meta($html, 'property', 'og:type', $meta['type']);
}

// The fallback shell is marked noindex so the placeholder itself stays out of
// the index. When it is standing in for a real project, that must be lifted.
if ($isRealPage) {
    $html = preg_replace(
        '/<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*["\']\s*\/?>/i',
        '<meta name="robots" content="index, follow"/>',
        $html,
        1
    );
}

header('Content-Type: text/html; charset=utf-8');
echo $html;
