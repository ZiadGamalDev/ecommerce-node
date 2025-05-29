import Product from '../models/product-model.js';
import Brand from '../models/brand-model.js';
import User from '../models/user-model.js';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';

const seedProducts = async () => {
  console.log('Seeding products...');
  await Product.deleteMany();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('Admin user not found');

  const brands = await Brand.find().populate('category');
  if (!brands.length) throw new Error('No brands found');

  const products = [];

  for (let i = 0; i < 10; i++) {
    const brand = faker.helpers.arrayElement(brands);

    const basePrice = faker.number.int({ min: 100, max: 1000 });
    const discountValue = faker.number.int({ min: 0, max: 30 });
    const discountType = faker.helpers.arrayElement(['fixed', 'percentage']);

    const appliedPrice =
      discountType === 'percentage'
        ? basePrice
        : Math.max(0, basePrice - discountValue);

    const title = faker.commerce.productName();

    products.push({
      title,
      description: faker.commerce.productDescription(),
      slug: slugify(title, { lower: true }),
      folderId: faker.string.alphanumeric(16),
      basePrice,
      discount: {
        type: discountType,
        value: discountValue,
      },
      appliedPrice,
      stock: faker.number.int({ min: 0, max: 100 }),
      rate: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      images: [
        {
          secure_url: `https://picsum.photos/seed/product${Math.random()}/600/600`,
          public_id: faker.string.uuid(),
        },
      ],
      specs: {
        color: [faker.color.human()],
        material: [faker.commerce.productMaterial()],
      },
      metadata: {
        madeBy: faker.company.name(),
      },
      isDeleted: false,
      addedBy: admin._id,
      updatedBy: null,
      category: brand.category._id,
      brand: brand._id,
    });
  }

  const productDocs = await Product.insertMany(products);
  console.log(`Inserted ${productDocs.length} products`);
};

export default seedProducts;
