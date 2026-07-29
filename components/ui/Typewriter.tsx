"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterProps = {
  words: string[];
};

export function Typewriter({ words }: TypewriterProps) {
  const safeWords = useMemo(() => words.filter(Boolean), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (safeWords.length === 0) return;

    const currentWord = safeWords[wordIndex] ?? "";
    const finishedTyping = !isDeleting && letterIndex === currentWord.length;
    const finishedDeleting = isDeleting && letterIndex === 0;

    const timeout = window.setTimeout(
      () => {
        if (finishedTyping) {
          setIsDeleting(true);
          return;
        }

        if (finishedDeleting) {
          setIsDeleting(false);
          setWordIndex((current) => (current + 1) % safeWords.length);
          return;
        }

        setLetterIndex((current) => current + (isDeleting ? -1 : 1));
      },
      finishedTyping ? 1450 : isDeleting ? 34 : 72
    );

    return () => window.clearTimeout(timeout);
  }, [isDeleting, letterIndex, safeWords, wordIndex]);

  const currentWord = safeWords[wordIndex] ?? "";

  return (
    <span className="inline-block w-full align-middle">
      <span className="gradient-text break-words">{currentWord.slice(0, letterIndex)}</span>
      <span className="inline-block ml-1 h-6 w-0.5 align-middle animate-pulse rounded-full bg-primary" />
    </span>
  );
}
