import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';

// @desc    Get comments for a blog
// @route   GET /api/comments/blog/:blogId
// @access  Public
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ 
      blog: blogId, 
      isApproved: true,
      parentComment: null // Only get top-level comments
    })
      .sort({ createdAt: -1 })
      .populate('parentComment');

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          isApproved: true
        }).sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.status(200).json({
      success: true,
      count: comments.length,
      comments: commentsWithReplies
    });
  } catch (error) {
    console.error('Get blog comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all comments (Admin only)
// @route   GET /api/comments
// @access  Private/Admin
export const getAllComments = async (req, res) => {
  try {
    const { approved } = req.query;
    const query = {};

    if (approved !== undefined) {
      query.isApproved = approved === 'true';
    }

    const comments = await Comment.find(query)
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error('Get all comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new comment
// @route   POST /api/comments
// @access  Public
export const createComment = async (req, res) => {
  try {
    const { blog, name, email, content, parentComment } = req.body;

    if (!blog || !name || !email || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if blog exists
    const blogExists = await Blog.findById(blog);
    if (!blogExists) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if parent comment exists (if replying)
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      blog,
      name,
      email,
      content,
      parentComment: parentComment || null,
      isApproved: false // Requires admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully! It will be visible after approval.',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve comment
// @route   PATCH /api/comments/:id/approve
// @access  Private/Admin
export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.isApproved = !comment.isApproved;
    await comment.save();

    res.status(200).json({
      success: true,
      message: `Comment ${comment.isApproved ? 'approved' : 'unapproved'} successfully`,
      comment
    });
  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get comment statistics
// @route   GET /api/comments/stats
// @access  Private/Admin
export const getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const approvedComments = await Comment.countDocuments({ isApproved: true });
    const pendingComments = await Comment.countDocuments({ isApproved: false });

    const recentComments = await Comment.find()
      .populate('blog', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalComments,
        approvedComments,
        pendingComments,
        recentComments
      }
    });
  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
