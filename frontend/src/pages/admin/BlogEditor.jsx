import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogAPI, categoryAPI, uploadAPI } from '../../utils/api';

const BlogEditor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = !!id;
	const contentRef = useRef(null);

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		content: '',
		category: '',
		image: '',
		tags: []
	});

	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [showAIModal, setShowAIModal] = useState(false);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiPrompt, setAiPrompt] = useState({
		topic: '',
		category: '',
		tone: 'professional'
	});
	const [showImproveModal, setShowImproveModal] = useState(false);
	const [improveInstruction, setImproveInstruction] = useState('');

	useEffect(() => {
		fetchCategories();
		if (isEditMode) {
			fetchBlog();
		}
	}, [id]);

	const fetchCategories = async () => {
		try {
			const response = await categoryAPI.getAll();
			if (response.data.success) {
				setCategories(response.data.categories);
			}
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	const fetchBlog = async () => {
		try {
			const response = await blogAPI.getById(id);
			if (response.data.success) {
				const blog = response.data.blog;
				setFormData({
					title: blog.title,
					description: blog.description,
					content: blog.content,
					category: blog.category._id,
					image: blog.image,
					tags: blog.tags || []
				});
			}
		} catch (error) {
			console.error('Error fetching blog:', error);
			alert('Failed to load blog');
			navigate('/admin/blogs');
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Insert HTML tags at cursor position
	const insertTag = (startTag, endTag) => {
		const textarea = contentRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = formData.content.substring(start, end);
		const beforeText = formData.content.substring(0, start);
		const afterText = formData.content.substring(end);

		const newContent = beforeText + startTag + selectedText + endTag + afterText;
		
		setFormData(prev => ({
			...prev,
			content: newContent
		}));

		// Set cursor position after inserted tags
		setTimeout(() => {
			textarea.focus();
			const newPosition = start + startTag.length + selectedText.length;
			textarea.setSelectionRange(newPosition, newPosition);
		}, 0);
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			setUploading(true);
			const response = await uploadAPI.uploadImage(file);
			if (response.data.success) {
				setFormData(prev => ({
					...prev,
					image: response.data.fileUrl
				}));
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Failed to upload image');
		} finally {
			setUploading(false);
		}
	};

	const handleGenerateWithAI = async () => {
		if (!aiPrompt.topic || !aiPrompt.category) {
			alert('Please provide topic and category');
			return;
		}

		try {
			setAiLoading(true);
			const response = await blogAPI.generate({
				topic: aiPrompt.topic,
				category: aiPrompt.category,
				tone: aiPrompt.tone
			});

			if (response.data.success) {
				const blog = response.data.blog;
				setFormData({
					title: blog.title,
					description: blog.description,
					content: blog.content,
					category: blog.category._id || aiPrompt.category,
					image: blog.image || '',
					tags: blog.tags || []
				});
				setShowAIModal(false);
				alert('Blog generated successfully! You can now edit and save it.');
			}
		} catch (error) {
			console.error('Error generating blog:', error);
			alert(error.response?.data?.message || 'Failed to generate blog');
		} finally {
			setAiLoading(false);
		}
	};

	const handleImproveBlog = async () => {
		if (!improveInstruction || !id) {
			alert('Please provide improvement instruction');
			return;
		}

		try {
			setAiLoading(true);
			const response = await blogAPI.improve(id, improveInstruction);

			if (response.data.success) {
				setFormData(prev => ({
					...prev,
					content: response.data.blog.content
				}));
				setShowImproveModal(false);
				setImproveInstruction('');
				alert('Blog improved successfully!');
			}
		} catch (error) {
			console.error('Error improving blog:', error);
			alert(error.response?.data?.message || 'Failed to improve blog');
		} finally {
			setAiLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.title || !formData.description || !formData.content || !formData.category) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			setLoading(true);
			let response;

			if (isEditMode) {
				response = await blogAPI.update(id, formData);
			} else {
				response = await blogAPI.create(formData);
			}

			if (response.data.success) {
				alert(`Blog ${isEditMode ? 'updated' : 'created'} successfully!`);
				navigate('/admin/blogs');
			}
		} catch (error) {
			console.error('Error saving blog:', error);
			alert(error.response?.data?.message || 'Failed to save blog');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">
						{isEditMode ? 'Edit Blog' : 'Create New Blog'}
					</h1>
					<p className="text-gray-600 mt-1">
						{isEditMode ? 'Update your blog post' : 'Write and publish your blog post'}
					</p>
				</div>
				<button
					onClick={() => navigate('/admin/blogs')}
					className="px-4 py-2 text-gray-600 hover:text-gray-800"
				>
					← Back
				</button>
			</div>

			{/* AI Tools */}
			<div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow p-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold flex items-center gap-2">
							<span>✨</span>
							<span>AI Writing Assistant</span>
						</h2>
						<p className="text-purple-100 mt-1">
							Use Google Gemini AI to generate or improve your content
						</p>
					</div>
					<div className="flex gap-3">
						{!isEditMode && (
							<button
								type="button"
								onClick={() => alert('🤖 AI Feature Coming Soon!\n\nWe\'re working on integrating AI-powered blog generation. Stay tuned!')}
								className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
							>
								✨ Generate Blog (Coming Soon)
							</button>
						)}
						{isEditMode && (
							<button
								type="button"
								onClick={() => alert('🤖 AI Feature Coming Soon!\n\nWe\'re working on AI-powered content improvement. Stay tuned!')}
								className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
							>
								✨ Improve Content (Coming Soon)
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
				<div className="p-6 space-y-6">
					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Title <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
							placeholder="Enter blog title..."
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Description */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Description <span className="text-red-500">*</span>
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							required
							rows="3"
							placeholder="Brief description of your blog..."
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Category */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Category <span className="text-red-500">*</span>
						</label>
						<select
							name="category"
							value={formData.category}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select a category</option>
							{categories.map((cat) => (
								<option key={cat._id} value={cat._id}>
									{cat.icon} {cat.name}
								</option>
							))}
						</select>
					</div>

					{/* Image Upload */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Featured Image
						</label>
						<div className="flex items-center gap-4">
							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								disabled={uploading}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{uploading && <span className="text-blue-600">Uploading...</span>}
						</div>
						{formData.image && (
							<img
								src={`http://localhost:5000${formData.image}`}
								alt="Preview"
								className="mt-4 w-full max-w-md h-48 object-cover rounded-lg"
							/>
						)}
					</div>

					{/* Content */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Content <span className="text-red-500">*</span>
						</label>
						
						{/* Rich Text Editor Toolbar */}
						<div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-2 items-center justify-between">
							<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => insertTag('<h2>', '</h2>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
								title="Heading 2"
							>
								H2
							</button>
							<button
								type="button"
								onClick={() => insertTag('<h3>', '</h3>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold"
								title="Heading 3"
							>
								H3
							</button>
							<button
								type="button"
								onClick={() => insertTag('<strong>', '</strong>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold"
								title="Bold"
							>
								<strong>B</strong>
							</button>
							<button
								type="button"
								onClick={() => insertTag('<em>', '</em>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm italic"
								title="Italic"
							>
								<em>I</em>
							</button>
							<button
								type="button"
								onClick={() => insertTag('<u>', '</u>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm underline"
								title="Underline"
							>
								U
							</button>
							<button
								type="button"
								onClick={() => insertTag('<p>', '</p>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
								title="Paragraph"
							>
								¶
							</button>
							<button
								type="button"
								onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
								title="Bullet List"
							>
								• List
							</button>
							<button
								type="button"
								onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
								title="Numbered List"
							>
								1. List
							</button>
							<button
								type="button"
								onClick={() => insertTag('<a href="URL">', '</a>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm text-blue-600"
								title="Link"
							>
								🔗 Link
							</button>
							<button
								type="button"
								onClick={() => insertTag('<span style="color: red;">', '</span>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm text-red-600"
								title="Red Text"
							>
								🎨 Red
							</button>
							<button
								type="button"
								onClick={() => insertTag('<span style="color: blue;">', '</span>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm text-blue-600"
								title="Blue Text"
							>
								🎨 Blue
							</button>
							<button
								type="button"
								onClick={() => insertTag('<span style="color: green;">', '</span>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm text-green-600"
								title="Green Text"
							>
								🎨 Green
							</button>
							<button
								type="button"
								onClick={() => insertTag('<blockquote>', '</blockquote>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm"
								title="Quote"
							>
								" Quote
							</button>
							<button
								type="button"
								onClick={() => insertTag('<code>', '</code>')}
								className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-mono"
								title="Code"
							>
								&lt;/&gt; Code
							</button>
							</div>
							<span className="text-xs text-gray-600 font-medium">Editor & Live Preview</span>
						</div>
						
						{/* Split View: Editor + Preview */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Editor */}
							<div>
								<div className="text-xs font-medium text-gray-600 mb-2 px-2">Editor</div>
								<textarea
									ref={contentRef}
									name="content"
									value={formData.content}
									onChange={handleChange}
									required
									rows="25"
									placeholder="Write your blog content here... Use the toolbar buttons above to format your text."
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
								/>
							</div>
							
							{/* Live Preview */}
							<div>
								<div className="text-xs font-medium text-gray-600 mb-2 px-2">Live Preview</div>
								<div className="border border-gray-300 rounded-lg p-6 bg-white min-h-[600px] max-h-[600px] overflow-y-auto">
									{formData.content ? (
										<div 
											className="rich-text"
											dangerouslySetInnerHTML={{ __html: formData.content }}
										/>
									) : (
										<div className="flex items-center justify-center h-full text-gray-400">
											<div className="text-center">
												<div className="text-4xl mb-2">👁️</div>
												<p className="text-sm">Preview will appear here</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Tags */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tags (comma separated)
						</label>
						<input
							type="text"
							value={formData.tags.join(', ')}
							onChange={(e) => setFormData(prev => ({
								...prev,
								tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
							}))}
							placeholder="technology, programming, web development"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={() => navigate('/admin/blogs')}
						className="px-6 py-2 text-gray-700 hover:text-gray-900"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Saving...' : (isEditMode ? 'Update Blog' : 'Create Blog')}
					</button>
				</div>
			</form>

			{/* AI Generate Modal */}
			{showAIModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">Generate Blog with AI</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Topic
								</label>
								<input
									type="text"
									value={aiPrompt.topic}
									onChange={(e) => setAiPrompt(prev => ({ ...prev, topic: e.target.value }))}
									placeholder="e.g., Introduction to React Hooks"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Category
								</label>
								<select
									value={aiPrompt.category}
									onChange={(e) => setAiPrompt(prev => ({ ...prev, category: e.target.value }))}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option value="">Select a category</option>
									{categories.map((cat) => (
										<option key={cat._id} value={cat._id}>
											{cat.icon} {cat.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Tone
								</label>
								<select
									value={aiPrompt.tone}
									onChange={(e) => setAiPrompt(prev => ({ ...prev, tone: e.target.value }))}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									<option value="professional">Professional</option>
									<option value="casual">Casual</option>
									<option value="technical">Technical</option>
									<option value="friendly">Friendly</option>
								</select>
							</div>
						</div>
						<div className="mt-6 flex gap-3">
							<button
								onClick={() => setShowAIModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleGenerateWithAI}
								disabled={aiLoading}
								className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
							>
								{aiLoading ? 'Generating...' : 'Generate'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* AI Improve Modal */}
			{showImproveModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">Improve Content with AI</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Instruction
								</label>
								<textarea
									value={improveInstruction}
									onChange={(e) => setImproveInstruction(e.target.value)}
									placeholder="e.g., Make it more engaging, Add more examples, Simplify the language"
									rows="4"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
								/>
							</div>
						</div>
						<div className="mt-6 flex gap-3">
							<button
								onClick={() => {
									setShowImproveModal(false);
									setImproveInstruction('');
								}}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleImproveBlog}
								disabled={aiLoading}
								className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
							>
								{aiLoading ? 'Improving...' : 'Improve'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BlogEditor;
