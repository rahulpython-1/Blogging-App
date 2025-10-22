import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import { format } from "date-fns";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { blogAPI, commentAPI } from "../utils/api";

const Blog = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [data, setData] = useState(null);
	const [date, setDate] = useState("");
	const [comments, setComments] = useState([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(true);
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);
	
	const fetchBlogData = async () => {
		try {
			const response = await blogAPI.getById(id);
			if (response.data.success) {
				const blogData = response.data.blog;
				setData(blogData);
				setDate(format(new Date(blogData.createdAt), "dd MMMM yyyy"));
			}
		} catch (error) {
			console.error('Error fetching blog:', error);
			alert('Blog not found');
			navigate('/');
		} finally {
			setLoading(false);
		}
	};

	const fetchComments = async () => {
		try {
			const response = await commentAPI.getBlogComments(id);
			if (response.data.success) {
				setComments(response.data.comments);
			}
		} catch (error) {
			console.error('Error fetching comments:', error);
		}
	};

	const addComments = async (e) => {
		e.preventDefault();
		
		if (!name || !email || !comment) {
			alert('Please fill in all fields');
			return;
		}

		try {
			setSubmitting(true);
			const response = await commentAPI.create({
				blog: id,
				name,
				email,
				content: comment
			});

			if (response.data.success) {
				alert(response.data.message);
				setName('');
				setEmail('');
				setComment('');
				// Refresh comments
				fetchComments();
			}
		} catch (error) {
			console.error('Error adding comment:', error);
			alert(error.response?.data?.message || 'Failed to add comment');
		} finally {
			setSubmitting(false);
		}
	};

	useEffect(() => {
		fetchBlogData();
		fetchComments();
	}, [id]);
	return loading ? (
		<Loader />
	) : (
		<div className='relative '>
			<img
				src={assets.gradientBackground}
				alt=''
				className=' absolute -top-50 -z-1 opacity-50'
			/>
			<Navbar />
			<div className='text-center mt-20 text-gray-600'>
				<p className='text-primary py-4 font-medium'>
					Published on {date}
				</p>
				<h1 className='text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800'>
					{data?.title}
				</h1>
				<h2 className='my-5 max-w-lg mx-auto px-4'>
					{data?.description}
				</h2>
				<div className='flex items-center justify-center gap-2 mb-6'>
					<p className='inline-block py-1 px-4 rounded-full border text-sm border-primary/35 bg-primary/5 font-medium text-primary'>
						{data?.authorName}
					</p>
					{data?.category && (
						<p className='inline-block py-1 px-4 rounded-full border text-sm border-gray-300 bg-gray-50 font-medium text-gray-700'>
							{data.category.icon} {data.category.name}
						</p>
					)}
				</div>
			</div>
			<div className='mx-5 max-w-5xl md:mx-auto my-10 mt-6'>
				{data?.image && (
					<img
						src={`http://localhost:5000${data.image}`}
						alt={data.title}
						className='rounded-3xl mb-5 w-full h-96 object-cover'
					/>
				)}
				<div
					className='rich-text max-w-3xl mx-auto'
					dangerouslySetInnerHTML={{
						__html: data?.content,
					}}></div>
				{/* Comments Section */}
				<div className='mt-14 mb-10 max-w-3xl mx-auto'>
					<p className='font-semibold mb-4'>
						Comments ({comments.length})
					</p>
					{comments.length === 0 ? (
						<p className='text-gray-500 text-center py-8'>No comments yet. Be the first to comment!</p>
					) : (
						<div className='flex flex-col gap-4'>
							{comments.map((comment, index) => (
								<div
									key={index}
									className='relative bg-primary/2 border
									border-primary/5 max-w-xl p-4 text-gray-600'>
									<div className='flex items-center gap-2 mb-2'>
										<img
											src={assets.user_icon}
											alt=''
											className='w-6'
										/>
										<p className='font-medium'>
											{comment.name}
										</p>
									</div>
									<p className='text-sm max-w-md ml-8'>
										{comment.content}
									</p>
									<div className='absolute right-4 bottom-3 flex items-center gap-2 text-xs '>
										{format(
											new Date(comment.createdAt),
											"dd MMMM yyyy"
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				{/* Comment Form */}
				<div className='max-w-3xl mx-auto'>
					<p className='font-semibold mb-4'>Add Your Comment</p>
					<form
						onSubmit={addComments}
						className='flex flex-col items-start gap-4 max-w-lg'>
						<input
							onChange={(e) => setName(e.target.value)}
							type='text'
							placeholder='Your Name'
							value={name}
							required
							className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary'
						/>
						<input
							onChange={(e) => setEmail(e.target.value)}
							type='email'
							placeholder='Your Email'
							value={email}
							required
							className='w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary'
						/>
						<textarea
							onChange={(e) => setComment(e.target.value)}
							placeholder='Write your comment here...'
							required
							value={comment}
							className='w-full p-3 border border-gray-300 rounded-lg outline-none h-32 resize-none focus:ring-2 focus:ring-primary'></textarea>
						<button
							type='submit'
							disabled={submitting}
							className='bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
							{submitting ? 'Submitting...' : 'Submit Comment'}
						</button>
						<p className='text-xs text-gray-500'>
							Your comment will be visible after admin approval.
						</p>
					</form>
				</div>
				{/* social share */}
				<div className='my-24 max-w-3xl mx-auto'>
					<p className='font-semibold my-4'>
						Share this artice on social media
					</p>
					<div className='flex'>
						<img
							src={assets.facebook_icon}
							alt=''
							width={50}
						/>
						<img
							src={assets.twitter_icon}
							alt=''
							width={50}
						/>
						<img
							src={assets.googleplus_icon}
							alt=''
							width={50}
						/>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Blog;
