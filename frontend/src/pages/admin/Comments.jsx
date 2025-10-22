import React, { useState, useEffect } from 'react';
import { commentAPI } from '../../utils/api';
import { format } from 'date-fns';

const Comments = () => {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');

	useEffect(() => {
		fetchComments();
	}, [filter]);

	const fetchComments = async () => {
		try {
			setLoading(true);
			const params = {};
			
			if (filter === 'approved') params.approved = 'true';
			if (filter === 'pending') params.approved = 'false';

			const response = await commentAPI.getAll(params);
			if (response.data.success) {
				setComments(response.data.comments);
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleApprove = async (id) => {
		try {
			const response = await commentAPI.toggleApprove(id);
			if (response.data.success) {
				fetchComments();
			}
		} catch (error) {
			console.error('Error toggling approval:', error);
			alert('Failed to update comment status');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this comment?')) {
			return;
		}

		try {
			const response = await commentAPI.delete(id);
			if (response.data.success) {
				fetchComments();
			}
		} catch (error) {
			console.error('Error deleting comment:', error);
			alert('Failed to delete comment');
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Comments</h1>
					<p className="text-gray-600 mt-1">Manage and moderate blog comments</p>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex gap-2">
					<button
						onClick={() => setFilter('all')}
						className={`px-4 py-2 rounded-lg transition-colors ${
							filter === 'all'
								? 'bg-primary text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						All
					</button>
					<button
						onClick={() => setFilter('approved')}
						className={`px-4 py-2 rounded-lg transition-colors ${
							filter === 'approved'
								? 'bg-green-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Approved
					</button>
					<button
						onClick={() => setFilter('pending')}
						className={`px-4 py-2 rounded-lg transition-colors ${
							filter === 'pending'
								? 'bg-yellow-600 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Pending
					</button>
				</div>
			</div>

			{/* Comments List */}
			<div className="bg-white rounded-lg shadow">
				{loading ? (
					<div className="p-12 text-center">
						<div className="text-xl text-gray-600">Loading...</div>
					</div>
				) : comments.length === 0 ? (
					<div className="p-12 text-center">
						<div className="text-6xl mb-4">💬</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">No comments yet</h3>
						<p className="text-gray-600">Comments will appear here once users start commenting</p>
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{comments.map((comment) => (
							<div key={comment._id} className="p-6 hover:bg-gray-50 transition-colors">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										{/* Comment Header */}
										<div className="flex items-center gap-3 mb-2">
											<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
												<span className="text-xl">👤</span>
											</div>
											<div>
												<div className="font-semibold text-gray-900">{comment.name}</div>
												<div className="text-sm text-gray-500">{comment.email}</div>
											</div>
											<span
												className={`ml-auto px-3 py-1 text-xs rounded-full ${
													comment.isApproved
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{comment.isApproved ? 'Approved' : 'Pending'}
											</span>
										</div>

										{/* Comment Content */}
										<div className="ml-13 mb-3">
											<p className="text-gray-700">{comment.content}</p>
										</div>

										{/* Comment Meta */}
										<div className="ml-13 flex items-center gap-4 text-sm text-gray-500">
											<span>📝 {comment.blog?.title || 'Unknown Blog'}</span>
											<span>📅 {format(new Date(comment.createdAt), 'MMM dd, yyyy')}</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-2 ml-4">
										<button
											onClick={() => handleToggleApprove(comment._id)}
											className={`p-2 rounded-lg transition-colors ${
												comment.isApproved
													? 'text-yellow-600 hover:bg-yellow-50'
													: 'text-green-600 hover:bg-green-50'
											}`}
											title={comment.isApproved ? 'Unapprove' : 'Approve'}
										>
											{comment.isApproved ? '❌' : '✅'}
										</button>
										<button
											onClick={() => handleDelete(comment._id)}
											className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Delete"
										>
											🗑️
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Comments;
