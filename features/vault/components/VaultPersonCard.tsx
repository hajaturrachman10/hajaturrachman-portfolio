"use client";

import { motion } from "framer-motion";
import { ImageWithShimmer } from "@/components/ui/ImageWithShimmer";

export type PersonProps = {
  name: string;
  role: string;
  image: string;
  story: string;
};

export function VaultPersonCard({ person, index }: { person: PersonProps; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line/60 bg-surface/70 p-4 transition duration-300 hover:border-primary/40 hover:bg-surface/90 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/10">
          <ImageWithShimmer
            src={person.image}
            alt={person.name}
            fill
            sizes="56px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="font-display text-base font-black text-text truncate">
            {person.name}
          </h5>
          <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary mt-1">
            {person.role}
          </span>
        </div>
      </div>
      <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-muted line-clamp-4">
        {person.story}
      </p>
    </motion.div>
  );
}
