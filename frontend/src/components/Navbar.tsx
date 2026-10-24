import { useState, useEffect } from 'react';

const NAV_ITEMS = ['About', 'Skills', 'Projects', 'Experience'];

export default function Navbar({ onBlog = false }: { onBlog?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (onBlog) {
      // Leave the blog; Home mounts after the hash changes, then we scroll to the section.
      window.location.assign('#');
      setTimeout(() => document.getElementById(id.toLowerCase())?.scrollIntoView(), 100);
      return;
    }
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
  };

  const goBlog = () => {
    setMenuOpen(false);
    window.location.assign('#/blog');
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || onBlog ? 'bg-[#f5f0e8]/90 backdrop-blur shadow-sm shadow-[#d4cfc4]/50' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-bold text-lg text-gray-900 tracking-tight">
          Wei<span className="text-accent-600">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item}>
              <button
                onClick={() => scrollTo(item)}
                className="text-sm text-gray-600 hover:text-accent-600 transition-colors font-medium"
              >
                {item}
              </button>
            </li>
          ))}
          <li>
            <button onClick={goBlog} className="text-sm text-gray-600 hover:text-accent-600 transition-colors font-medium">
              Blog
            </button>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#f5f0e8] border-t border-[var(--paper-border)] px-6 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-left text-gray-700 hover:text-accent-600 font-medium"
            >
              {item}
            </button>
          ))}
          <button onClick={goBlog} className="text-left text-gray-700 hover:text-accent-600 font-medium">
            Blog
          </button>
        </div>
      )}
    </header>
  );
}
