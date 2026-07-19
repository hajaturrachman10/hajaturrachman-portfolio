"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ImageWithShimmerProps = Omit<ImageProps, "onLoad">;

export function ImageWithShimmer({ className, alt, ...props }: ImageWithShimmerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", isLoading && "skeleton-shimmer")}>
      <Image
        alt={alt}
        className={cn(
          "transition-all duration-500 ease-out",
          isLoading ? "opacity-0 scale-[0.98] blur-[2px]" : "opacity-100 scale-100 blur-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
}
