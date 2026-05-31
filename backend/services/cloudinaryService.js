import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Upload an image buffer to Cloudinary.
 *
 * @param {Buffer} imageBuffer - The raw image data to upload
 * @param {Object} [options] - Optional Cloudinary upload options
 * @param {string} [options.subfolder] - Subfolder within the main Cloudinary folder
 * @returns {Promise<{publicId, secureUrl, format, bytes}>}
 */
export async function uploadImage(imageBuffer, options = {}) {
  const uploadFolder = `${env.CLOUDINARY_FOLDER}/${options.subfolder || 'images'}`;

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          ...options,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(imageBuffer);
    });

    return {
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    };
  } catch (uploadError) {
    throw new ApiError(500, `Image upload failed: ${uploadError.message}`);
  }
}

/**
 * Upload a video buffer to Cloudinary.
 *
 * @param {Buffer} videoBuffer - The raw video data to upload
 * @param {Object} [options] - Optional Cloudinary upload options
 * @returns {Promise<{publicId, secureUrl, format, bytes, duration}>}
 */
export async function uploadVideo(videoBuffer, options = {}) {
  const uploadFolder = `${env.CLOUDINARY_FOLDER}/${options.subfolder || 'videos'}`;

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'video',
          ...options,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(videoBuffer);
    });

    return {
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      duration: Math.round(uploadResult.duration || 0),
    };
  } catch (uploadError) {
    throw new ApiError(500, `Video upload failed: ${uploadError.message}`);
  }
}

/**
 * Delete a Cloudinary asset by its public ID.
 * Silently ignores failures since delete is a cleanup operation.
 *
 * @param {string} publicId - The Cloudinary asset public ID
 * @param {'image' | 'video'} resourceType - The type of asset
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  if (!publicId) return;
  // Cloudinary delete failures are non-critical — asset may already be removed
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {});
}

/**
 * Replace an existing Cloudinary image — deletes old, uploads new.
 *
 * @param {string} oldPublicId - Public ID of the asset to replace
 * @param {Buffer} newImageBuffer - New image data to upload
 * @param {Object} [options] - Upload options
 */
export async function replaceImage(oldPublicId, newImageBuffer, options = {}) {
  await deleteAsset(oldPublicId, 'image');
  return uploadImage(newImageBuffer, options);
}

/**
 * Replace an existing Cloudinary video — deletes old, uploads new.
 *
 * @param {string} oldPublicId - Public ID of the asset to replace
 * @param {Buffer} newVideoBuffer - New video data to upload
 * @param {Object} [options] - Upload options
 */
export async function replaceVideo(oldPublicId, newVideoBuffer, options = {}) {
  await deleteAsset(oldPublicId, 'video');
  return uploadVideo(newVideoBuffer, options);
}

/**
 * Generate an optimized Cloudinary URL with automatic format and quality selection.
 * Appends Cloudinary transformation parameters for best performance.
 *
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - Optimized URL
 */
export function optimizedUrl(url) {
  if (!url || !url.includes('cloudinary')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}
