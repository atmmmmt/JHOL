import { motion } from "framer-motion";
import {
  BarChart3,
  Facebook,
  Ghost,
  Instagram,
  Megaphone,
  Music2,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { fadeUp } from "../../../lib/motion";
import AboutStartJourneySection from "../about-sections/about-start-journey-section";
import Container from "../../common/container";
import { useCursorMask } from "../../common/cursor-mask-context";

type CampaignOffer = {
  title: string;
  items: string[];
  price: string;
  note: string;
  keyword: string;
  keywordIcon: LucideIcon;
  platforms: LucideIcon[];
  discountNote?: string;
};

const CAMPAIGN_OFFERS: CampaignOffer[] = [
  {
    title: "حملات السناب شات",
    items: [
      "إنشاء حساب إعلاني.",
      "إنشاء مدير الإعلانات وربطه.",
      "عدد لا محدود من الإعلانات.",
      "متابعة يومية وتحسين يومي.",
      "إرشادات المحتوى.",
      "المدة: 30 يوم.",
    ],
    price: "1200",
    note: "غير شامل تمويل المنصة",
    keyword: "استهداف دقيق",
    keywordIcon: Target,
    platforms: [Ghost],
  },
  {
    title: "حملات الانستغرام والفيسبوك",
    items: [
      "إنشاء حساب إعلاني.",
      "إنشاء مدير الإعلانات وربطه.",
      "عدد لا محدود من الإعلانات.",
      "متابعة يومية وتحسين يومي.",
      "إرشادات المحتوى.",
      "كتابة بايو للحساب.",
      "المدة: 30 يوم.",
    ],
    price: "1200",
    note: "غير شامل تمويل المنصة",
    keyword: "دراسة الحالة",
    keywordIcon: BarChart3,
    platforms: [Instagram, Facebook],
  },
  {
    title: "حملات التيك توك",
    items: [
      "إنشاء حساب إعلاني.",
      "إنشاء مدير الإعلانات وربطه.",
      "عدد لا محدود من الإعلانات.",
      "متابعة يومية وتحسين يومي.",
      "إرشادات المحتوى.",
      "كتابة بايو للحساب.",
      "المدة: 30 يوم.",
    ],
    price: "1200",
    note: "غير شامل تمويل المنصة",
    keyword: "زيادة مبيعات",
    keywordIcon: TrendingUp,
    platforms: [Music2],
  },
  {
    title: "جميع المنصات",
    items: [
      "إدارة حملات موحّدة على أكثر من منصة.",
      "متابعة أداء يومية وتوجيه مستمر للمحتوى.",
      "تنسيق استراتيجية موحّدة بين القنوات.",
      "تقارير أداء دورية واضحة.",
    ],
    price: "3000",
    note: "غير شامل تمويل المنصة",
    discountNote: "خصم بمقدار 600 ريال",
    keyword: "توعية بالعلامة",
    keywordIcon: Megaphone,
    platforms: [Instagram, Facebook, Music2, Ghost],
  },
];

const TILE_GRADIENTS = [
  "from-[#facc15] via-[#f59e0b] to-[#a16207]",
  "from-[#ec4899] via-[#a21caf] to-[#312e81]",
  "from-[#22d3ee] via-[#0ea5e9] to-[#1d4ed8]",
  "from-[#60a5fa] via-[#3b82f6] to-[#1d4ed8]",
];

function splitKeyword(keyword: string) {
  const words = keyword.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { first: keyword, second: "" };
  }

  const splitIndex = Math.ceil(words.length / 2);
  return {
    first: words.slice(0, splitIndex).join(" "),
    second: words.slice(splitIndex).join(" "),
  };
}

function PackageDetailCampaignOffersSection() {
  const { setMaskMode } = useCursorMask();

  return (
    <>
      <section
        dir="rtl"
        className="relative overflow-hidden bg-linear-to-br from-[#eef2fb] via-[#edf3ff] to-[#f7eff8] py-fluid-7 text-(--primary-shades-03)"
      >
        {/* <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_right,rgba(34,27,79,0.18)_0_12%,transparent_12%_100%)] opacity-30" />
          <div className="absolute -right-[8%] top-[6%] h-80 w-80 rounded-full bg-(--secondary-shades-08)/14 blur-[140px]" />
          <div className="absolute -left-[10%] bottom-[-10%] h-96 w-96 rounded-full bg-(--primary-shades-04)/14 blur-[150px]" />
        </div> */}

        <Container className="relative z-10">
          <div className="grid gap-fluid-5">
            {CAMPAIGN_OFFERS.map((offer, offerIndex) => {
              const KeywordIcon = offer.keywordIcon;
              const { first, second } = splitKeyword(offer.keyword);

              return (
                <motion.article
                  key={offer.title}
                  className="relative overflow-hidden py-fluid-8"
                  {...fadeUp(0.08 + offerIndex * 0.05, 24, 0.62)}
                  onMouseEnter={() => setMaskMode("cta")}
                  onMouseLeave={() => setMaskMode("none")}
                  onFocus={() => setMaskMode("cta")}
                  onBlur={() => setMaskMode("none")}
                >
                  <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 right-[14%] h-56 w-56 rounded-full bg-[#f43f7b]/16 blur-[95px]" />
                    <div className="absolute -bottom-24 left-[10%] h-56 w-56 rounded-full bg-[#22d3ee]/14 blur-[95px]" />
                  </div>

                  <div className="relative z-10 grid items-center gap-fluid-5 [direction:ltr] lg:grid-cols-[17rem_minmax(0,1fr)]">
                    <motion.aside
                      className="mx-auto flex h-[11.5rem] w-[11.5rem] max-w-full flex-col items-center justify-center border-2 border-dashed border-(--primary-shades-03)/32 bg-linear-to-br from-[#eef2fb]/92 via-[#edf3ff]/90 to-[#f7eff8]/92 px-5 text-center text-[#ff3f7f] lg:h-[13rem] lg:w-[13rem]"
                      style={{ borderRadius: "58% 42% 57% 43% / 44% 61% 39% 56%" }}
                      animate={{ y: [0, -8, 0], rotate: [-4, 2, -4] }}
                      transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
                    >
                      <KeywordIcon className="h-7 w-7 text-(--primary-shades-03)/75" />
                      <p className="mt-3 text-[clamp(1.7rem,3.1vw,2.7rem)] font-bold leading-[1.05]">
                        {first}
                        {second ? <><br />{second}</> : null}
                      </p>
                    </motion.aside>

                    <div className="min-w-0">
                      <div dir="rtl" className="flex flex-wrap items-center justify-end gap-3">
                        <h3 className="max-md:max-w-full bg-linear-to-b from-(--secondary-shades-08) to-(--primary-shades-04) bg-clip-text px-0 py-0 text-[clamp(1.45rem,3vw,2.2rem)] font-semibold leading-tight text-transparent">
                          {offer.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          {offer.platforms.map((PlatformIcon, platformIndex) => (
                            <motion.span
                              key={`${offer.title}-${platformIndex}`}
                              className={`relative inline-flex h-17 w-17 items-center justify-center rounded-[1.1rem] border border-white/20 bg-linear-to-br ${
                                TILE_GRADIENTS[platformIndex % TILE_GRADIENTS.length]
                              }`}
                              style={{ transform: "perspective(700px) rotateX(8deg) rotateY(-10deg)" }}
                              animate={{ y: [0, -8, 0], rotate: [-4, 2, -4] }}
                              transition={{
                                duration: 3.4,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: platformIndex * 0.18,
                              }}
                            >
                              <span className="pointer-events-none absolute inset-[4px] rounded-[0.85rem] border border-white/22" />
                              <PlatformIcon className="relative h-9 w-9 text-white" />
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      <div
                        dir="rtl"
                        className="mt-fluid-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
                      >
                        <ul
                          dir="rtl"
                          className="w-full min-w-0 flex-1 list-outside space-y-1.5 pr-6 text-right text-fluid-base leading-[1.95] text-(--primary-shades-03) marker:text-[#ff3f7f] lg:max-w-[42rem]"
                        >
                          {offer.items.map((item) => (
                            <li key={`${offer.title}-${item}`} className="list-disc whitespace-normal break-words">
                              {item}
                            </li>
                          ))}
                        </ul>

                        <div className="w-fit shrink-0 self-end rounded-2xl border border-[#ff5f96]/55 bg-[#111652]/80 px-4 py-3 text-center backdrop-blur-sm lg:self-auto">
                          <p className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-none text-[#ff3f7f]">
                            {offer.price}
                            <span className="mr-1 text-fluid-xl">SAR</span>
                          </p>
                          <p className="mt-1 rounded-full border border-dashed border-white/45 px-3 py-1 text-fluid-sm text-white/80">
                            {offer.discountNote ?? offer.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </Container>
      </section>

      <AboutStartJourneySection
        content={{}}
        journey={{
          title: "ابدأ رحلتك معنا",
          closing:
            "جهور هي أكثر من مجرد اسم في عالم التسويق الرقمي؛ هي صوت العميل الذي يرتفع عاليًا مع مكبّر الصوت، وهي السهم الذي يرمز إلى التطور المستمر والتسويق الفعّال. في جهور نرسم الابتسامة على وجوه عملائنا، حيث يعكس الشعار خدماتنا إبداعًا وثقةً. نحن نرتقي بالعلامات التجارية إلى مستويات جديدة، ونبني معها جسور النجاح والتميّز.",
          cta: "تواصل معنا لإكمال مشروعك.",
        }}
      />
    </>
  );
}

export default PackageDetailCampaignOffersSection;
