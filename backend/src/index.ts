import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { WebSocketServer } from 'ws';
import { handleConnection } from './chat';
import { buildIndex } from './rag';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}
app.use(express.json());

const profile = {
  name: 'Wei Wang',
  title: 'Senior Backend Engineer',
  bio: '5+ years specializing in high-throughput JVM systems and distributed logistics architecture. I build tier-1 services that stay fast and reliable under extreme load — from event-driven dispatching pipelines to real-time vendor notification systems.',
  avatar: '/avatar.jpeg',
  location: 'Münster, Germany',
  email: 'wwang107@gmail.com',
  socials: {
    github: 'https://github.com/wwang107',
    linkedin: 'https://linkedin.com/in/weiwang107',
  },
};

const skills = [
  { category: 'Languages', items: ['Kotlin', 'Java', 'Go', 'Python', 'TypeScript'] },
  { category: 'Backend & Infra', items: ['Quarkus', 'Spring Boot', 'Kubernetes', 'Terraform', 'SNS/SQS', 'Redis'] },
  { category: 'Observability & Data', items: ['Grafana', 'Prometheus', 'Cloudwatch', 'BigQuery', 'OpenTracing'] },
];

const projects = [
  {
    id: 1,
    title: 'Real-time Order Dispatching',
    description: 'Tier-1 event-driven dispatching service built with Quarkus and Kotlin. Implemented optimistic-locking concurrency and Redis pipelining/sharding to cut query latency from seconds to microseconds.',
    tags: ['Kotlin', 'Quarkus', 'Redis', 'K8S'],
    link: '#',
    source: '#',
  },
  {
    id: 2,
    title: 'Vendor Notification Service',
    description: 'End-to-end tier-1 notification system for global vendors. Designed at-least-once SNS delivery, Prometheus/Grafana SLA dashboards, and a K6 load-testing pipeline simulating 10x peak traffic.',
    tags: ['Kotlin', 'SNS/SQS', 'Prometheus', 'Grafana', 'Go'],
    link: '#',
    source: '#',
  },
  {
    id: 3,
    title: '3D Human Pose Estimation',
    description: 'Master\'s thesis project: a computer vision pipeline reconstructing 3D human poses from multi-camera video by aggregating multi-view information through epipolar geometry.',
    tags: ['PyTorch', 'Python', 'Computer Vision', 'ML'],
    link: '#',
    source: '#',
  },
];

const experience = [
  {
    id: 1,
    company: 'Delivery Hero SE',
    role: 'Senior Software Engineer',
    period: 'Apr 2026 – Present',
    bullets: [
      'Architected an optimistic-locking concurrency strategy for the event-driven dispatching flow, ensuring strict data consistency under tier-1 throughput.',
      'Optimized Redis queries via pipelining and key sharding, reducing latency from seconds to microseconds.',
      'Participated in on-call rotation for the tier-1 deliveries dispatching service, driving down MTTI/MTTR.',
    ],
  },
  {
    id: 2,
    company: 'Delivery Hero SE',
    role: 'Software Engineer',
    period: 'Feb 2023 – Mar 2026',
    bullets: [
      'Drove end-to-end development of the tier-1 vendor order notification service, coordinating between Logistics and Vendor Growth teams.',
      'Defined SLAs and built monitoring with Prometheus and Grafana; implemented at-least-once SNS message delivery.',
      'Established an automated weekly load-testing pipeline (K6, Go, Spinnaker) simulating 10x peak traffic to catch regressions before production.',
    ],
  },
  {
    id: 3,
    company: 'Zalando SE',
    role: 'Fullstack Engineer',
    period: 'Jan 2021 – Jan 2023',
    bullets: [
      'Built real-time carrier capacity notifications using WebSocket and GraphQL subscriptions.',
      'Improved full-stack observability with OpenTracing, enabling correlated logging across frontend, backend APIs, and outbound requests.',
      'Implemented custom tracing spans via AsyncLocalStorage in Node.js for fine-grained production visibility.',
    ],
  },
  {
    id: 4,
    company: 'Autodesk',
    role: 'Software Engineer Intern',
    period: 'Jan 2020 – Dec 2020',
    bullets: [
      'Redesigned Autodesk Viewer frontend using React and Redux, integrating with legacy multi-framework components.',
    ],
  },
];

const messages: { name: string; email: string; message: string; createdAt: string }[] = [];

app.get('/api/profile', (_req, res) => res.json(profile));
app.get('/api/skills', (_req, res) => res.json(skills));
app.get('/api/projects', (_req, res) => res.json(projects));
app.get('/api/experience', (_req, res) => res.json(experience));

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required.' });
  }
  messages.push({ name, email, message, createdAt: new Date().toISOString() });
  console.log('[contact]', { name, email, message });
  return res.json({ success: true });
});

// Serve the built React app in production
if (!isDev) {
  const distPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  // SPA fallback — send index.html for any non-API route
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', handleConnection);

buildIndex();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
