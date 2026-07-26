import Image from "next/image";
import type { PartnerLogo } from "../../../lib/api";

const defaultPartnerBadges: PartnerLogo[] = [
  {
    name: "Google Partner",
    alt: "Google Partner",
    image: "/google partner.png",
  },
  {
    name: "Meta Business Partner",
    alt: "Meta Business Partner",
    image: "/meta-business-partner-seeklogo.png",
  },
];

function isMetaBadge(item: PartnerLogo) {
  const value = `${item.name} ${item.alt}`.toLowerCase();
  return value.includes("meta");
}

export function resolvePartnerBadges(logos?: PartnerLogo[]) {
  const validLogos = (logos ?? []).filter((item) => item.image?.trim());
  return validLogos.length > 0 ? validLogos : defaultPartnerBadges;
}

export function PartnerBadges({
  logos,
  className = "",
  itemClassName = "",
  imageClassName = "",
}: {
  logos?: PartnerLogo[];
  className?: string;
  itemClassName?: string;
  imageClassName?: string;
}) {
  const items = resolvePartnerBadges(logos).slice(0, 2);

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={`${item.name}-${item.image}`} className={itemClassName}>
          <Image
            src={item.image}
            alt={item.alt || item.name}
            width={170}
            height={64}
            className={`${imageClassName} ${isMetaBadge(item) ? "[filter:brightness(0)_invert(1)]" : ""}`.trim()}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
