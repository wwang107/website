import type { Profile, SkillGroup, Project, Experience } from './types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const fetchProfile = () => get<Profile>('/profile');
export const fetchSkills = () => get<SkillGroup[]>('/skills');
export const fetchProjects = () => get<Project[]>('/projects');
export const fetchExperience = () => get<Experience[]>('/experience');

export async function sendContact(data: { name: string; email: string; message: string }) {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Contact form submission failed.');
  return res.json() as Promise<{ success: boolean }>;
}
