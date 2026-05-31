import { Link, NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sun, Moon, Bell, Menu, X, LogOut, User, Settings, Shield } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { Avatar } from './ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from './ui/Dropdown';
import { ROUTES } from '@/constants/routes';

const navLinks = [
  { to: ROUTES.HOME, label: 'Home' },
  { to: ROUTES.BROWSE, label: 'Browse' },
  { to: ROUTES.WATCHLIST, label: 'Watchlist' },
  { to: ROUTES.DASHBOARD, label: 'Dashboard' },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [q, setQ] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
      setQ('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
        id="main-navbar"
      >
        <div
          className="glass rounded-2xl px-4 md:px-6 py-3 flex items-center gap-3 md:gap-6"
          style={{
            boxShadow: '0 10px 40px -10px color-mix(in srgb, var(--cw-text) 25%, transparent)',
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--cw-button), var(--cw-accent))' }}
            >
              <span style={{ color: 'white' }}>◐</span>
            </motion.div>
            <span className="tracking-wide hidden sm:inline" style={{ color: 'var(--cw-text)' }}>
              StreamFlix
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className="px-3 py-1.5 rounded-lg transition-all text-sm"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--cw-button)' : 'var(--cw-text2)',
                  background: isActive ? 'color-mix(in srgb, var(--cw-button) 12%, transparent)' : 'transparent',
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="ml-auto flex items-center gap-2 rounded-xl px-3 py-1.5 flex-1 max-w-xs"
            style={{ background: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
          >
            <Search size={16} style={{ color: 'var(--cw-text2)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, moods…"
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: 'var(--cw-text)' }}
              id="navbar-search"
            />
          </form>

          {/* Notification bell */}
          <Dropdown
            trigger={
              <button className="p-2 rounded-lg relative" style={{ color: 'var(--cw-text)' }}>
                <Bell size={18} />
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: 'var(--cw-button)' }}
                />
              </button>
            }
          >
            <div className="p-4 w-72">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--cw-text2)' }}>NOTIFICATIONS</p>
              {['New: Iron Lullaby is trending', 'Echoes of Tomorrow continues at 42%', 'Your review was liked'].map((n, i) => (
                <div
                  key={i}
                  className="py-2.5 text-sm border-b last:border-0"
                  style={{ color: 'var(--cw-text)', borderColor: 'color-mix(in srgb, var(--cw-text) 8%, transparent)' }}
                >
                  {n}
                </div>
              ))}
            </div>
          </Dropdown>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="relative w-14 h-7 rounded-full flex items-center px-1 shrink-0 hidden sm:flex"
            style={{ background: 'color-mix(in srgb, var(--cw-text) 20%, transparent)' }}
            aria-label="Toggle theme"
            id="theme-toggle"
          >
            <motion.div
              animate={{ x: theme === 'cream' ? 0 : 26 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--cw-accent)' }}
            >
              {theme === 'cream' ? <Sun size={12} color="#7D1038" /> : <Moon size={12} color="#7D1038" />}
            </motion.div>
          </motion.button>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Dropdown
                trigger={
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Avatar name={user?.name} src={user?.avatar?.url || user?.avatar} size="sm" />
                  </motion.div>
                }
              >
                <div className="py-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--cw-text)' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--cw-text2)' }}>{user?.email}</p>
                  </div>
                  <DropdownSeparator />
                  <DropdownItem icon={<User size={14} />} onClick={() => navigate(ROUTES.PROFILE)}>
                    Profile
                  </DropdownItem>
                  <DropdownItem icon={<Settings size={14} />} onClick={() => navigate(ROUTES.DASHBOARD)}>
                    Dashboard
                  </DropdownItem>
                  {isAdmin && (
                    <DropdownItem icon={<Shield size={14} />} onClick={() => navigate(ROUTES.ADMIN)}>
                      Admin Panel
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                  <DropdownItem icon={<LogOut size={14} />} danger onClick={() => { logout(); navigate('/'); }}>
                    Sign Out
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>

          ) : (
            <Link to={ROUTES.LOGIN}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--cw-button), var(--cw-text2))',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                →
              </motion.div>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: 'var(--cw-text)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 p-4 md:hidden"
          >
            <div
              className="glass-strong rounded-2xl p-4 space-y-1"
              style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
            >
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--cw-button)' : 'var(--cw-text)',
                    background: isActive ? 'color-mix(in srgb, var(--cw-button) 12%, transparent)' : 'transparent',
                  })}
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-2 px-4">
                <button
                  onClick={() => { toggle(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm py-2"
                  style={{ color: 'var(--cw-text2)' }}
                >
                  {theme === 'cream' ? <Moon size={16} /> : <Sun size={16} />}
                  Switch to {theme === 'cream' ? 'Berry' : 'Cream'} theme
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
