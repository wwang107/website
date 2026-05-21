import { useState } from 'react';
import { sendContact } from '../api';
import { SectionHeader } from './Skills';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await sendContact(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-[var(--paper)]">
      <div className="max-w-xl mx-auto">
        <SectionHeader title="Contact" subtitle="Let's work together" />
        <p className="text-center text-gray-500 mt-4 mb-10">
          Have a project in mind or just want to chat? Send me a message.
        </p>

        {status === 'sent' ? (
          <div className="text-center py-12 px-6 bg-violet-50 rounded-2xl border border-violet-200">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">Message sent!</h3>
            <p className="text-gray-500">I'll get back to you within 24 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-6 text-violet-500 hover:text-violet-600 font-medium">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                Something went wrong. Please try again.
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jane Smith" required />
              <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell me about your project..."
                className="w-full px-4 py-3 bg-[var(--paper-card)] border border-[var(--paper-border)] rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-md shadow-violet-200"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label, name, type, value, onChange, placeholder, required,
}: {
  label: string; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="w-full px-4 py-3 bg-[var(--paper-card)] border border-[var(--paper-border)] rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
      />
    </div>
  );
}
