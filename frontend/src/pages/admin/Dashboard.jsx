import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blogAPI, userAPI } from '../../utils/api';

const Dashboard = () => {
	const { user, isAdmin } = useAuth();
	const [stats, setStats] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const [statsRes, usersRes] = await Promise.all([
				blogAPI.getStats(),
				isAdmin ? userAPI.getAll() : Promise.resolve({ data: { users: [] } })
			]);

			if (statsRes.data.success) {
				setStats(statsRes.data.stats);
			}

			if (usersRes.data.success || usersRes.data.users) {
				setUsers(usersRes.data.users || []);
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow p-6">
				<h1 className="text-3xl font-bold text-gray-800">
					Welcome back, {user?.name}!
				</h1>
				<p className="text-gray-600 mt-2">
					Here's what's happening with your blog today.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Total Blogs</p>
							<p className="text-3xl font-bold text-gray-800 mt-2">
								{stats?.totalBlogs || 0}
							</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-full">
							<span className="text-3xl">📝</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Published</p>
							<p className="text-3xl font-bold text-green-600 mt-2">
								{stats?.publishedBlogs || 0}
							</p>
						</div>
						<div className="bg-green-100 p-3 rounded-full">
							<span className="text-3xl">✅</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Drafts</p>
							<p className="text-3xl font-bold text-yellow-600 mt-2">
								{stats?.draftBlogs || 0}
							</p>
						</div>
						<div className="bg-yellow-100 p-3 rounded-full">
							<span className="text-3xl">📄</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-600 text-sm font-medium">Total Views</p>
							<p className="text-3xl font-bold text-purple-600 mt-2">
								{stats?.totalViews || 0}
							</p>
						</div>
						<div className="bg-purple-100 p-3 rounded-full">
							<span className="text-3xl">👁️</span>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Blogs and Top Blogs */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Blogs */}
				<div className="bg-white rounded-lg shadow">
					<div className="p-6 border-b">
						<h2 className="text-xl font-bold text-gray-800">Recent Blogs</h2>
					</div>
					<div className="p-6">
						{stats?.recentBlogs && stats.recentBlogs.length > 0 ? (
							<div className="space-y-4">
								{stats.recentBlogs.map((blog) => (
									<div key={blog._id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
										<div className="flex-1">
											<Link 
												to={`/admin/blogs/edit/${blog._id}`}
												className="font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
											>
												{blog.title}
											</Link>
											<p className="text-sm text-gray-600 mt-1">
												{blog.category?.name} • {new Date(blog.createdAt).toLocaleDateString()}
											</p>
										</div>
										<span className={`px-2 py-1 text-xs rounded-full ${
											blog.isPublished 
												? 'bg-green-100 text-green-800' 
												: 'bg-yellow-100 text-yellow-800'
										}`}>
											{blog.isPublished ? 'Published' : 'Draft'}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-500 text-center py-8">No blogs yet</p>
						)}
					</div>
				</div>

				{/* Top Blogs */}
				<div className="bg-white rounded-lg shadow">
					<div className="p-6 border-b">
						<h2 className="text-xl font-bold text-gray-800">Top Performing</h2>
					</div>
					<div className="p-6">
						{stats?.topBlogs && stats.topBlogs.length > 0 ? (
							<div className="space-y-4">
								{stats.topBlogs.map((blog) => (
									<div key={blog._id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
										<div className="flex-1">
											<Link 
												to={`/admin/blogs/edit/${blog._id}`}
												className="font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
											>
												{blog.title}
											</Link>
											<p className="text-sm text-gray-600 mt-1">
												{blog.views} views • {blog.category?.name}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-500 text-center py-8">No published blogs yet</p>
						)}
					</div>
				</div>
			</div>

			{/* Publishers (Admin Only) */}
			{isAdmin && users.length > 0 && (
				<div className="bg-white rounded-lg shadow">
					<div className="p-6 border-b flex items-center justify-between">
						<h2 className="text-xl font-bold text-gray-800">Publishers</h2>
						<Link 
							to="/admin/publishers"
							className="text-blue-600 hover:text-blue-700 text-sm font-medium"
						>
							View All
						</Link>
					</div>
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{users.filter(u => u.role === 'publisher').slice(0, 6).map((publisher) => (
								<div key={publisher._id} className="flex items-center gap-3 p-3 border rounded-lg">
									<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-xl">👤</span>
									</div>
									<div className="flex-1">
										<p className="font-medium text-gray-800">{publisher.name}</p>
										<p className="text-sm text-gray-600">{publisher.email}</p>
									</div>
									<span className={`w-2 h-2 rounded-full ${
										publisher.isActive ? 'bg-green-500' : 'bg-gray-300'
									}`} />
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						to="/admin/blogs/new"
						className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
					>
						<span className="text-2xl">➕</span>
						<span className="font-medium text-gray-700">Create New Blog</span>
					</Link>
					
					<Link
						to="/admin/blogs"
						className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
					>
						<span className="text-2xl">📝</span>
						<span className="font-medium text-gray-700">Manage Blogs</span>
					</Link>

					{isAdmin && (
						<Link
							to="/admin/publishers"
							className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
						>
							<span className="text-2xl">👥</span>
							<span className="font-medium text-gray-700">Manage Publishers</span>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
