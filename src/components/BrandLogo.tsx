import { cn } from "@/utils/cn";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  alt?: string;
};

export default function BrandLogo({
  className,
  imageClassName,
  alt = "TurfBD logo",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/brand-logo.png"
        alt={alt}
        className={cn("block h-full w-full object-contain", imageClassName)}
      />
    </span>
  );
}
