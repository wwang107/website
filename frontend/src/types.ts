export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
  socials: { github: string; linkedin: string };
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link: string;
  source: string;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  period: string;
  bullets: string[];
}
