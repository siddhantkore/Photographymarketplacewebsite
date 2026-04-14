import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Calendar, User } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { blogsApi } from '../services/api';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
}

export function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const response: any = await blogsApi.getAll({ page: 1, limit: 50 });
        if (response?.success && response?.data?.blogs) {
          setBlogs(response.data.blogs);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error('Failed to load blogs', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photography Blog</h1>
          <p className="text-gray-600">Tips, tutorials, and inspiration from professional photographers</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">Loading blog posts...</div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.id}`} className="group">
                <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {blog.image ? (
                      <ImageWithFallback
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(blog.tags || []).slice(0, 2).map((tag) => (
                        <Badge key={`${blog.id}-${tag}`} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(blog.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gray-600">No blog posts available.</div>
        )}
      </div>
    </div>
  );
}
