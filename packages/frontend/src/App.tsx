import { useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryClient } from './api/queryClient';
import { useAuthStatus } from './hooks';
import Layout from './components/Layout';
import Loader from './components/Loader';
import Home from './pages/Home';
import GalleryView from './pages/GalleryView';
import './i18n/config';
import './App.css';


const AppContent = () => {
  const { t } = useTranslation();
  const { data: authStatus, isLoading, refetch } = useAuthStatus();

  const handleAuthUpdate = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return <Loader message={t('loader.loadingGalleries')} size="large" />;
  }

  const authorizedSections = authStatus?.authorizedSections || [];

  return (
    <Layout authorizedSections={authorizedSections} onAuthUpdate={handleAuthUpdate}>
      <Routes>
        <Route path="/" element={<Home onAuthUpdate={handleAuthUpdate} />} />
        <Route path="/gallery/:sectionId" element={<GalleryView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;