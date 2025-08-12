import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create system roles
  console.log('📝 Creating system roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full system access',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Standard user with basic access',
      isSystem: true,
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with elevated privileges',
      isSystem: true,
    },
  });

  // Create system permissions
  console.log('🔐 Creating system permissions...');
  const permissions = [
    // User management
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:read', resource: 'users', action: 'read', description: 'View user information' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update user information' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'users:list', resource: 'users', action: 'list', description: 'List all users' },
    
    // Role management
    { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create new roles' },
    { name: 'roles:read', resource: 'roles', action: 'read', description: 'View role information' },
    { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update role information' },
    { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
    { name: 'roles:list', resource: 'roles', action: 'list', description: 'List all roles' },
    { name: 'roles:assign', resource: 'roles', action: 'assign', description: 'Assign roles to users' },
    
    // Permission management
    { name: 'permissions:create', resource: 'permissions', action: 'create', description: 'Create new permissions' },
    { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permission information' },
    { name: 'permissions:update', resource: 'permissions', action: 'update', description: 'Update permission information' },
    { name: 'permissions:delete', resource: 'permissions', action: 'delete', description: 'Delete permissions' },
    { name: 'permissions:list', resource: 'permissions', action: 'list', description: 'List all permissions' },
    
    // Communication management
    { name: 'communications:create', resource: 'communications', action: 'create', description: 'Create communications' },
    { name: 'communications:read', resource: 'communications', action: 'read', description: 'View communications' },
    { name: 'communications:update', resource: 'communications', action: 'update', description: 'Update communications' },
    { name: 'communications:delete', resource: 'communications', action: 'delete', description: 'Delete communications' },
    { name: 'communications:list', resource: 'communications', action: 'list', description: 'List all communications' },
    { name: 'communications:send', resource: 'communications', action: 'send', description: 'Send communications' },
    
    // System management
    { name: 'system:config', resource: 'system', action: 'config', description: 'Manage system configuration' },
    { name: 'system:audit', resource: 'system', action: 'audit', description: 'View audit logs' },
    { name: 'system:health', resource: 'system', action: 'health', description: 'View system health' },
    
    // File management
    { name: 'files:upload', resource: 'files', action: 'upload', description: 'Upload files' },
    { name: 'files:download', resource: 'files', action: 'download', description: 'Download files' },
    { name: 'files:delete', resource: 'files', action: 'delete', description: 'Delete files' },
    { name: 'files:list', resource: 'files', action: 'list', description: 'List files' },
    
    // Profile management
    { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
    { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');
  
  // Admin gets all permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets basic permissions
  const userPermissions = allPermissions.filter(p => 
    p.name.includes('profile:') || 
    p.name === 'files:upload' || 
    p.name === 'files:download' ||
    p.name === 'communications:read'
  );
  
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator gets user management and communication permissions
  const moderatorPermissions = allPermissions.filter(p => 
    p.name.includes('users:') || 
    p.name.includes('communications:') ||
    p.name.includes('profile:') ||
    p.name.includes('files:')
  );
  
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@template.com' },
    update: {},
    create: {
      email: 'admin@template.com',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create demo user
  console.log('👤 Creating demo user...');
  const demoPassword = await bcrypt.hash('Demo123!', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@template.com' },
    update: {},
    create: {
      email: 'demo@template.com',
      username: 'demo',
      firstName: 'Demo',
      lastName: 'User',
      password: demoPassword,
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Assign user role to demo user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: demoUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      roleId: userRole.id,
    },
  });

  // Create system configurations
  console.log('⚙️ Creating system configurations...');
  const configs = [
    { key: 'app.name', value: 'Template Backend', type: 'string', description: 'Application name', category: 'general', isPublic: true },
    { key: 'app.version', value: '1.0.0', type: 'string', description: 'Application version', category: 'general', isPublic: true },
    { key: 'app.maintenance', value: 'false', type: 'boolean', description: 'Maintenance mode', category: 'general', isPublic: true },
    { key: 'auth.registration_enabled', value: 'true', type: 'boolean', description: 'Allow user registration', category: 'auth', isPublic: true },
    { key: 'auth.email_verification_required', value: 'false', type: 'boolean', description: 'Require email verification', category: 'auth', isPublic: false },
    { key: 'files.max_upload_size', value: '10485760', type: 'number', description: 'Maximum file upload size in bytes', category: 'files', isPublic: true },
    { key: 'pagination.default_page_size', value: '20', type: 'number', description: 'Default pagination size', category: 'pagination', isPublic: true },
    { key: 'pagination.max_page_size', value: '100', type: 'number', description: 'Maximum pagination size', category: 'pagination', isPublic: true },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('📋 Created accounts:');
  console.log('   Admin: admin@template.com / Admin123!');
  console.log('   Demo:  demo@template.com / Demo123!');
  console.log('');
  console.log('🔐 Created roles:');
  console.log('   - admin (full access)');
  console.log('   - moderator (user & communication management)');
  console.log('   - user (basic access)');
  console.log('');
  console.log(`📊 Created ${allPermissions.length} permissions`);
  console.log(`⚙️ Created ${configs.length} system configurations`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

