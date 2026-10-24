import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Hero from './sections/Hero';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Experience from './sections/Experience';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import { useApi } from './hooks/useApi';
import { fetchProfile, fetchSkills, fetchProjects, fetchExperience } from './api';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const blogMatch = hash.match(/^#\/blog(?:\/([^/]+))?\/?$/);

  if (blogMatch) {
    return (
      <div className="min-h-screen bg-[var(--paper)] font-sans">
        <Navbar onBlog />
        {blogMatch[1] ? <BlogPost key={blogMatch[1]} slug={blogMatch[1]} /> : <BlogList />}
        <Footer />
        <ChatBot />
      </div>
    );
  }

  return <Home />;
}

function Footer() {
  return (
    <footer className="py-8 text-center text-gray-400 text-sm border-t border-[var(--paper-border)]">
      <p>Built with React, TypeScript, Tailwind CSS & Node.js</p>
      <p className="mt-1">© {new Date().getFullYear()} Wei Wang</p>
    </footer>
  );
}

function Home() {
  const profile = useApi(fetchProfile);
  const skills = useApi(fetchSkills);
  const projects = useApi(fetchProjects);
  const experience = useApi(fetchExperience);

  const loading = profile.loading || skills.loading || projects.loading || experience.loading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-accent-200 border-t-accent-600 animate-spin" />
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
      <Footer />
      <ChatBot />
    </div>
  );
}
