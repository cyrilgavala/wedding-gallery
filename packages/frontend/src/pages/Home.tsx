import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/client';
import { useSections, useGalleries } from '../hooks';
import Loader from '../components/Loader';
import welcomeImage from '../images/welcome-image.png';
import './Home.css';

interface HomeProps {
  onAuthUpdate: () => void;
}

const Home = ({ onAuthUpdate }: HomeProps) => {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [passphrase, setPassphrase] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Fetch sections
  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    refetch: refetchSections,
  } = useSections();

  // Fetch galleries
  const {
    data: galleriesData,
    isLoading: galleriesLoading,
    refetch: refetchGalleries,
  } = useGalleries();

  const sections = sectionsData?.sections || [];
  const galleries = galleriesData?.galleries || [];
  const loading = sectionsLoading || galleriesLoading;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSection) {
      setError(t('home.unlock.errorSelect'));
      return;
    }

    setVerifying(true);
    try {
      await authApi.verifyPassphrase(selectedSection, passphrase);
      setSuccess(t('home.unlock.successGranted'));
      setPassphrase('');
      onAuthUpdate();

      // Refetch sections and galleries to get updated data
      await Promise.all([refetchSections(), refetchGalleries()]);

      setTimeout(() => {
        navigate(`/gallery/${selectedSection}`);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('home.unlock.errorInvalid'));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <Loader message={t('loader.loadingSections')} />;
  }

  const authorizedSections = sections.filter(s => s.isAuthorized);
  const unauthorizedSections = sections.filter(s => !s.isAuthorized);

  return (
    <div className="container">
      <div className="home">
        <div className="welcome-section card">
          <h2>{t('home.welcome.title')}</h2>
          <img src={welcomeImage} alt="Welcome" className="welcome-image" />
          <p>
            {t('home.welcome.description')}
          </p>
        </div>

        {authorizedSections.length > 0 && (
          <div className="authorized-galleries">
            <h3>{t('home.galleries.title')}</h3>
            <div className="gallery-grid">
              {galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  className="gallery-card"
                  onClick={() => navigate(`/gallery/${gallery.id}`)}
                >
                  <div className="gallery-info">
                    <h4>{gallery.name}</h4>
                    <p>{t('home.galleries.photoCount', { count: gallery.photoCount })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {unauthorizedSections.length > 0 && (
          <div className="unlock-section card">
            <h3>{t('home.unlock.title')}</h3>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label htmlFor="section">{t('home.unlock.selectSection')}</label>
                <select
                  id="section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={verifying}
                >
                  <option value="">{t('home.unlock.chooseSection')}</option>
                  {unauthorizedSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="passphrase">{t('home.unlock.passphrase')}</label>
                <input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder={t('home.unlock.passphraseePlaceholder')}
                  disabled={verifying}
                />
              </div>

              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}

              <button type="submit" disabled={verifying} className="verify-btn">
                {verifying ? t('home.unlock.verifying') : t('home.unlock.unlockButton')}
              </button>
            </form>
          </div>
        )}

        {sections.length === 0 && (
          <div className="card">
            <p>{t('home.noSections')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;