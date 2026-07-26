import { motion } from "framer-motion";
import { fadeUp } from "../../../lib/motion";
import Container from "../../common/container";

const WHY_CHOOSE_POINTS = [
  "بناء علامة تجارية قوية",
  "تحسين الحضور الرقمي",
  "الوصول إلى الجمهور المستهدف",
  "تحقيق نتائج قابلة للقياس",
];

function ServicesStaticWhyChooseSection() {
  return (
    <motion.section className="bg-white py-fluid-8 text-(--primary-shades-03)" {...fadeUp(0, 36, 0.68)}>
      <Container>
        <motion.article dir="rtl" className="p-fluid-2 text-right" {...fadeUp(0.08, 28, 0.72)}>
          <h2 className="mb-fluid-4 text-fluid-xl font-semibold leading-[1.6] text-(--secondary-shades-08)">
            لماذا تختار خدمات جهور؟
          </h2>

          <p className="text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
            اختيارك لجهور يعني أنك تعمل مع فريق يجمع بين الإبداع والخبرة والاستراتيجية.
          </p>

          <p className="mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
            نحن نركز على تقديم حلول تساعد الشركات على:
          </p>

          <ul className="mt-fluid-3 space-y-2 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
            {WHY_CHOOSE_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-(--secondary-shades-08)" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-fluid-3 text-fluid-base leading-[1.9] text-(--primary-shades-03)/80">
            كل خدمة نقدمها مصممة لتكون جزءاً من منظومة متكاملة تدعم نمو مشروعك.
          </p>
        </motion.article>
      </Container>
    </motion.section>
  );
}

export default ServicesStaticWhyChooseSection;
