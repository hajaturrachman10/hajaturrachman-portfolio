import { LocationBadges } from "@/components/ui/LocationBadges";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  showLocations?: boolean;
  as?: "h1" | "h2";
};

export function SectionHeader({
  title,
  description,
  centered = false,
  showLocations = false,
  as: Tag = "h2"
}: SectionHeaderProps) {
  return (
    <div
      className={
        centered
          ? "mx-auto mb-5 sm:mb-8 lg:mb-10 max-w-3xl text-center flex flex-col items-center"
          : "mb-5 sm:mb-8 lg:mb-10 max-w-3xl flex flex-col items-start"
      }
    >
      <Tag className="section-title">{title}</Tag>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base sm:leading-8 sm:mt-4">
          {description}
        </p>
      ) : null}
      {showLocations && (
        <div className={centered ? "flex justify-center" : ""}>
          <LocationBadges />
        </div>
      )}
    </div>
  );
}
