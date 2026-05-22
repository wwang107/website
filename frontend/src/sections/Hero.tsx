import type { Profile } from '../types';

interface Props { profile: Profile }

export default function Hero({ profile }: Props) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-6 pt-16 bg-gradient-to-br from-white via-red-50/40 to-gray-50">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-40 h-40 rounded-full ring-4 ring-red-200 overflow-hidden bg-red-50 shadow-xl">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center md:text-left">
          <p className="text-red-600 font-semibold text-sm tracking-widest uppercase mb-2">
            Hello, I'm
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-3 leading-tight">
            {profile.name}
          </h1>
          <h2 className="text-2xl font-medium text-red-600 mb-4">{profile.title}</h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl mb-6">
            {profile.bio}
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
            <button
              onClick={() => scrollTo('projects')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-red-50 font-semibold rounded-xl transition-colors"
            >
              See my work
            </button>
          </div>

          <div className="flex gap-4 justify-center md:justify-start text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </span>
            <a href={`mailto:${profile.email}`} className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.email}
            </a>
          </div>

          {/* Socials */}
          <div className="flex gap-3 mt-4 justify-center md:justify-start">
            {Object.entries(profile.socials).map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 transition-colors"
                aria-label={name}
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === 'github') return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
  if (name === 'linkedin') return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
  return null;
}
