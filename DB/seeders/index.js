import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedUsers from './users.seeder.js';
import seedCategories from './categories.seeder.js';
import seedBrands from './brands.seeder.js';
import seedProducts from './products.seeder.js';

dotenv.config();
const MONGO_URI = process.env.CONNECTION_URL_HOST;

const seedAll = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await seedUsers();
    await seedCategories();
    await seedBrands();
    await seedProducts();

    console.log('Done seeding!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedAll();
