import Blog from '../models/Blog.js';
import Category from '../models/Category.js';
import { generateBlogContent, improveBlogContent, generateBlogIdeas } from '../utils/gemini.js';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const { category, author, published, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (author) query.author = author;
    if (published !== undefined) query.isPublished = published === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      blogs
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar bio');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar bio');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    const { title, description, content, category, image, tags } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const blog = await Blog.create({
      title,
      description,
      content,
      category,
      author: req.user.id,
      authorName: req.user.name,
      image: image || '',
      tags: tags || []
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    const { title, description, content, category, image, tags } = req.body;

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (image !== undefined) blog.image = image;
    if (tags) blog.tags = tags;

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Publish/Unpublish blog
// @route   PATCH /api/blogs/:id/publish
// @access  Private/Admin
export const togglePublish = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.isPublished = !blog.isPublished;
    blog.publishedAt = blog.isPublished ? new Date() : null;

    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate blog with AI
// @route   POST /api/blogs/generate
// @access  Private
export const generateBlog = async (req, res) => {
  try {
    const { topic, category, tone } = req.body;

    if (!topic || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic and category'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const generatedContent = await generateBlogContent(topic, categoryExists.name, tone);

    const blog = await Blog.create({
      title: generatedContent.title,
      description: generatedContent.description,
      content: generatedContent.content,
      category,
      author: req.user.id,
      authorName: req.user.name,
      generatedByAI: true
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Blog generated successfully',
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Generate blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate blog'
    });
  }
};

// @desc    Improve blog content with AI
// @route   POST /api/blogs/:id/improve
// @access  Private
export const improveBlog = async (req, res) => {
  try {
    const { instruction } = req.body;

    if (!instruction) {
      return res.status(400).json({
        success: false,
        message: 'Please provide improvement instruction'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to improve this blog'
      });
    }

    const improvedContent = await improveBlogContent(blog.content, instruction);

    blog.content = improvedContent;
    await blog.save();

    const updatedBlog = await Blog.findById(blog._id)
      .populate('category', 'name slug icon color')
      .populate('author', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Blog improved successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Improve blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to improve blog'
    });
  }
};

// @desc    Get blog ideas with AI
// @route   POST /api/blogs/ideas
// @access  Private
export const getBlogIdeas = async (req, res) => {
  try {
    const { category, count } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const ideas = await generateBlogIdeas(categoryExists.name, count || 5);

    res.status(200).json({
      success: true,
      ideas
    });
  } catch (error) {
    console.error('Get blog ideas error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate blog ideas'
    });
  }
};

// @desc    Get blog statistics
// @route   GET /api/blogs/stats
// @access  Private
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ isPublished: true });
    const draftBlogs = await Blog.countDocuments({ isPublished: false });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const recentBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name')
      .populate('author', 'name');

    const topBlogs = await Blog.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(5)
      .populate('category', 'name')
      .populate('author', 'name');

    res.status(200).json({
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: totalViews[0]?.total || 0,
        recentBlogs,
        topBlogs
      }
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
