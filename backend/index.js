import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Load env vars
dotenv.config();

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
	console.error('❌ Uncaught Exception:', error.message);
	console.error(error.stack);
	// Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('❌ Unhandled Rejection at:', promise);
	console.error('Reason:', reason);
	// Don't exit - keep server running
});

// Connect to database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = [
	"https://blogging-app-coral-six.vercel.app",
	"http://localhost:5173",
	"http://localhost:5000"
];

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			
			if (allowedOrigins.indexOf(origin) !== -1 || process.env.FRONTEND_URL === origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	})
);

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/comments", commentRoutes);

// Health check route
app.get("/api/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
	});
});

// 404 handler - must come before error handler
app.use((req, res, next) => {
	res.status(404).json({
		success: false,
		message: 'Route not found'
	});
});

// Global error handler - catches all errors
app.use((err, req, res, next) => {
	console.error('❌ Error occurred:');
	console.error('Message:', err.message);
	console.error('Stack:', err.stack);
	
	// Prevent server crash by always sending a response
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Internal Server Error';
	
	// Don't expose internal errors in production
	const response = {
		success: false,
		message: process.env.NODE_ENV === 'production' && statusCode === 500 
			? 'Internal Server Error' 
			: message
	};
	
	// Add stack trace in development
	if (process.env.NODE_ENV !== 'production') {
		response.stack = err.stack;
	}
	
	res.status(statusCode).json(response);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	console.log(
		`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
	);
});

// Handle server errors
server.on('error', (error) => {
	console.error('❌ Server Error:', error.message);
	if (error.code === 'EADDRINUSE') {
		console.error(`Port ${PORT} is already in use`);
	}
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received. Shutting down gracefully...');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('\nSIGINT received. Shutting down gracefully...');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});
