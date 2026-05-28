import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "it", label: "Italiano", shortLabel: "IT" },
  { code: "es", label: "Spanish", shortLabel: "ES" },
  { code: "fr", label: "French", shortLabel: "FR" },
  { code: "de", label: "Deutsch", shortLabel: "DE" },
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

  const currentLanguage = languages.find((item) => item.code === language) ?? languages[0];

  const changeLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2.5"
          aria-label={`Change language. Current language: ${currentLanguage.label}`}
          title={`Change language. Current language: ${currentLanguage.label}`}
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-semibold">{currentLanguage.shortLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.code}
            className="gap-2"
            onClick={() => changeLanguage(item.code)}
          >
            <span className="flex-1">{item.label}</span>
            {item.code === language && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
