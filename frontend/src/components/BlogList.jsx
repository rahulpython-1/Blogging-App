import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import BlogCard from "./BlogCard";
import { blogAPI, categoryAPI } from "../utils/api";

const BlogList = () => {
	const [menu, setMenu] = useState("All");
	const [blogs, setBlogs] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [blogsRes, categoriesRes] = await Promise.all([
				blogAPI.getAll({ published: 'true' }),
				categoryAPI.getAll()
			]);

			if (blogsRes.data.success) {
				setBlogs(blogsRes.data.blogs);
			}

			if (categoriesRes.data.success) {
				setCategories(categoriesRes.data.categories);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	const categoryNames = ['All', ...categories.map(cat => cat.name)];

	if (loading) {
		return (
			<div className="flex justify-center items-center py-20">
				<div className="text-xl text-gray-600">Loading blogs...</div>
			</div>
		);
	}

	return (
		<div>
			<div className='flex justify-center gap-4 sm:gap-8 my-10 relative flex-wrap'>
				{categoryNames.map((item) => (
					<div
						key={item}
						className='relative '>
						<button
							onClick={() => {
								setMenu(item);
							}}
							className={`cursor-pointer text-gray-500 ${
								menu === item && "text-white px-4 pt-0.5"
							}`}>
							{item}
							{menu === item && (
								<motion.div
									layoutId='underline'
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
									className='absolute left-0 right-0 top-0  h-7  -z-1 bg-primary rounded-full'></motion.div>
							)}
						</button>
					</div>
				))}
			</div>
			<div
				className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
			xl:grid-cols-4 gap-8 mb-24 mx-8 sx:mx-16 '>
				{blogs.length === 0 ? (
					<div className="col-span-full text-center py-20">
						<div className="text-6xl mb-4">📝</div>
						<p className="text-xl text-gray-600">No blogs published yet</p>
					</div>
				) : (
					blogs
						.filter((blog) =>
							menu === "All" ? true : blog.category?.name === menu
						)
						.map((item) => (
							<BlogCard
								key={item._id}
								blog={item}
							/>
						))
				)}
			</div>
		</div>
	);
};

export default BlogList;
