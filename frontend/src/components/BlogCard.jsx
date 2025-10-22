import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ blog }) => {
	const { title, description, category, image, _id } = blog;
	const navigate = useNavigate();
	
	// Handle image URL - add backend URL if needed
	const imageUrl = image ? (image.startsWith('http') ? image : `http://localhost:5000${image}`) : '/placeholder-blog.jpg';
	
	return (
		<div
			onClick={() => {
				navigate(`/blog/${_id}`);
			}}
			className='w-full rounded-lg overflow-hidden shadow hover:scale-105 hover:shadow-xl hover:shadow-primary/25 duration-300 cursor-pointer bg-white'>
			<img
				src={imageUrl}
				alt={title}
				className='aspect-video w-full object-cover'
				onError={(e) => {
					e.target.src = 'https://via.placeholder.com/400x225?text=Blog+Image';
				}}
			/>
			<span className='ml-5 mt-5 px-3 py-1 inline-block bg-primary/20 rounded-full text-primary text-xs font-medium'>
				{category?.icon} {category?.name || category}
			</span>
			<div className='p-5'>
				<h5 className='mb-2 font-medium text-gray-900 line-clamp-2'>{title}</h5>
				<p className='mb-3 text-xs text-gray-600 line-clamp-3'>
					{description}
				</p>
			</div>
		</div>
	);
};

export default BlogCard;
