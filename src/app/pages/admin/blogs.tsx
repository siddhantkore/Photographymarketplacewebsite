import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { blogsApi } from '../../services/api';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  tags: string[];
  date: string;
}

const initialForm = {
  title: '',
  excerpt: '',
  content: '',
  image: '',
  author: '',
  tags: '',
  date: '',
};

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadBlogs = async (query?: string) => {
    setLoading(true);
    try {
      const response: any = await blogsApi.getAll({
        page: 1,
        limit: 100,
        ...(query?.trim() ? { search: query.trim() } : {}),
      });

      if (response?.success && response?.data?.blogs) {
        setBlogs(response.data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return blogs;
    return blogs.filter((blog) =>
      [blog.title, blog.author, blog.excerpt].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [blogs, search]);

  const resetDialog = () => {
    setIsDialogOpen(false);
    setEditingBlog(null);
    setForm(initialForm);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image || '',
      author: blog.author,
      tags: (blog.tags || []).join(', '),
      date: blog.date ? new Date(blog.date).toISOString().slice(0, 10) : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const response: any = await blogsApi.delete(id);
      if (response?.success) {
        toast.success('Blog deleted');
        await loadBlogs(search);
      } else {
        toast.error(response?.message || 'Failed to delete blog');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete blog');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      image: form.image.trim(),
      author: form.author.trim(),
      tags: form.tags,
      date: form.date || undefined,
    };

    try {
      if (editingBlog) {
        const response: any = await blogsApi.update(editingBlog.id, payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to update blog');
        }
        toast.success('Blog updated');
      } else {
        const response: any = await blogsApi.create(payload);
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to create blog');
        }
        toast.success('Blog created');
      }

      await loadBlogs(search);
      resetDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Blog
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or excerpt"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  Loading blogs...
                </td>
              </tr>
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{blog.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{blog.excerpt}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{blog.author}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(blog.tags || []).slice(0, 3).map((tag) => (
                        <Badge key={`${blog.id}-${tag}`} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    {blog.date ? new Date(blog.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                  No blog entries available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : resetDialog())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog' : 'Add Blog'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="blog-author">Author</Label>
              <Input
                id="blog-author"
                value={form.author}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="blog-date">Publish Date</Label>
              <Input
                id="blog-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="blog-image">Cover Image URL</Label>
              <Input
                id="blog-image"
                value={form.image}
                onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="Optional image URL"
              />
            </div>
            <div>
              <Label htmlFor="blog-tags">Tags (comma separated)</Label>
              <Input
                id="blog-tags"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="blog-excerpt">Excerpt</Label>
              <Textarea
                id="blog-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="blog-content">Content</Label>
              <Textarea
                id="blog-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
