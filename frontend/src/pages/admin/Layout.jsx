import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";

const Layout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div className='w-screen h-screen flex overflow-hidden'>
			{/* Mobile overlay */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
					onClick={toggleSidebar}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed md:static inset-y-0 left-0 z-50 w-64 lg:w-72 h-full bg-white transform transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0`}>
				<Sidebar onClose={toggleSidebar} />
			</div>

			{/* Main content area */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* Mobile menu button */}
				<button
					onClick={toggleSidebar}
					className='md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-primary text-white shadow-lg hover:opacity-90 transition-all'
					aria-label='Toggle sidebar'>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						{isSidebarOpen ? (
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						) : (
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M4 6h16M4 12h16M4 18h16'
							/>
						)}
					</svg>
				</button>

				{/* Page content will go here */}
				<div className='flex-1 overflow-auto p-4 md:p-6 bg-gray-50'>
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default Layout;
