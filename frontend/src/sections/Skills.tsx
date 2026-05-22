import type { SkillGroup } from '../types';

interface Props { skills: SkillGroup[] }

export default function Skills({ skills }: Props) {
  return (
    <section id="skills" className="py-24 px-6 bg-[var(--paper-alt)]">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Skills" subtitle="What I work with" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {skills.map((group) => (
            <div
              key={group.category}
              className="bg-[var(--paper-card)] rounded-2xl p-6 shadow-sm border border-[var(--paper-border)] hover:shadow-md transition-shadow"
            >
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-600 inline-block" />
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-accent-50 text-accent-700 text-sm font-medium rounded-lg border border-accent-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <p className="text-accent-600 font-semibold text-sm tracking-widest uppercase mb-2">{subtitle}</p>
      <h2 className="text-4xl font-extrabold text-gray-900">{title}</h2>
      <div className="mt-4 w-12 h-1 bg-accent-600 rounded mx-auto" />
    </div>
  );
}
