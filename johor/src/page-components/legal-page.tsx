import Container from "../components/common/container";

type LegalPageProps = {
  title: string;
  htmlContent: string;
};

function hasHtmlMarkup(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function renderLegalContent(content: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return <p>لا يوجد محتوى متاح حالياً.</p>;
  }

  if (hasHtmlMarkup(trimmedContent)) {
    return <div dangerouslySetInnerHTML={{ __html: trimmedContent }} />;
  }

  return trimmedContent.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index} className="whitespace-pre-line">
      {paragraph.trim()}
    </p>
  ));
}

export default function LegalPage({ title, htmlContent }: LegalPageProps) {
  return (
    <main className="bg-(--primary-shades-02) pb-fluid-8 pt-[calc(var(--header-overlay-offset)+var(--space-fluid-6))] text-white">
      <Container>
        <section className="mx-auto max-w-4xl rounded-3xl border border-white/12 bg-white/5 p-6 md:p-10">
          <h1 className="font-hero text-fluid-3xl leading-tight">{title}</h1>
          <article dir="rtl" className="legal-content mt-6 text-fluid-base leading-8 text-white/90">
            {renderLegalContent(htmlContent)}
          </article>
        </section>
      </Container>
    </main>
  );
}
