import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <div className="header-nav">
        <div className="logo-container">
          <button 
            className="mobile-menu-btn" 
            onClick={() => document.body.classList.toggle('sidebar-open')}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="logo">
            NoDocs.
          </Link>
        </div>
        <nav className="nav-links">
          <ThemeToggle />
          <a href="https://github.com" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
