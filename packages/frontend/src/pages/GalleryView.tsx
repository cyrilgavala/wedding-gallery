import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Photo } from '../api/client';
import { usePhotos, useThumbnails, usePhotoUrl } from '../hooks';
import Loader from '../components/Loader';
import './GalleryView.css';

const GalleryView = () => {
  const { t } = useTranslation();
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Fetch photos
  const {
    data: photosData,
    isLoading: photosLoading,
    error: photosError,
  } = usePhotos(sectionId);

  const photos = photosData?.photos || [];
  const paths = photos.map(p => p.path);

  // Fetch thumbnails (dependent on photos being loaded)
  const {
    data: thumbnails = {},
    isLoading: thumbnailsLoading,
  } = useThumbnails(sectionId, paths, !!photosData?.photos.length);

  // Fetch photo URL (only when a photo is selected)
  const {
    data: photoUrlData,
    isLoading: photoUrlLoading,
  } = usePhotoUrl(sectionId, selectedPhoto?.path);

  const sectionName = photosData?.section.name || '';
  const loading = photosLoading || thumbnailsLoading;
  const error = photosError
    ? (photosError as any).response?.status === 403
      ? t('gallery.noAccess')
      : t('gallery.loadError')
    : '';

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const getThumbnailUrl = (photo: Photo): string => {
    const thumbnailKey = photo.path.toLowerCase();
    return thumbnails[thumbnailKey] || '';
  };

  if (loading) {
    return <Loader message={t('loader.loadingGallery')} />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{`${error} ${t('gallery.clickToGoBack')}`}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="gallery-view">
        <div className="gallery-header">
          <button onClick={() => navigate('/')} className="back-btn">
            ← {t('common.back')}
          </button>
          <h2>{sectionName}</h2>
          <p className="photo-count">{t('gallery.photoCount', { count: photos.length })}</p>
        </div>

        {photos.length === 0 ? (
          <div className="card">
            <p>{t('gallery.noPhotos')}</p>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="photo-card"
                onClick={() => handlePhotoClick(photo)}
              >
                {getThumbnailUrl(photo) ? (
                  <div className="photo-thumbnail">
                    <img
                      src={getThumbnailUrl(photo)}
                      alt={photo.name}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <span className="photo-icon">📷</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedPhoto && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
              <div className="modal-body">
                {photoUrlLoading ? (
                  <Loader message={t('loader.loadingPhoto')} size="small" />
                ) : photoUrlData ? (
                  <>
                    <img src={photoUrlData} alt={selectedPhoto.name} />
                    <div className="modal-footer">
                      <p>{selectedPhoto.name}</p>
                      <a
                        href={photoUrlData}
                        download={selectedPhoto.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-btn"
                      >
                        {t('common.download')}
                      </a>
                    </div>
                  </>
                ) : (
                  <p>{t('gallery.failedLoadPhoto')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;