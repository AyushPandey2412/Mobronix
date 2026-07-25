import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  mark = false,
  light = false,
}: {
  className?: string;
  mark?: boolean;
  light?: boolean;
}) {
  if (mark) {
    // logo-mark has 13% transparent padding on the left.
    // Shift left by 5px and clip to 32px (w-8) to align the icon mark.
    return (
      <span className={cn("relative inline-block h-10 w-8 shrink-0 overflow-hidden", className)}>
        <div className="absolute top-0 left-[-5px] w-10 h-10">
          <Image
            src="/logo-mark.png"
            alt="Mobronix Mark"
            fill
            priority
            sizes="40px"
            className={cn("object-contain", light && "brightness-0 invert")}
          />
        </div>
      </span>
    );
  }

  // logo banner has 15% (31px of 208px) transparent padding on the left.
  // Shift left by 31px and clip to 142px width to align the logo text perfectly.
  return (
    <span className={cn("relative inline-block h-10 w-[142px] shrink-0 overflow-hidden", className)}>
      <div className="absolute top-0 left-[-31px] w-[208px] h-10">
        <Image
          src="/logo.png"
          alt="Mobronix Logo"
          fill
          priority
          sizes="208px"
          className={cn("object-contain object-left", light && "brightness-0 invert")}
        />
      </div>
    </span>
  );
}
