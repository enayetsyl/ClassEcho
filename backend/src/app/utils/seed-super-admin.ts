// src/app/utils/seed-super-admin.ts
import bcrypt from 'bcrypt';
import { User } from '../modules/user/user.model';
import config from '../../config';

export const seedSuperAdmin = async () => {
  const email = config.super_admin_email;
  const password = config.super_admin_password!;
  const name = 'Super Admin';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Super admin already exists.');
    return;
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await User.create({
    name,
    email,
    passwordHash,
    roles: ['Admin', 'SeniorAdmin', 'Management'],
    active: true,
    mustChangePassword: false,
  });

  console.log('Super admin created successfully!');
};
