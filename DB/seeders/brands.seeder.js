import Brand from '../models/brand-model.js';
import Category from '../models/category-model.js';
import User from '../models/user-model.js';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

const seedBrands = async () => {
  console.log('Seeding brands...');
  await Brand.deleteMany();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('Admin user not found');

  const categories = await Category.find();
  if (!categories.length) throw new Error('No categories found');

  const fakeBrands = Array.from({ length: 5 }).map(() => {
    const name = faker.company.name();
    const category = faker.helpers.arrayElement(categories);
    return {
      name,
      slug: slugify(name, { lower: true }),
      description: faker.company.catchPhrase(),
      logo: {
        secure_url: `https://picsum.photos/seed/brand${Math.random()}/300/300`,
        public_id: faker.string.uuid(),
      },
      isActive: true,
      addedBy: admin._id,
      updatedBy: null,
      metadata: {
        reputation: faker.commerce.productAdjective(),
      },
      category: category._id,
    };
  });

  const brandDocs = await Brand.insertMany(fakeBrands);
  console.log(`Inserted ${brandDocs.length} brands`);

  return brandDocs.map((brand) => brand._id);
};

export default seedBrands;
