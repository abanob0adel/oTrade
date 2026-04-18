import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true },
  password: String,
  role: String,
  permissions: Array,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

const allPermissions = [
  {
    psychology:    ['view', 'create', 'update', 'delete'],
    courses:       ['view', 'create', 'update', 'delete'],
    analysis:      ['view', 'create', 'update', 'delete'],
    plans:         ['view', 'create', 'update', 'delete'],
    webinars:      ['view', 'create', 'update', 'delete'],
    testimonials:  ['view', 'create', 'update', 'delete'],
    users:         ['view', 'create', 'update', 'delete'],
    admins:        ['view', 'create', 'update', 'delete'],
    subscriptions: ['view', 'create', 'update', 'delete'],
    support:       ['view', 'create', 'update', 'delete'],
    calendar:      ['view', 'create', 'update', 'delete'],
    strategies:    ['view', 'create', 'update', 'delete'],
    books:         ['view', 'create', 'update', 'delete'],
    articles:      ['view', 'create', 'update', 'delete'],
    partners:      ['view', 'create', 'update', 'delete'],
    brokers:       ['view', 'create', 'update', 'delete'],
    news:          ['view', 'create', 'update', 'delete'],
    emails:        ['view', 'create', 'update', 'delete'],
    indicators:    ['view', 'create', 'update', 'delete'],
  }
];

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const email = 'superadmin@otrade.ae';
  const password = 'SuperAdmin@2026';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Super admin already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new Admin({
    name: 'Super Admin',
    email,
    password: hashedPassword,
    role: 'super_admin',
    permissions: allPermissions,
    isActive: true
  });

  await admin.save();
  console.log('✅ Super admin created successfully');
  console.log('Email:', email);
  console.log('Password:', password);
  process.exit(0);
}

createSuperAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
