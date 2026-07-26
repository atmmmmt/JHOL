# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Fluid Typography and Spacing

This project uses Tailwind v4 CSS-first tokens in [`src/index.css`](src/index.css) to provide smooth responsive scaling with `clamp()` and no breakpoint font-size classes.
It also includes two font families:

- `font-inter` for body and UI text
- `font-poppins` for headings and display text

### Typography scale

Available classes:

- `text-fluid-xs`
- `text-fluid-sm`
- `text-fluid-base`
- `text-fluid-lg`
- `text-fluid-xl`
- `text-fluid-2xl`
- `text-fluid-3xl`
- `text-fluid-4xl`

Example:

```tsx
<h1 className="text-fluid-4xl font-bold leading-tight">Fluid heading</h1>
<p className="text-fluid-base leading-relaxed">Fluid body copy</p>
```

### Fluid spacing scale

Spacing tokens are mapped to Tailwind spacing utilities as:

- `*-fluid-1` through `*-fluid-8`
- Examples: `p-fluid-5`, `px-fluid-4`, `py-fluid-2`, `mt-fluid-3`, `gap-fluid-4`

Example:

```tsx
<section className="p-fluid-6">
  <div className="grid gap-fluid-4">
    <article className="p-fluid-5">...</article>
  </div>
</section>
```
