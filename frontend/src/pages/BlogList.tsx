import { formatDate } from '../blog/format';
import { useApi } from '../hooks/useApi';
import { fetchPosts } from '../api';
import { SectionHeader } from '../sections/Skills';

export default function BlogList() {
  const { data, loading, error } = useApi(fetchPosts);
  const posts = data ?? [];

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeader title="Blog" subtitle="Thoughts & notes" />
        <div className="mt-12 flex flex-col gap-6">
          {loading && <p className="text-center text-gray-500">Loading…</p>}
          {error && <p className="text-center text-gray-500">Could not load posts.</p>}
          {!loading && !error && posts.length === 0 && <p className="text-center text-gray-500">No posts yet.</p>}
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`#/blog/${post.slug}`}
              className="block bg-[var(--paper-card)] rounded-2xl p-6 shadow-sm border border-[var(--paper-border)] hover:shadow-md transition-shadow"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-xl mb-4 border border-[var(--paper-border)]"
                />
              )}
              <p className="text-sm text-accent-600 font-medium">{formatDate(post.date)}</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">{post.title}</h3>
              <p className="mt-2 text-gray-600">{post.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
