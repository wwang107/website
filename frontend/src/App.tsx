import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Hero from './sections/Hero';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import { useApi } from './hooks/useApi';
import { fetchProfile, fetchSkills, fetchProjects, fetchExperience } from './api';

export default function App() {
  const profile = useApi(fetchProfile);
  const skills = useApi(fetchSkills);
  const projects = useApi(fetchProjects);
  const experience = useApi(fetchExperience);

  const loading = profile.loading || skills.loading || projects.loading || experience.loading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] font-sans">
      <Navbar />
      {profile.data && <Hero profile={profile.data} />}
      {skills.data && <Skills skills={skills.data} />}
      {projects.data && <Projects projects={projects.data} />}
      {experience.data && <Experience experience={experience.data} />}
<footer className="py-8 text-center text-gray-400 text-sm border-t border-[var(--paper-border)]">
        <p>Built with React, TypeScript, Tailwind CSS & Node.js</p>
        <p className="mt-1">© {new Date().getFullYear()} Wei Wang</p>
      </footer>
      <ChatBot />
    </div>
  );
}
