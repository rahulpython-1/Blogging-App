import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
	const navigate = useNavigate();
	return (
		<div className=' flex items-center justify-between py-5 mx-8 sm:mx-20 xl:mx-32 cursor-pointer'>
			<img
				onClick={() => {
					navigate("/");
				}}
				src={assets.logo}
				alt='logo'
				className=' w-32 sm:w-44'
			/>
			<button
				onClick={() => {
					navigate("/login");
				}}
				className='flex items-center rounded-full bg-primary text-white gap-2 text-sm cursor-pointer px-10 py-2.5 '>
				Login
				<img
					src={assets.arrow}
					className='w-3'
					alt='arrow'
				/>
			</button>
		</div>
	);
};

export default Navbar;
