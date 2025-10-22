import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/admin");
		}
	}, [isAuthenticated, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await login(email, password);
		
		if (result.success) {
			navigate("/admin");
		} else {
			setError(result.message || "Login failed");
		}
		
		setLoading(false);
	};
	return (
		<div className=' flex items-center justify-center h-screen'>
			<div className='w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg relative'>
				<button
					onClick={() => navigate('/')}
					className='absolute top-4 left-4 p-2 text-gray-600 hover:text-primary transition-colors'
					aria-label='Back to homepage'
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
				</button>
				<div className='flex flex-col items-center justify-center '>
					<div className='w-full py-6 text-center'>
						<h1 className='text-3xl font-bold'>
							<span className='text-primary'>Admin</span>
							Login
						</h1>
						<p className='font-light'>
							Enter your credentials to access the admin panel
						</p>
					</div>
				</div>
				<form
					onSubmit={handleSubmit}
					className='w-full mt-6 sm:max-w-md text-gray-600'>
					{error && (
						<div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
							{error}
						</div>
					)}
					<div className=' flex flex-col'>
						<label htmlFor='email'>Email</label>
						<input
							value={email}
							type='email'
							required
							placeholder='Your Email Id'
							className='border-b-2 border-gray-300 p-2 outline-none mb-6'
							onChange={(e) => {
								setEmail(e.target.value);
							}}
						/>
					</div>
					<div className=' flex flex-col'>
						<label htmlFor='password'>Email</label>
						<input
							value={password}
							type='password'
							required
							placeholder='Your Password'
							className='border-b-2 border-gray-300 p-2 outline-none mb-6'
							onChange={(e) => {
								setPassword(e.target.value);
							}}
						/>
					</div>
					<button
						type='submit'
						disabled={loading}
						className='w-full py-3 font-medium bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
