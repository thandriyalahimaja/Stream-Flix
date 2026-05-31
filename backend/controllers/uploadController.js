import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as cloud from '../services/cloudinaryService.js';

/**
 * POST /api/upload/poster — Upload movie poster image
 */
export const uploadPoster = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided.');
  const result = await cloud.uploadImage(req.file.buffer, { subfolder: 'posters' });
  res.json({ success: true, data: result });
});

/**
 * POST /api/upload/banner — Upload movie backdrop/banner
 */
export const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided.');
  const result = await cloud.uploadImage(req.file.buffer, { subfolder: 'banners' });
  res.json({ success: true, data: result });
});

/**
 * POST /api/upload/trailer — Upload movie trailer video
 */
export const uploadTrailer = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided.');
  const result = await cloud.uploadVideo(req.file.buffer, { subfolder: 'trailers' });
  res.json({ success: true, data: result });
});

/**
 * POST /api/upload/avatar — Upload user avatar (replaces old)
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file provided.');

  const User = (await import('../models/User.js')).default;
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Delete old avatar if exists
  const oldPublicId = user.avatar?.publicId;
  const result = oldPublicId
    ? await cloud.replaceImage(oldPublicId, req.file.buffer, { subfolder: 'avatars' })
    : await cloud.uploadImage(req.file.buffer, { subfolder: 'avatars' });

  user.avatar = { url: result.secureUrl, publicId: result.publicId };
  await user.save();

  res.json({ success: true, data: { avatar: user.avatar } });
});

/**
 * DELETE /api/upload/:publicId — Delete a Cloudinary asset
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const resourceType = req.query.type || 'image';
  if (!publicId) throw new ApiError(400, 'Public ID required.');

  // Cloudinary public IDs can have slashes; the route uses a wildcard
  const fullId = decodeURIComponent(publicId);
  await cloud.deleteAsset(fullId, resourceType);

  res.json({ success: true, message: 'Asset deleted.' });
});
