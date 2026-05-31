import { useState, useRef } from 'react';
import { Upload, X, Film, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import uploadService from '@/services/uploadService';

/**
 * A beautiful, premium media uploader component with drag-and-drop support,
 * real-time upload status, type validation, and previewing.
 */
export default function MediaUploader({
  type = 'poster', // 'poster' | 'backdrop' | 'trailer' | 'avatar'
  label = 'Upload Media',
  onUploadSuccess,
  previewUrl = null,
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(previewUrl);
  const fileInputRef = useRef(null);

  const isVideo = type === 'trailer';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;

    // Check size limit: image <= 10MB, video <= 100MB
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Max size allowed is ${isVideo ? '100MB' : '10MB'}.`);
      return false;
    }

    // Check type
    if (isVideo) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file (mp4, webm, etc.).');
        return false;
      }
    } else {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file (jpg, png, webp, etc.).');
        return false;
      }
    }

    return true;
  };

  const uploadFile = async (selectedFile) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      let response;
      if (type === 'poster') {
        response = await uploadService.uploadPoster(selectedFile);
      } else if (type === 'backdrop') {
        response = await uploadService.uploadBanner(selectedFile);
      } else if (type === 'trailer') {
        response = await uploadService.uploadTrailer(selectedFile);
      } else if (type === 'avatar') {
        response = await uploadService.uploadAvatar(selectedFile);
      }

      if (response && response.success) {
        setSuccess(true);
        let url = '';
        let publicId = '';
        let duration = null;

        if (response.data) {
          if (response.data.avatar) {
            url = response.data.avatar.url;
            publicId = response.data.avatar.publicId;
          } else {
            url = response.data.secureUrl;
            publicId = response.data.publicId;
            duration = response.data.duration || null;
          }
        }

        const mediaData = {
          url,
          publicId,
          ...(isVideo && { duration }),
        };
        setCurrentPreview(url);
        if (onUploadSuccess) {
          onUploadSuccess(mediaData);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        uploadFile(selectedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        uploadFile(selectedFile);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setFile(null);
    setCurrentPreview(null);
    setSuccess(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--cw-text2)' }}>
        {label}
      </label>

      {currentPreview ? (
        <div className="relative rounded-2xl overflow-hidden glass border-2 border-dashed flex items-center justify-center p-2" style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 15%, transparent)' }}>
          {isVideo ? (
            <video
              src={currentPreview}
              controls
              className="w-full max-h-48 rounded-xl object-contain bg-black"
            />
          ) : (
            <img
              src={currentPreview}
              alt="Uploaded Preview"
              className="w-full max-h-48 rounded-xl object-cover"
            />
          )}
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5 backdrop-blur-sm">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Uploaded successfully
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'scale-[1.01]'
              : 'hover:scale-[1.005]'
          }`}
          style={{
            borderColor: dragActive
              ? 'var(--cw-button)'
              : 'color-mix(in srgb, var(--cw-text) 20%, transparent)',
            background: dragActive
              ? 'color-mix(in srgb, var(--cw-button) 5%, transparent)'
              : 'color-mix(in srgb, var(--cw-text) 3%, transparent)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={isVideo ? 'video/*' : 'image/*'}
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cw-button)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--cw-text)' }}>
                Uploading to Cloudinary...
              </p>
              <p className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                Please wait, processing media pipelines
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                style={{ background: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
              >
                {isVideo ? (
                  <Film size={22} style={{ color: 'var(--cw-button)' }} />
                ) : (
                  <ImageIcon size={22} style={{ color: 'var(--cw-button)' }} />
                )}
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--cw-text)' }}>
                Drag & drop or <span className="underline" style={{ color: 'var(--cw-button)' }}>browse</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--cw-text2)' }}>
                Supports {isVideo ? 'MP4, WebM up to 100MB' : 'JPG, PNG, WebP up to 10MB'}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs flex items-start gap-1.5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-medium">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
