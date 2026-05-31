import { Link } from 'react-router';
import { ROUTES } from '@/constants/routes';
import { APP_CONFIG } from '@/constants/config';

const columns = [
  { h: 'Explore', l: [
    { label: 'Browse', to: ROUTES.BROWSE },
    { label: 'Search', to: ROUTES.SEARCH },
    { label: 'New Arrivals', to: ROUTES.BROWSE },
    { label: 'Hidden Gems', to: ROUTES.BROWSE },
  ]},
  { h: 'Account', l: [
    { label: 'Profile', to: ROUTES.PROFILE },
    { label: 'Watchlist', to: ROUTES.WATCHLIST },
    { label: 'Dashboard', to: ROUTES.DASHBOARD },
    { label: 'Settings', to: ROUTES.PROFILE },
  ]},
  { h: 'Company', l: [
    { label: 'About' },
    { label: 'Careers' },
    { label: 'Press' },
    { label: 'Contact' },
  ]},
];

export function Footer() {
  return (
    <footer
      className="mt-20 px-8 py-12"
      style={{ background: 'var(--cw-footer)', color: 'var(--cw-footer-text)' }}
      id="main-footer"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--cw-button)', color: 'white' }}
            >
              ◐
            </div>
            <span className="font-semibold">{APP_CONFIG.name}</span>
          </div>
          <p className="text-sm opacity-85 leading-relaxed">
            {APP_CONFIG.tagline}. {APP_CONFIG.description}
          </p>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.h}>
            <div className="font-semibold mb-3">{col.h}</div>
            <ul className="space-y-2 opacity-85 text-sm">
              {col.l.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="cursor-default">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="max-w-7xl mx-auto mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-2"
        style={{
          borderTop: '1px solid color-mix(in srgb, var(--cw-footer-text) 20%, transparent)',
          fontSize: '12px',
          opacity: 0.75,
        }}
      >
        <span>© {new Date().getFullYear()} {APP_CONFIG.name} Studios</span>
        <span>Crafted with care · v{APP_CONFIG.version}</span>
      </div>
    </footer>
  );
}
