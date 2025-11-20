import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('wedding-gallery-language', lng);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="lang-separator">|</span>
      <button
        className={`lang-btn ${i18n.language === 'sk' ? 'active' : ''}`}
        onClick={() => changeLanguage('sk')}
        aria-label="Prepnúť na slovenčinu"
      >
        SK
      </button>
    </div>
  );
};

export default LanguageSwitcher;

