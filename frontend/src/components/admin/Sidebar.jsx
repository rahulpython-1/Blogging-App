import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ onClose }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { logout, isAdmin } = useAuth();

	const menuItems = [
		{ path: "/admin", label: "Dashboard", icon: "📊", exact: true },
		{ path: "/admin/blogs", label: "Blogs", icon: "📝" },
		{ path: "/admin/categories", label: "Categories", icon: "📁" },
		...(isAdmin ? [
			{ path: "/admin/publishers", label: "Publishers", icon: "👥" },
			{ path: "/admin/comments", label: "Comments", icon: "💬" },
		] : []),
	];

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const isActive = (item) => {
		if (item.exact) {
			return location.pathname === item.path;
		}
		return location.pathname.startsWith(item.path);
	};

	return (
		<div className='w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-sm'>
			{/* Header */}
			<div className='p-6 border-b border-gray-200'>
				<div className='flex items-center justify-between'>
					<h1 className='text-gray-800 text-2xl font-bold'>Admin Panel</h1>
					{/* Close button for mobile */}
					<button
						onClick={onClose}
						className='md:hidden text-gray-600 hover:text-gray-800 transition-colors'
						aria-label='Close sidebar'
					>
						<svg
							className='w-6 h-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Navigation */}
			<nav className='flex-1 overflow-y-auto py-4 px-3'>
				<ul className='space-y-2'>
					{menuItems.map((item) => (
						<li key={item.path}>
							<Link
								to={item.path}
								onClick={() => {
									// Close sidebar on mobile when clicking a link
									if (window.innerWidth < 768) {
										onClose?.();
									}
								}}
								className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
									isActive(item)
										? "bg-primary text-white shadow-md"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								<span className='text-xl'>{item.icon}</span>
								<span className='font-medium'>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Footer */}
			<div className='p-4 border-t border-gray-200'>
				<button 
					onClick={handleLogout}
					className='w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'>
					<span className='text-xl'>🚪</span>
					<span className='font-medium'>Logout</span>
				</button>
			</div>
		</div>
	);
};

export default Sidebar;
