import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blogAPI } from '../../utils/api';

const BlogList = () => {
	const { isAdmin, user, loading: authLoading } = useAuth();
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		// Wait for auth to load before fetching blogs
		if (!authLoading && user) {
			fetchBlogs();
		}
	}, [filter, authLoading, user]);

	const fetchBlogs = async () => {
		try {
			setLoading(true);
			const params = {};
			
			// Publishers only see their own blogs
			if (!isAdmin && user?._id) {
				params.author = user._id;
			}
			
			if (filter === 'published') params.published = 'true';
			if (filter === 'draft') params.published = 'false';
			if (searchTerm) params.search = searchTerm;

			const response = await blogAPI.getAll(params);
			
			if (response.data.success) {
				setBlogs(response.data.blogs);
			}
		} catch (error) {
			console.error('Error fetching blogs:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
		fetchBlogs();
	};

	const handleTogglePublish = async (id, currentStatus) => {
		if (!isAdmin) {
			alert('Only admins can publish/unpublish blogs');
			return;
		}

		try {
			const response = await blogAPI.togglePublish(id);
			if (response.data.success) {
				fetchBlogs();
			}
		} catch (error) {
			console.error('Error toggling publish status:', error);
			alert('Failed to update blog status');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this blog?')) {
			return;
		}

		try {
			const response = await blogAPI.delete(id);
			if (response.data.success) {
				fetchBlogs();
			}
		} catch (error) {
			console.error('Error deleting blog:', error);
			alert('Failed to delete blog');
		}
	};

	// Show loading while auth is being checked
	if (authLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-xl text-gray-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">
						{isAdmin ? 'All Blogs' : 'My Blogs'}
					</h1>
					<p className="text-gray-600 mt-1">
						{isAdmin ? 'Manage all blog posts from all publishers' : 'Manage your blog posts'}
					</p>
				</div>
				<Link
					to="/admin/blogs/new"
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<span>➕</span>
					<span>Create New Blog</span>
				</Link>
			</div>

			{/* Filters and Search */}
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<form onSubmit={handleSearch} className="flex-1">
						<div className="flex gap-2">
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search blogs..."
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								type="submit"
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Search
							</button>
						</div>
					</form>

					{/* Filter */}
					<div className="flex gap-2">
						<button
							onClick={() => setFilter('all')}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filter === 'all'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							All
						</button>
						<button
							onClick={() => setFilter('published')}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filter === 'published'
									? 'bg-green-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Published
						</button>
						<button
							onClick={() => setFilter('draft')}
							className={`px-4 py-2 rounded-lg transition-colors ${
								filter === 'draft'
									? 'bg-yellow-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Drafts
						</button>
					</div>
				</div>
			</div>

			{/* Blog List */}
			<div className="bg-white rounded-lg shadow">
				{loading ? (
					<div className="p-12 text-center">
						<div className="text-xl text-gray-600">Loading...</div>
					</div>
				) : blogs.length === 0 ? (
					<div className="p-12 text-center">
						<div className="text-6xl mb-4">📝</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">No blogs found</h3>
						<p className="text-gray-600 mb-6">
							{isAdmin ? 'No blogs have been created yet' : 'Start creating your first blog post'}
						</p>
						<Link
							to="/admin/blogs/new"
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<span>➕</span>
							<span>Create New Blog</span>
						</Link>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Title
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Author
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Views
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{blogs.map((blog) => (
									<tr key={blog._id} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												{blog.image && (
													<img
														src={`http://localhost:5000${blog.image}`}
														alt={blog.title}
														className="w-12 h-12 object-cover rounded"
													/>
												)}
												<div className="flex-1">
													<Link
														to={`/admin/blogs/edit/${blog._id}`}
														className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
													>
														{blog.title}
													</Link>
													{blog.generatedByAI && (
														<span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1">
															<span>✨</span>
															<span>AI Generated</span>
														</span>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
												<span>{blog.category?.icon}</span>
												<span>{blog.category?.name}</span>
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{blog.authorName}</div>
											<div className="text-xs text-gray-500">{blog.author?.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													blog.isPublished
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{blog.isPublished ? 'Published' : 'Draft'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{blog.views}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(blog.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												{/* Show edit button only for own blogs or if admin */}
												{(isAdmin || blog.author?._id === user?._id) && (
													<Link
														to={`/admin/blogs/edit/${blog._id}`}
														className="text-blue-600 hover:text-blue-900"
														title="Edit"
													>
														✏️
													</Link>
												)}
												{/* Publish button only for admin */}
												{isAdmin && (
													<button
														onClick={() => handleTogglePublish(blog._id, blog.isPublished)}
														className={`${
															blog.isPublished
																? 'text-yellow-600 hover:text-yellow-900'
																: 'text-green-600 hover:text-green-900'
														}`}
														title={blog.isPublished ? 'Unpublish' : 'Publish'}
													>
														{blog.isPublished ? '📤' : '✅'}
													</button>
												)}
												{/* Delete button only for own blogs or if admin */}
												{(isAdmin || blog.author?._id === user?._id) && (
													<button
														onClick={() => handleDelete(blog._id)}
														className="text-red-600 hover:text-red-900"
														title="Delete"
													>
														🗑️
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default BlogList;
