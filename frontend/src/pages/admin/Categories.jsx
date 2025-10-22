import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Categories = () => {
	const { isAdmin } = useAuth();
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingCategory, setEditingCategory] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		icon: '📁',
		color: '#3B82F6'
	});

	const iconOptions = ['📁', '💻', '🎨', '📱', '🚀', '💡', '📚', '🎯', '🌟', '🔧', '📊', '🎮', '🏃', '🍔', '✈️', '🎵'];

	useEffect(() => {
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			setLoading(true);
			const response = await categoryAPI.getAll();
			if (response.data.success) {
				setCategories(response.data.categories);
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (category = null) => {
		if (category) {
			setEditingCategory(category);
			setFormData({
				name: category.name,
				description: category.description || '',
				icon: category.icon || '📁',
				color: category.color || '#3B82F6'
			});
		} else {
			setEditingCategory(null);
			setFormData({
				name: '',
				description: '',
				icon: '📁',
				color: '#3B82F6'
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingCategory(null);
		setFormData({
			name: '',
			description: '',
			icon: '📁',
			color: '#3B82F6'
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			let response;
			if (editingCategory) {
				response = await categoryAPI.update(editingCategory._id, formData);
			} else {
				response = await categoryAPI.create(formData);
			}

			if (response.data.success) {
				alert(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
				handleCloseModal();
				fetchCategories();
			}
		} catch (error) {
			console.error('Error saving category:', error);
			alert(error.response?.data?.message || 'Failed to save category');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this category?')) {
			return;
		}

		try {
			const response = await categoryAPI.delete(id);
			if (response.data.success) {
				fetchCategories();
			}
		} catch (error) {
			console.error('Error deleting category:', error);
			alert(error.response?.data?.message || 'Failed to delete category');
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Categories</h1>
					<p className="text-gray-600 mt-1">
						{isAdmin ? 'Organize your blog posts with categories' : 'View available categories'}
					</p>
				</div>
				{isAdmin && (
					<button
						onClick={() => handleOpenModal()}
						className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
					>
						<span>➕</span>
						<span>Add Category</span>
					</button>
				)}
			</div>

			{/* Categories Grid */}
			<div className="bg-white rounded-lg shadow">
				{loading ? (
					<div className="p-12 text-center">
						<div className="text-xl text-gray-600">Loading...</div>
					</div>
				) : categories.length === 0 ? (
					<div className="p-12 text-center">
						<div className="text-6xl mb-4">📁</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">No categories yet</h3>
						<p className="text-gray-600 mb-6">
							{isAdmin ? 'Create your first category to organize blogs' : 'No categories available'}
						</p>
						{isAdmin && (
							<button
								onClick={() => handleOpenModal()}
								className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
							>
								<span>➕</span>
								<span>Add Category</span>
							</button>
						)}
					</div>
				) : (
					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{categories.map((category) => (
								<div
									key={category._id}
									className="border-2 rounded-lg p-4 hover:shadow-lg transition-shadow"
									style={{ borderColor: category.color }}
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-3">
											<div
												className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
												style={{ backgroundColor: `${category.color}20` }}
											>
												{category.icon}
											</div>
											<div>
												<h3 className="font-bold text-gray-800">{category.name}</h3>
												<p className="text-sm text-gray-500">{category.slug}</p>
											</div>
										</div>
										{isAdmin && (
											<div className="flex gap-2">
												<button
													onClick={() => handleOpenModal(category)}
													className="text-blue-600 hover:text-blue-900"
													title="Edit"
												>
													✏️
												</button>
												<button
													onClick={() => handleDelete(category._id)}
													className="text-red-600 hover:text-red-900"
													title="Delete"
												>
													🗑️
												</button>
											</div>
										)}
									</div>
									{category.description && (
										<p className="text-sm text-gray-600 mb-3">{category.description}</p>
									)}
									<div className="flex items-center justify-between text-xs text-gray-500">
										<span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
										<span
											className={`px-2 py-1 rounded-full ${
												category.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{category.isActive ? 'Active' : 'Inactive'}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							{editingCategory ? 'Edit Category' : 'Add New Category'}
						</h3>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
									required
									placeholder="e.g., Technology"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
									rows="3"
									placeholder="Brief description of this category"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Icon
								</label>
								<div className="grid grid-cols-8 gap-2">
									{iconOptions.map((icon) => (
										<button
											key={icon}
											type="button"
											onClick={() => setFormData(prev => ({ ...prev, icon }))}
											className={`w-10 h-10 flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
												formData.icon === icon
													? 'border-blue-500 bg-blue-50'
													: 'border-gray-200 hover:border-gray-300'
											}`}
										>
											{icon}
										</button>
									))}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Color
								</label>
								<div className="flex items-center gap-3">
									<input
										type="color"
										value={formData.color}
										onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
										className="w-16 h-10 rounded cursor-pointer"
									/>
									<input
										type="text"
										value={formData.color}
										onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
										placeholder="#3B82F6"
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>
							</div>
							<div className="flex gap-3 mt-6">
								<button
									type="button"
									onClick={handleCloseModal}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									{editingCategory ? 'Update' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Categories;
