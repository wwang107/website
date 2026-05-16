import type { SkillGroup } from '../types';

interface Props { skills: SkillGroup[] }

export default function Skills({ skills }: Props) {
  return (
    <section id="skills" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Skills" subtitle="What I work with" />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {skills.map((group) => (
            <div
              key={group.category}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 text-sm font-medium rounded-lg border border-violet-100 dark:border-violet-900"
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
      <p className="text-violet-500 font-semibold text-sm tracking-widest uppercase mb-2">{subtitle}</p>
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 w-12 h-1 bg-violet-500 rounded mx-auto" />
    </div>
  );
}
