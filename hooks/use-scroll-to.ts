import { useCallback } from "react";

export const useScrollTo = () => {
  const scrollToSection = useCallback((elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);

    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      console.warn(`Element with id "${elementId}" not found.`);
    }
  }, []);

  return scrollToSection;
};
