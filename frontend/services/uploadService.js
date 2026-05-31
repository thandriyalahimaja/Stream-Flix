/**
 * Media Upload API service
 */
import api from './api';

const uploadService = {
  uploadPoster: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/poster', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBanner: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadTrailer: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/trailer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteMedia: (publicId) => {
    return api.delete(`/upload/${encodeURIComponent(publicId)}`);
  },
};

export default uploadService;
