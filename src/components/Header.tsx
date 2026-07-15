import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <div className="header-nav">
        <Link to="/" className="logo">
          NoDocs.
        </Link>
        <nav className="nav-links">
          <ThemeToggle />
          <a href="https://github.com" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
