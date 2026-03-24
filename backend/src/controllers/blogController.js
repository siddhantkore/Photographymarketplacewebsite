import prisma from '../config/database.js';

function parseStringArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function transformBlog(blog) {
  return {
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    image: blog.image,
    author: blog.author,
    tags: blog.tags || [],
    date: blog.date,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

export const getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const take = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12));
    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const skip = (currentPage - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { excerpt: { contains: String(search), mode: 'insensitive' } },
        { content: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        blogs: blogs.map(transformBlog),
        pagination: {
          currentPage,
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: currentPage > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.json({
      success: true,
      data: transformBlog(blog),
    });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, image, author, date } = req.body;
    const tags = parseStringArray(req.body.tags);

    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, content, and author are required',
      });
    }

    const blog = await prisma.blog.create({
      data: {
        title: String(title).trim(),
        excerpt: String(excerpt).trim(),
        content: String(content).trim(),
        image: image ? String(image).trim() : '',
        author: String(author).trim(),
        tags,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: transformBlog(blog),
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateData = {};
    const assignable = ['title', 'excerpt', 'content', 'image', 'author'];
    for (const field of assignable) {
      if (typeof req.body[field] === 'string') {
        updateData[field] = req.body[field].trim();
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'date')) {
      updateData.date = req.body.date ? new Date(req.body.date) : new Date();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {
      updateData.tags = parseStringArray(req.body.tags);
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: transformBlog(blog),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.blog.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
