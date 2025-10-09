import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    return (
        <div className="relative group">
            <button
                type="button"
                className="inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs hover:bg-muted"
            >
                <span>{languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}</span>
                <span className="hidden sm:inline">
                    {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((language) => (
                    <button
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted first:rounded-t-lg last:rounded-b-lg ${i18n.language === language.code ? 'bg-accent text-accent-foreground' : ''
                            }`}
                    >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                        {i18n.language === language.code && (
                            <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
