import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import MediaUploader from '@/components/MediaUploader';
import userService from '@/services/userService';
import authService from '@/services/authService';


/**
 * Row component for the preferences settings list.
 * Clickable rows show a "›" indicator; non-clickable rows are display-only.
 */
function PreferenceRow({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex justify-between items-center px-5 py-4 rounded-xl transition-all ${
        onClick ? 'hover:scale-[1.01] cursor-pointer' : 'cursor-default'
      }`}
      style={{ background: 'var(--cw-bg)', color: 'var(--cw-text)' }}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm" style={{ color: 'var(--cw-button)' }}>
        {value} {onClick && '›'}
      </span>
    </button>
  );
}

export default function Profile() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();


  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [genrePreferences, setGenrePreferences] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // Sync form fields with user data when loaded
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setGenrePreferences(user.preferences?.genres?.join(', ') || '');
    }
  }, [user]);

  const handleOpenEditModal = () => {
    setUpdateError(null);
    setUpdateSuccess(null);
    setCurrentPassword('');
    setNewPassword('');
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Update display name and genre preferences
      const genreArray = genrePreferences
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean);

      const profileRes = await userService.updateProfile({
        name: displayName,
        preferences: { genres: genreArray },
      });

      if (profileRes.success) {
        updateUserProfile(profileRes.data);
      }

      // Update password only if both fields are filled
      if (currentPassword && newPassword) {
        await authService.changePassword({ currentPassword, newPassword });
      }

      setUpdateSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Called by MediaUploader when avatar upload completes
  const handleAvatarUploadSuccess = (uploadedMedia) => {
    updateUserProfile({ ...user, avatar: uploadedMedia });
    toast.success('Profile picture updated successfully!');
  };


  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'var(--cw-card)',
            border: '1px solid color-mix(in srgb, var(--cw-text) 8%, transparent)',
          }}
        >
          {/* Profile cover gradient */}
          <div
            className="h-44"
            style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}
          />

          <div className="px-6 md:px-10 pb-10 -mt-16 relative">
            {/* Avatar with visible change overlay */}
            <div className="relative w-28 h-28 group cursor-pointer" onClick={handleOpenEditModal}>
              <Avatar
                src={user?.avatar?.url || user?.avatar}
                name={user?.name || 'User'}
                size="xl"
                className="rounded-3xl w-28 h-28 object-cover border-4"
                style={{
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                  borderColor: 'var(--cw-card)',
                }}
              />
              {/* Change photo overlay — visible on hover */}
              <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <Camera size={20} color="white" />
                <span className="text-white text-[10px] font-semibold">Change</span>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--cw-text)' }}>
                  {user?.name || 'StreamFlix Member'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--cw-text2)' }}>
                  {user?.email} · Member since {memberSinceYear}
                </p>
                {user?.role === 'admin' && (
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    Administrator
                  </span>
                )}
              </div>
              <Button onClick={handleOpenEditModal}>Edit Profile</Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { label: 'Films watched', value: user?.stats?.watchHistoryCount || 0 },
                { label: 'Hours streamed', value: `${user?.stats?.totalWatchHours || 0}h` },
                { label: 'Liked titles', value: user?.stats?.likedCount || 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'var(--cw-bg)',
                    border: '1px solid color-mix(in srgb, var(--cw-text) 5%, transparent)',
                  }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cw-text2)' }}>
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold mt-1" style={{ color: 'var(--cw-text)' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Preferences section */}
            <div className="mt-10">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--cw-text)' }}>
                Preferences & Settings
              </h3>
              <div className="mt-4 space-y-3">
                <PreferenceRow
                  label="System Theme"
                  value={theme === 'cream' ? 'Cream' : 'Berry'}
                  onClick={toggleTheme}
                />
                <PreferenceRow
                  label="Favourite Genres"
                  value={user?.preferences?.genres?.join(', ') || 'None selected'}
                />
                <PreferenceRow
                  label="Streaming Quality"
                  value="1080p WebStream"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {updateError && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs border border-red-500/20 font-medium">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs border border-emerald-500/20 font-medium">
              {updateSuccess}
            </div>
          )}

          {/* Avatar upload */}
          <div
            className="p-4 rounded-2xl bg-black/10 border"
            style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
          >
            <MediaUploader
              type="avatar"
              label="Profile Picture"
              previewUrl={user?.avatar?.url || user?.avatar}
              onUploadSuccess={handleAvatarUploadSuccess}
            />
          </div>

          <Input
            id="profile-name"
            label="Display Name"
            placeholder="Enter your full name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            id="profile-genres"
            label="Favourite Genres (comma separated)"
            placeholder="Sci-Fi, Thriller, Drama"
            value={genrePreferences}
            onChange={(e) => setGenrePreferences(e.target.value)}
          />

          {/* Password change section */}
          <div
            className="border-t pt-4 mt-6"
            style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--cw-text2)' }}>
              Change Password
            </h4>
            <div className="space-y-3">
              <Input
                id="profile-current-password"
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                id="profile-new-password"
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div
            className="flex justify-end gap-2 pt-4 border-t"
            style={{ borderColor: 'color-mix(in srgb, var(--cw-text) 10%, transparent)' }}
          >
            <Button
              type="button"
              variant="secondary"
              disabled={isUpdating}
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
