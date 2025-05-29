import Category from '../models/category-model.js';
import User from '../models/user-model.js';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

const seedCategories = async () => {
  console.log('Seeding categories...');
  await Category.deleteMany();

  // Ensure there is at least one admin user to associate categories with
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    throw new Error('Admin user not found. Cannot seed categories.');
  }

  // Ensure unique category names to avoid duplicate key errors
  const uniqueNames = new Set();
  while (uniqueNames.size < 5) {
    uniqueNames.add(faker.commerce.department());
  }

  const fakeCategories = Array.from(uniqueNames).map((name) => ({
    name,
    slug: slugify(name, { lower: true }),
    description: faker.commerce.productDescription(),
    image: {
      secure_url: `https://picsum.photos/seed/category${Math.random()}/600/400`,
      public_id: faker.string.uuid(),
    },
    folderId: faker.string.alphanumeric(16),
    isActive: true,
    addedBy: admin._id,
    updatedBy: null,
    metadata: {
      source: faker.company.name(),
    },
  }));

  const categoryDocs = await Category.insertMany(fakeCategories);
  console.log(`Inserted ${categoryDocs.length} categories`);

  return categoryDocs.map((cat) => cat._id);
};

export default seedCategories;
