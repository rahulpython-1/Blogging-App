import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Category Schema (inline for this script)
const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  slug: String,
  icon: String,
  color: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const Category = mongoose.model('Category', categorySchema);

const categories = [
  {
    name: 'Technology',
    description: 'Latest tech news, tutorials, and insights',
    icon: '💻',
    color: '#3B82F6',
    isActive: true
  },
  {
    name: 'Programming',
    description: 'Coding tutorials, best practices, and tips',
    icon: '🔧',
    color: '#8B5CF6',
    isActive: true
  },
  {
    name: 'Design',
    description: 'UI/UX design, graphics, and creative content',
    icon: '🎨',
    color: '#EC4899',
    isActive: true
  },
  {
    name: 'Business',
    description: 'Business strategies, entrepreneurship, and growth',
    icon: '📊',
    color: '#10B981',
    isActive: true
  },
  {
    name: 'Lifestyle',
    description: 'Life tips, productivity, and personal development',
    icon: '🌟',
    color: '#F59E0B',
    isActive: true
  },
  {
    name: 'Travel',
    description: 'Travel guides, tips, and experiences',
    icon: '✈️',
    color: '#06B6D4',
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogging-app');
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Create categories with slugs
    const categoriesWithSlugs = categories.map(cat => ({
      ...cat,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await Category.insertMany(categoriesWithSlugs);

    console.log('✅ Categories seeded successfully!');
    console.log(`Created ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
