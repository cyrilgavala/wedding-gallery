import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/client';
import LanguageSwitcher from './LanguageSwitcher';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  authorizedSections: string[];
  onAuthUpdate: () => void;
}

const Layout = ({ children, authorizedSections, onAuthUpdate }: LayoutProps) => {
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      onAuthUpdate();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>{t('layout.title')}</h1>
          </Link>
          <div className="header-right">
            <LanguageSwitcher />
            {authorizedSections.length > 0 && (
              <div className="header-actions">
                <span className="auth-status">
                  ✓ {t(authorizedSections.length === 1 ? 'layout.sectionUnlocked' : 'layout.sectionsUnlocked', { count: authorizedSections.length })}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>{t('layout.footer')}</p>
      </footer>
    </div>
  );
};

export default Layout;

