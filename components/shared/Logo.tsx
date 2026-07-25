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
    return (
      <span className={cn("relative inline-block h-10 w-10 shrink-0", className)}>
        <Image
          src="/logo-mark.png"
          alt="Mobronix Mark"
          fill
          priority
          sizes="40px"
          className={cn("object-contain", light && "brightness-0 invert")}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block h-10 w-[200px] shrink-0", className)}>
      <Image
        src="/logo.png"
        alt="Mobronix Logo"
        fill
        priority
        sizes="200px"
        className={cn("object-contain object-left", light && "brightness-0 invert")}
      />
    </span>
  );
}
