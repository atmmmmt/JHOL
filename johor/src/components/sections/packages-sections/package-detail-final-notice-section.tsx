import AboutStartJourneySection from "../about-sections/about-start-journey-section";

function PackageDetailFinalNoticeSection() {
  return (
    <AboutStartJourneySection
      content={{}}
      showBottomImage={false}
      journey={{
        title: "NOTICE تنويه اخر مهم",
        intro: "ملاحظات مهمة قبل البدء:",
        points: [
          "الأسعار غير محدودة بالباقات السابقة ويمكن طلب سعر خاص للعملاء على حسب احتياجاتهم.",
          "نطاق العمل محدد لكل باقة.",
          "مدة التنفيذ تقديرية وتبدأ بعد اعتماد المشروع.",
          "نوفر خدمات إضافية وتخصيص حسب الطلب.",
        ],
      }}
    />
  );
}

export default PackageDetailFinalNoticeSection;
