import type { Metadata } from "next";
import Container from "../../src/components/common/container";
import { SITE_NAME } from "../../lib/api";
import { buildPageMetadata } from "../../lib/seo";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    description:
      "سياسة الكوكيز في جهور: أنواع الكوكيز، أغراض الاستخدام، وكيفية إدارة أو سحب الموافقة.",
    path: "/cookies-policy",
    title: `سياسة الكوكيز | ${SITE_NAME}`,
  });
}

export default function CookiesPolicyPage() {
  return (
    <main className="bg-(--primary-shades-02) pb-fluid-8 pt-[calc(var(--header-overlay-offset,88px)+var(--space-fluid-6))] text-white">
      <Container>
        <section className="mx-auto  rounded-3xl border border-white/12 bg-linear-to-br from-white/10 via-white/5 to-white/10 p-6 shadow-[0_22px_56px_rgba(8,6,22,0.35)] md:p-10">
          <p className="text-right text-sm font-medium tracking-[0.08em] text-(--secondary-shades-08)">
            COOKIES POLICY
          </p>
          <h1 className="mt-2 text-right font-hero text-fluid-3xl leading-tight">سياسة الكوكيز</h1>
          <article dir="rtl" className="legal-content mt-6 text-right text-fluid-base leading-8 text-white/90">
            <p>
              تشرح هذه السياسة كيفية استخدام ملفات تعريف الارتباط (Cookies) داخل
              موقع جهور، وما هي الخيارات المتاحة لك لإدارة تفضيلاتك.
            </p>
            <h2>1. ما هي الكوكيز؟</h2>
            <p>
              الكوكيز هي ملفات نصية صغيرة يتم حفظها في جهازك عند زيارة الموقع، وتساعد
              في تشغيل الخدمات وتحسين تجربتك.
            </p>
            <h2>2. أنواع الكوكيز التي نستخدمها</h2>
            <p>
              الكوكيز الضرورية: لازمة لعمل الموقع ولا يمكن تعطيلها من النظام.
              <br />
              الكوكيز التحليلية: لقياس الاستخدام وتحسين الأداء (مثل Google Analytics
              بعد الموافقة).
              <br />
              الكوكيز التسويقية: لقياس فاعلية الحملات وتخصيص المحتوى التسويقي.
            </p>
            <h2>3. أساس المعالجة والموافقة</h2>
            <p>
              لا يتم تفعيل الكوكيز التحليلية أو التسويقية قبل موافقتك الصريحة. يمكنك
              القبول، الرفض، أو التخصيص عند أول زيارة.
            </p>
            <h2>4. تعديل أو سحب الموافقة</h2>
            <p>
              يمكنك تعديل اختياراتك في أي وقت من خلال زر "إعدادات الكوكيز" الظاهر
              داخل الموقع أو من رابط الفوتر.
            </p>
            <h2>5. مدة الاحتفاظ</h2>
            <p>
              يتم حفظ تفضيلات الموافقة محليًا في متصفحك لتطبيق اختياراتك في الزيارات
              اللاحقة، ويمكنك حذفها من إعدادات المتصفح.
            </p>
            <h2>6. حقوق الخصوصية</h2>
            <p>
              إذا كنت ضمن نطاق GDPR أو أنظمة خصوصية مشابهة، يمكنك طلب معلومات إضافية
              أو ممارسة حقوقك المتعلقة بالبيانات عبر قنوات التواصل الرسمية في الموقع.
            </p>
          </article>
        </section>
      </Container>
    </main>
  );
}
