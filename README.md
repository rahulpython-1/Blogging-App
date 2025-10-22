# Blogging Application with Admin Panel

A full-stack blogging application with admin controls, publisher management, and Google Gemini AI integration for blog generation.

## Features

### Admin Features
- **Dashboard**: View statistics, recent blogs, top performing blogs, and publishers
- **Publisher Management**: Add, edit, delete, and manage publisher accounts
- **Blog Management**: Full CRUD operations with publish/unpublish controls
- **Category Management**: Create and organize blog categories
- **AI-Powered Blog Generation**: Generate blog content using Google Gemini AI
- **AI Content Improvement**: Improve existing blog content with AI assistance

### Publisher Features
- **Blog Editor**: Rich text editor for creating and editing blogs
- **Draft System**: Save blogs as drafts before publishing
- **Image Upload**: Upload featured images for blogs
- **Tag Management**: Add tags to organize content

### Technical Features
- **Authentication**: JWT-based authentication with role-based access control
- **MongoDB Database**: Scalable NoSQL database
- **RESTful API**: Clean API architecture with ES6 modules
- **Responsive Design**: Mobile-friendly admin panel
- **Real-time Updates**: Dynamic content updates

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI API
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- TailwindCSS for styling
- Context API for state management

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blogging-app
JWT_SECRET=your_jwt_secret_key_here_change_in_production
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Get your Google Gemini API Key:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add it to your `.env` file

5. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

### Create Admin User

Since this is the first setup, you'll need to create an admin user directly in MongoDB:

1. Connect to your MongoDB database
2. Insert an admin user:

```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash: "admin123"
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this Node.js script to create an admin:

```javascript
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/blogging-app');

const createAdmin = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });
  
  console.log('Admin created successfully!');
  process.exit();
};

createAdmin();
```

### Default Login Credentials
- Email: admin@example.com
- Password: admin123

**⚠️ Change these credentials immediately after first login!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/publishers` - Get all publishers

### Blogs
- `GET /api/blogs` - Get all blogs (with filters)
- `GET /api/blogs/:id` - Get single blog
- `GET /api/blogs/slug/:slug` - Get blog by slug
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `PATCH /api/blogs/:id/publish` - Toggle publish status (Admin only)
- `POST /api/blogs/generate` - Generate blog with AI
- `POST /api/blogs/:id/improve` - Improve blog with AI
- `POST /api/blogs/ideas` - Get blog ideas from AI
- `GET /api/blogs/stats/all` - Get blog statistics

### Categories (Admin Only)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Upload
- `POST /api/upload` - Upload image

## Project Structure

```
BloggingApp/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── categoryController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Blog.js
│   │   ├── Category.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── gemini.js
│   ├── uploads/
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── admin/
│   │   │       └── Sidebar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── BlogEditor.jsx
│   │   │   │   ├── BlogList.jsx
│   │   │   │   ├── Categories.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Publishers.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Login.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Usage Guide

### For Admins

1. **Login**: Navigate to `/login` and use admin credentials
2. **Dashboard**: View overall statistics and recent activity
3. **Manage Publishers**: 
   - Go to Publishers page
   - Add new publishers with email and password
   - Activate/deactivate publisher accounts
   - Assign roles (admin/publisher)
4. **Manage Categories**:
   - Create categories with custom icons and colors
   - Edit or delete categories
5. **Manage Blogs**:
   - View all blogs from all publishers
   - Publish or unpublish any blog
   - Edit or delete any blog
   - Use AI to generate new blogs

### For Publishers

1. **Login**: Use credentials provided by admin
2. **Create Blog**:
   - Click "Create New Blog"
   - Fill in title, description, category
   - Upload featured image
   - Write content (HTML supported)
   - Save as draft or submit for publishing
3. **Use AI Features**:
   - Generate complete blog from topic
   - Improve existing content with AI
   - Get blog ideas for inspiration
4. **Manage Your Blogs**:
   - View all your blogs
   - Edit drafts
   - Track views and engagement

## AI Features

### Generate Blog
- Provide a topic and category
- Choose tone (professional, casual, technical, friendly)
- AI generates complete blog with title, description, and content

### Improve Content
- Select existing blog
- Provide improvement instructions
- AI enhances the content based on your requirements

### Blog Ideas
- Get creative blog post ideas
- Filter by category
- Use as inspiration for new content

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- HTTP-only cookies
- Role-based access control
- Protected API routes
- Input validation
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

## Acknowledgments

- Google Gemini AI for content generation
- TailwindCSS for styling
- MongoDB for database
- Express.js for backend framework
- React for frontend framework
