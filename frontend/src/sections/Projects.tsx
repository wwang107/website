import type { Project } from '../types';
import { SectionHeader } from './Skills';

interface Props { projects: Project[] }

export default function Projects({ projects }: Props) {
  return (
    <section id="projects" className="py-24 px-6 bg-[var(--paper)]">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Projects" subtitle="Things I've built" />
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {projects.map((p) => (
            <article
              key={p.id}
              className="group bg-[var(--paper-alt)] border border-[var(--paper-border)] rounded-2xl p-6 hover:shadow-lg hover:border-red-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-gray-900 font-bold text-xl group-hover:text-red-600 transition-colors">
                  {p.title}
                </h3>
                <div className="flex gap-2 shrink-0">
                  {p.type === 'private' ? (
                    <span className="text-gray-300" title="Internal project — not publicly available">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                  ) : (
                    <>
                      {p.source !== '#' && (
                        <a href={p.source} target="_blank" rel="noreferrer" aria-label="Source code"
                          className="text-gray-400 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {p.link !== '#' && (
                        <a href={p.link} target="_blank" rel="noreferrer" aria-label="Live demo"
                          className="text-gray-400 hover:text-red-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
