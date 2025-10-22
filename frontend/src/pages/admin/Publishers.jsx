import React, { useState, useEffect } from 'react';
import { userAPI } from '../../utils/api';

const Publishers = () => {
	const [publishers, setPublishers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingPublisher, setEditingPublisher] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		role: 'publisher'
	});

	useEffect(() => {
		fetchPublishers();
	}, []);

	const fetchPublishers = async () => {
		try {
			setLoading(true);
			const response = await userAPI.getAll();
			if (response.data.success) {
				setPublishers(response.data.users);
			}
		} catch (error) {
			console.error('Error fetching publishers:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenModal = (publisher = null) => {
		if (publisher) {
			setEditingPublisher(publisher);
			setFormData({
				name: publisher.name,
				email: publisher.email,
				password: '',
				role: publisher.role
			});
		} else {
			setEditingPublisher(null);
			setFormData({
				name: '',
				email: '',
				password: '',
				role: 'publisher'
			});
		}
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingPublisher(null);
		setFormData({
			name: '',
			email: '',
			password: '',
			role: 'publisher'
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			let response;
			if (editingPublisher) {
				const updateData = { ...formData };
				if (!updateData.password) delete updateData.password;
				response = await userAPI.update(editingPublisher._id, updateData);
			} else {
				response = await userAPI.create(formData);
			}

			if (response.data.success) {
				alert(`Publisher ${editingPublisher ? 'updated' : 'created'} successfully!`);
				handleCloseModal();
				fetchPublishers();
			}
		} catch (error) {
			console.error('Error saving publisher:', error);
			alert(error.response?.data?.message || 'Failed to save publisher');
		}
	};

	const handleToggleStatus = async (id, currentStatus) => {
		try {
			const response = await userAPI.update(id, { isActive: !currentStatus });
			if (response.data.success) {
				fetchPublishers();
			}
		} catch (error) {
			console.error('Error toggling status:', error);
			alert('Failed to update status');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Are you sure you want to delete this publisher?')) {
			return;
		}

		try {
			const response = await userAPI.delete(id);
			if (response.data.success) {
				fetchPublishers();
			}
		} catch (error) {
			console.error('Error deleting publisher:', error);
			alert(error.response?.data?.message || 'Failed to delete publisher');
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Publishers</h1>
					<p className="text-gray-600 mt-1">Manage blog publishers and their access</p>
				</div>
				<button
					onClick={() => handleOpenModal()}
					className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<span>➕</span>
					<span>Add Publisher</span>
				</button>
			</div>

			{/* Publishers List */}
			<div className="bg-white rounded-lg shadow">
				{loading ? (
					<div className="p-12 text-center">
						<div className="text-xl text-gray-600">Loading...</div>
					</div>
				) : publishers.length === 0 ? (
					<div className="p-12 text-center">
						<div className="text-6xl mb-4">👥</div>
						<h3 className="text-xl font-semibold text-gray-800 mb-2">No publishers yet</h3>
						<p className="text-gray-600 mb-6">Add your first publisher to start</p>
						<button
							onClick={() => handleOpenModal()}
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<span>➕</span>
							<span>Add Publisher</span>
						</button>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Joined
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{publishers.map((publisher) => (
									<tr key={publisher._id} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
													<span className="text-xl">👤</span>
												</div>
												<div>
													<div className="font-medium text-gray-900">{publisher.name}</div>
													<div className="text-sm text-gray-500">{publisher.email}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													publisher.role === 'admin'
														? 'bg-purple-100 text-purple-800'
														: 'bg-blue-100 text-blue-800'
												}`}
											>
												{publisher.role}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => handleToggleStatus(publisher._id, publisher.isActive)}
												className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
													publisher.isActive
														? 'bg-green-100 text-green-800'
														: 'bg-gray-100 text-gray-800'
												}`}
											>
												{publisher.isActive ? 'Active' : 'Inactive'}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(publisher.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => handleOpenModal(publisher)}
													className="text-blue-600 hover:text-blue-900"
													title="Edit"
												>
													✏️
												</button>
												<button
													onClick={() => handleDelete(publisher._id)}
													className="text-red-600 hover:text-red-900"
													title="Delete"
												>
													🗑️
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							{editingPublisher ? 'Edit Publisher' : 'Add New Publisher'}
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
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email
								</label>
								<input
									type="email"
									value={formData.email}
									onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Password {editingPublisher && '(leave blank to keep current)'}
								</label>
								<input
									type="password"
									value={formData.password}
									onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
									required={!editingPublisher}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Role
								</label>
								<select
									value={formData.role}
									onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="publisher">Publisher</option>
									<option value="admin">Admin</option>
								</select>
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
									{editingPublisher ? 'Update' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Publishers;
