import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "am", label: "Amharic", flag: "🇪🇹" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

const getSavedLanguage = (): LanguageCode => {
  const savedLanguage = localStorage.getItem("language");
  return languages.some((language) => language.code === savedLanguage)
    ? (savedLanguage as LanguageCode)
    : "en";
};

export const LanguageToggle = () => {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const initialLanguage = getSavedLanguage();
    setLanguage(initialLanguage);
    document.documentElement.lang = initialLanguage;
  }, []);

  const changeLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  return (
    <div className="flex items-center rounded-md border border-border bg-background p-0.5">
      {languages.map((item) => {
        const isSelected = item.code === language;

        return (
          <Button
            key={item.code}
            type="button"
            variant={isSelected ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 text-base"
            aria-label={`Switch language to ${item.label}`}
            aria-pressed={isSelected}
            title={`Switch language to ${item.label}`}
            onClick={() => changeLanguage(item.code)}
          >
            <span aria-hidden="true">{item.flag}</span>
          </Button>
        );
      })}
    </div>
  );
};
