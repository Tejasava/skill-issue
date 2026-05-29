import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  cursorClassName?: string;
}

export function TypewriterEffect({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = "",
  cursorClassName = ""
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    let timeout: NodeJS.Timeout;

    const typeNextCharacter = () => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        if (currentIndex === text.length) {
          setIsComplete(true);
        }
        currentIndex++;
        timeout = setTimeout(typeNextCharacter, speed);
      }
    };

    // Start typing after initial delay
    const startTimeout = setTimeout(typeNextCharacter, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [text, delay, speed]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className={`inline-block w-1 h-10 bg-primary ml-1 ${cursorClassName}`}
        />
      )}
    </span>
  );
}
