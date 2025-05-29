import User from '../models/user-model.js';
import { faker } from '@faker-js/faker';
import { systemRoles } from "../../src/utils/system-roles.js";
import bcrypt from 'bcrypt';

const password = "123456zZ";
const hashPassword = async (pwd) => await bcrypt.hash(pwd, 10);

const generateValidPhone = () => {
  const prefix = faker.helpers.arrayElement(['010', '011', '012', '015']);
  const rest = faker.string.numeric(8);
  return prefix + rest;
};

const generateValidAddress = () => faker.location.streetAddress(true);

const generateUser = async (role = systemRoles.USER) => ({
  username: faker.internet.username().substring(0, 20), // trim long usernames
  email: faker.internet.email().toLowerCase().replace(/\..+@/, '@'), // prevent weird dots in local-part
  password: await hashPassword(password),
  phoneNumbers: [generateValidPhone()],
  addresses: [generateValidAddress()],
  age: faker.number.int({ min: 18, max: 100 }),
  isEmailVerified: true,
  role,
});

const seedUsers = async () => {
  console.log('Seeding users...');
  await User.deleteMany();

  // Real Users
  const realUsers = [
    {
      username: 'AhmedMostafa',
      email: 'ahmedmostafa@example.com',
      role: systemRoles.USER,
    },
    {
      username: 'SondosOmar',
      email: 'sondosomar@example.com',
      role: systemRoles.ADMIN,
    },
  ];

  const realUserDocs = await Promise.all(
    realUsers.map(async (user) =>
      User.create({
        ...user,
        password: await hashPassword(password),
        phoneNumbers: [generateValidPhone()],
        addresses: [generateValidAddress()],
        age: faker.number.int({ min: 18, max: 100 }),
        isEmailVerified: true,
      })
    )
  );

  // Dummy Users
  const dummyUsers = await Promise.all([
    generateUser(),
    generateUser(),
    generateUser(),
  ]);

  const dummyUserDocs = await User.insertMany(dummyUsers);

  console.log(`Inserted ${realUserDocs.length + dummyUserDocs.length} users`);
  return [...realUserDocs, ...dummyUserDocs].map((u) => u._id);
};

export default seedUsers;
