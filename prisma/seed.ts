import { PrismaClient, Permission } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.userRole.deleteMany();
  // await prisma.rolePermission.deleteMany();
  // await prisma.permission.deleteMany();
  // await prisma.role.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.branch.deleteMany();
  // await prisma.company.deleteMany();

  // 1. Create Company
  console.log('📦 Creating company...');
  const company = await prisma.company.upsert({
    where: { code: 'COMP001' },
    update: {},
    create: {
      code: 'COMP001',
      name: 'Công ty TNHH Công nghệ ABC',
      taxCode: '0123456789',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '02812345678',
      email: 'contact@abctech.com',
      website: 'https://abctech.com',
      isActive: true,
      createdBy: 'system',
    },
  });
  console.log(`✅ Company created: ${company.name}`);

  // 2. Create Branches
  console.log('🏢 Creating branches...');
  const branchHQ = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'BR001' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'BR001',
      name: 'Trụ sở chính',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '02812345678',
      email: 'hq@abctech.com',
      isActive: true,
    },
  });

  const branchHN = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'BR002' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'BR002',
      name: 'Chi nhánh Hà Nội',
      address: '456 Đường DEF, Phường GHI, Quận Cầu Giấy, Hà Nội',
      phone: '02498765432',
      email: 'hanoi@abctech.com',
      isActive: true,
    },
  });
  console.log(`✅ Branches created: ${branchHQ.name}, ${branchHN.name}`);

  // 3. Hash password for users
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 4. Create Users
  console.log('👥 Creating users...');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      companyId: company.id,
      branchId: branchHQ.id,
      username: 'admin',
      email: 'admin@abctech.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      phone: '0901234567',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      companyId: company.id,
      branchId: branchHQ.id,
      username: 'manager',
      email: 'manager@abctech.com',
      password: hashedPassword,
      firstName: 'Quản lý',
      lastName: 'Bán hàng',
      phone: '0901234568',
      isActive: true,
    },
  });

  const sales1 = await prisma.user.upsert({
    where: { username: 'sales1' },
    update: {},
    create: {
      companyId: company.id,
      branchId: branchHQ.id,
      username: 'sales1',
      email: 'sales1@abctech.com',
      password: hashedPassword,
      firstName: 'Nhân viên',
      lastName: 'Bán hàng 1',
      phone: '0901234569',
      isActive: true,
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { username: 'sales2' },
    update: {},
    create: {
      companyId: company.id,
      branchId: branchHN.id,
      username: 'sales2',
      email: 'sales2@abctech.com',
      password: hashedPassword,
      firstName: 'Nhân viên',
      lastName: 'Bán hàng 2',
      phone: '0901234570',
      isActive: true,
    },
  });
  console.log(
    `✅ Users created: ${admin.username}, ${manager.username}, ${sales1.username}, ${sales2.username}`,
  );

  // 5. Create Permissions
  console.log('🔐 Creating permissions...');
  const permissions = [
    // Customer permissions
    {
      code: 'customer.create',
      name: 'Tạo khách hàng',
      module: 'customer',
      resource: 'customer',
      action: 'create',
    },
    {
      code: 'customer.read',
      name: 'Xem khách hàng',
      module: 'customer',
      resource: 'customer',
      action: 'read',
    },
    {
      code: 'customer.update',
      name: 'Cập nhật khách hàng',
      module: 'customer',
      resource: 'customer',
      action: 'update',
    },
    {
      code: 'customer.delete',
      name: 'Xóa khách hàng',
      module: 'customer',
      resource: 'customer',
      action: 'delete',
    },
    // Opportunity permissions
    {
      code: 'opportunity.create',
      name: 'Tạo cơ hội',
      module: 'sales',
      resource: 'opportunity',
      action: 'create',
    },
    {
      code: 'opportunity.read',
      name: 'Xem cơ hội',
      module: 'sales',
      resource: 'opportunity',
      action: 'read',
    },
    {
      code: 'opportunity.update',
      name: 'Cập nhật cơ hội',
      module: 'sales',
      resource: 'opportunity',
      action: 'update',
    },
    {
      code: 'opportunity.delete',
      name: 'Xóa cơ hội',
      module: 'sales',
      resource: 'opportunity',
      action: 'delete',
    },
    // Sales Order permissions
    {
      code: 'sales_order.create',
      name: 'Tạo đơn hàng',
      module: 'sales',
      resource: 'sales_order',
      action: 'create',
    },
    {
      code: 'sales_order.read',
      name: 'Xem đơn hàng',
      module: 'sales',
      resource: 'sales_order',
      action: 'read',
    },
    {
      code: 'sales_order.update',
      name: 'Cập nhật đơn hàng',
      module: 'sales',
      resource: 'sales_order',
      action: 'update',
    },
    {
      code: 'sales_order.delete',
      name: 'Xóa đơn hàng',
      module: 'sales',
      resource: 'sales_order',
      action: 'delete',
    },
    // User permissions
    {
      code: 'user.create',
      name: 'Tạo người dùng',
      module: 'system',
      resource: 'user',
      action: 'create',
    },
    {
      code: 'user.read',
      name: 'Xem người dùng',
      module: 'system',
      resource: 'user',
      action: 'read',
    },
    {
      code: 'user.update',
      name: 'Cập nhật người dùng',
      module: 'system',
      resource: 'user',
      action: 'update',
    },
    {
      code: 'user.delete',
      name: 'Xóa người dùng',
      module: 'system',
      resource: 'user',
      action: 'delete',
    },
    // Role permissions
    {
      code: 'role.create',
      name: 'Tạo vai trò',
      module: 'system',
      resource: 'role',
      action: 'create',
    },
    {
      code: 'role.read',
      name: 'Xem vai trò',
      module: 'system',
      resource: 'role',
      action: 'read',
    },
    {
      code: 'role.update',
      name: 'Cập nhật vai trò',
      module: 'system',
      resource: 'role',
      action: 'update',
    },
    {
      code: 'role.delete',
      name: 'Xóa vai trò',
      module: 'system',
      resource: 'role',
      action: 'delete',
    },
  ];

  const createdPermissions: Permission[] = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }
  console.log(
    `✅ Permissions created: ${createdPermissions.length} permissions`,
  );

  // 6. Create Roles
  console.log('👔 Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { companyId_code: { companyId: company.id, code: 'ADMIN' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'ADMIN',
      name: 'Quản trị viên',
      description: 'Quyền quản trị hệ thống đầy đủ',
      isActive: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MANAGER' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'MANAGER',
      name: 'Quản lý bán hàng',
      description: 'Quản lý đội ngũ bán hàng và xem báo cáo',
      isActive: true,
    },
  });

  const salesRole = await prisma.role.upsert({
    where: { companyId_code: { companyId: company.id, code: 'SALES' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'SALES',
      name: 'Nhân viên bán hàng',
      description: 'Quyền quản lý khách hàng và cơ hội bán hàng',
      isActive: true,
    },
  });
  console.log(
    `✅ Roles created: ${adminRole.name}, ${managerRole.name}, ${salesRole.name}`,
  );

  // 7. Assign Permissions to Roles
  console.log('🔗 Assigning permissions to roles...');
  // Admin gets all permissions
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Manager gets customer and opportunity permissions
  const managerPerms = createdPermissions.filter(
    (p) =>
      p.module === 'customer' ||
      (p.module === 'sales' && p.resource === 'opportunity'),
  );
  for (const perm of managerPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: managerRole.id, permissionId: perm.id },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Sales gets customer and opportunity read/update permissions
  const salesPerms = createdPermissions.filter(
    (p) =>
      (p.module === 'customer' &&
        (p.action === 'read' ||
          p.action === 'update' ||
          p.action === 'create')) ||
      (p.module === 'sales' &&
        p.resource === 'opportunity' &&
        (p.action === 'read' ||
          p.action === 'update' ||
          p.action === 'create')),
  );
  for (const perm of salesPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: salesRole.id, permissionId: perm.id },
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log(`✅ Permissions assigned to roles`);

  // 8. Assign Roles to Users
  console.log('👤 Assigning roles to users...');
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: manager.id, roleId: managerRole.id } },
    update: {},
    create: {
      userId: manager.id,
      roleId: managerRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: sales1.id, roleId: salesRole.id } },
    update: {},
    create: {
      userId: sales1.id,
      roleId: salesRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: sales2.id, roleId: salesRole.id } },
    update: {},
    create: {
      userId: sales2.id,
      roleId: salesRole.id,
    },
  });
  console.log(`✅ Roles assigned to users`);

  // 9. Create Customers
  console.log('👨‍💼 Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      code: 'CUST001',
      name: 'Công ty TNHH Thương mại XYZ',
      type: 'COMPANY',
      taxCode: '9876543210',
      email: 'contact@xyz.com',
      phone: '02876543210',
      mobile: '0912345678',
      address: '789 Đường GHI, Phường JKL, Quận 3, TP.HCM',
      city: 'TP.HCM',
      state: 'Hồ Chí Minh',
      country: 'Việt Nam',
      industry: 'Thương mại',
      employeeCount: 50,
      status: 'ACTIVE',
      source: 'WEBSITE',
      assignedTo: sales1.id,
      isActive: true,
      createdBy: admin.username,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      code: 'CUST002',
      name: 'Nguyễn Văn A',
      type: 'INDIVIDUAL',
      email: 'nguyenvana@email.com',
      mobile: '0923456789',
      address: '321 Đường MNO, Phường PQR, Quận 5, TP.HCM',
      city: 'TP.HCM',
      state: 'Hồ Chí Minh',
      country: 'Việt Nam',
      status: 'ACTIVE',
      source: 'REFERRAL',
      assignedTo: sales2.id,
      isActive: true,
      createdBy: admin.username,
    },
  });
  console.log(`✅ Customers created: ${customer1.name}, ${customer2.name}`);

  // 10. Create Contacts
  console.log('📞 Creating contacts...');
  const contact1 = await prisma.contact.create({
    data: {
      customerId: customer1.id,
      firstName: 'Trần',
      lastName: 'Văn B',
      title: 'Giám đốc',
      email: 'tranvanb@xyz.com',
      phone: '02876543211',
      mobile: '0934567890',
      isPrimary: true,
      department: 'Ban Giám đốc',
      isActive: true,
    },
  });
  console.log(`✅ Contact created: ${contact1.firstName} ${contact1.lastName}`);

  // 11. Create Products
  console.log('📦 Creating products...');
  const product1 = await prisma.product.create({
    data: {
      companyId: company.id,
      code: 'PROD001',
      name: 'Phần mềm CRM Pro',
      description: 'Phần mềm quản lý khách hàng chuyên nghiệp',
      category: 'Software',
      unitPrice: 50000000,
      currency: 'VND',
      isActive: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      companyId: company.id,
      code: 'PROD002',
      name: 'Gói hỗ trợ kỹ thuật 1 năm',
      description: 'Hỗ trợ kỹ thuật và bảo hành trong 1 năm',
      category: 'Service',
      unitPrice: 10000000,
      currency: 'VND',
      isActive: true,
    },
  });
  console.log(`✅ Products created: ${product1.name}, ${product2.name}`);

  // 12. Create Vendors
  console.log('🏭 Creating vendors...');
  const vendor1 = await prisma.vendor.create({
    data: {
      companyId: company.id,
      code: 'VEND001',
      name: 'Công ty Cổ phần Công nghệ DEF',
      taxCode: '1111111111',
      email: 'contact@deftech.com',
      phone: '02811111111',
      address: '999 Đường STU, Phường VWX, Quận 7, TP.HCM',
      isActive: true,
    },
  });
  console.log(`✅ Vendor created: ${vendor1.name}`);

  // 13. Create Warehouses
  console.log('🏪 Creating warehouses...');
  const warehouse1 = await prisma.warehouse.create({
    data: {
      branchId: branchHQ.id,
      code: 'WH001',
      name: 'Kho trung tâm',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      isActive: true,
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      branchId: branchHN.id,
      code: 'WH002',
      name: 'Kho Hà Nội',
      address: '456 Đường DEF, Phường GHI, Quận Cầu Giấy, Hà Nội',
      isActive: true,
    },
  });
  console.log(`✅ Warehouses created: ${warehouse1.name}, ${warehouse2.name}`);

  // 14. Create Accounts (Chart of Accounts)
  console.log('💰 Creating accounts...');
  const accounts = [
    { code: '111', name: 'Tiền mặt', type: 'ASSET' },
    { code: '112', name: 'Tiền gửi ngân hàng', type: 'ASSET' },
    { code: '131', name: 'Phải thu khách hàng', type: 'ASSET' },
    { code: '331', name: 'Phải trả nhà cung cấp', type: 'LIABILITY' },
    { code: '511', name: 'Doanh thu bán hàng', type: 'INCOME' },
    { code: '632', name: 'Giá vốn hàng bán', type: 'EXPENSE' },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { companyId_code: { companyId: company.id, code: acc.code } },
      update: {},
      create: {
        companyId: company.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        isActive: true,
      },
    });
  }
  console.log(`✅ Accounts created: ${accounts.length} accounts`);

  // 15. Create Opportunities
  console.log('🎯 Creating opportunities...');
  const opportunity1 = await prisma.opportunity.create({
    data: {
      companyId: company.id,
      customerId: customer1.id,
      code: 'OPP001',
      name: 'Cơ hội bán phần mềm CRM cho XYZ',
      description: 'Khách hàng quan tâm đến giải pháp CRM Pro',
      stage: 'PROPOSAL',
      probability: 70,
      amount: 50000000,
      currency: 'VND',
      expectedCloseDate: new Date('2024-02-15'),
      source: 'WEBSITE',
      assignedTo: sales1.id,
      status: 'OPEN',
      isActive: true,
      createdBy: sales1.username,
    },
  });
  console.log(`✅ Opportunity created: ${opportunity1.name}`);

  console.log('✨ Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Company: ${company.name}`);
  console.log(`   - Branches: 2`);
  console.log(`   - Users: 4 (admin, manager, sales1, sales2)`);
  console.log(`   - Roles: 3 (ADMIN, MANAGER, SALES)`);
  console.log(`   - Permissions: ${createdPermissions.length}`);
  console.log(`   - Customers: 2`);
  console.log(`   - Products: 2`);
  console.log(`   - Vendors: 1`);
  console.log(`   - Warehouses: 2`);
  console.log(`   - Accounts: ${accounts.length}`);
  console.log(`   - Opportunities: 1`);
  console.log('\n🔑 Default password for all users: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
