import type { Experience as ExperienceType } from '../types';
import { SectionHeader } from './Skills';

interface Props { experience: ExperienceType[] }

export default function Experience({ experience }: Props) {
  return (
    <section id="experience" className="py-24 px-6 bg-[var(--paper-alt)]">
      <div className="max-w-3xl mx-auto">
        <SectionHeader title="Experience" subtitle="Where I've worked" />
        <div className="mt-12 flex flex-col gap-8">
          {experience.map((job, idx) => (
            <div key={job.id} className="flex gap-6">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-violet-500 shrink-0 mt-1.5 ring-4 ring-violet-100 dark:ring-violet-900" />
                {idx < experience.length - 1 && (
                  <div className="flex-1 w-0.5 bg-violet-200 dark:bg-violet-800 mt-2" />
                )}
              </div>
              {/* Content */}
              <div className="pb-8 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                  <h3 className="text-gray-900 dark:text-white font-bold text-xl">{job.role}</h3>
                  <span className="text-violet-500 font-semibold">@ {job.company}</span>
                  <span className="text-gray-400 text-sm ml-auto">{job.period}</span>
                </div>
                <ul className="space-y-2">
                  {job.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      <span className="text-violet-400 mt-1 shrink-0">▸</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
