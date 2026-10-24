import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '../blog/format';
import { useApi } from '../hooks/useApi';
import { fetchPost } from '../api';

export default function BlogPost({ slug }: { slug: string }) {
  const { data: post, loading } = useApi(() => fetchPost(slug));

  return (
    <article className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="#/blog" className="text-sm font-medium text-accent-600 hover:text-accent-700">
          ← All posts
        </a>
        {!post ? (
          <p className="mt-8 text-gray-600">{loading ? 'Loading…' : 'Post not found.'}</p>
        ) : (
          <>
            <p className="mt-8 text-sm text-accent-600 font-medium">{formatDate(post.date)}</p>
            <h1 className="mt-1 text-4xl font-extrabold text-gray-900">{post.title}</h1>
            <div
              className="mt-8 text-gray-700 leading-relaxed
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-3
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-2
                [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                [&_a]:text-accent-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-accent-300 [&_blockquote]:pl-4 [&_blockquote]:italic
                [&_code]:bg-[var(--paper-alt)] [&_code]:px-1 [&_code]:rounded [&_code]:text-sm
                [&_pre]:bg-[var(--paper-alt)] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_img]:rounded-xl [&_img]:my-6"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
