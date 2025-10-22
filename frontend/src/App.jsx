import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Blog from "./pages/Blog";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import BlogList from "./pages/admin/BlogList";
import BlogEditor from "./pages/admin/BlogEditor";
import Publishers from "./pages/admin/Publishers";
import Categories from "./pages/admin/Categories";
import Comments from "./pages/admin/Comments";

const ProtectedRoute = ({ children, adminOnly = false }) => {
	const { isAuthenticated, isAdmin, loading } = useAuth();

	if (loading) {
		return <div className="flex items-center justify-center h-screen">Loading...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (adminOnly && !isAdmin) {
		return <Navigate to="/admin" replace />;
	}

	return children;
};

const App = () => {
	return (
		<div>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/blog/:id' element={<Blog />} />
				<Route path='/login' element={<Login />} />
				
				<Route path='/admin' element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}>
					<Route index element={<Dashboard />} />
					<Route path='blogs' element={<BlogList />} />
					<Route path='blogs/new' element={<BlogEditor />} />
					<Route path='blogs/edit/:id' element={<BlogEditor />} />
					<Route path='publishers' element={
						<ProtectedRoute adminOnly={true}>
							<Publishers />
						</ProtectedRoute>
					} />
					<Route path='categories' element={<Categories />} />
					<Route path='comments' element={
						<ProtectedRoute adminOnly={true}>
							<Comments />
						</ProtectedRoute>
					} />
				</Route>
			</Routes>
		</div>
	);
};

export default App;
