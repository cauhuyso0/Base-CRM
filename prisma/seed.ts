import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const N = 10;

const code = (prefix: string, i: number) =>
  `${prefix}${String(i + 1).padStart(3, '0')}`;
const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

async function clearData() {
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.email.deleteMany();
  await prisma.document.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.case.deleteMany();
  await prisma.campaignTarget.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.opportunityProduct.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.account.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.company.deleteMany();
}

async function main() {
  console.log('🌱 Starting full seed (~10 records/table)...');
  await clearData();

  const hashedPassword = await bcrypt.hash('123456', 10);

  const companies: any[] = [];
  for (let i = 0; i < N; i++) {
    companies.push(
      await prisma.company.create({
        data: {
          code: code('COMP', i),
          name: `Company ${i + 1}`,
          taxCode: `TAX${100000 + i}`,
          address: `Address ${i + 1}`,
          phone: `09000000${String(i).padStart(2, '0')}`,
          email: `company${i + 1}@example.com`,
          website: `https://company${i + 1}.example.com`,
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  const branches: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    branches.push(
      await prisma.branch.create({
        data: {
          companyId: company.id,
          code: code('BR', i),
          name: `Branch ${i + 1}`,
          address: `Branch address ${i + 1}`,
          phone: `09100000${String(i).padStart(2, '0')}`,
          email: `branch${i + 1}@example.com`,
        },
      }),
    );
  }

  const menuTemplates = [
    {
      code: 'MON001',
      name: 'Cà phê sữa đá',
      category: 'Đồ uống',
      description: 'Cà phê rang xay pha phin cùng sữa đặc',
      price: 32000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MON002',
      name: 'Trà đào cam sả',
      category: 'Trà',
      description: 'Trà thơm mát với đào và cam lát',
      price: 45000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MON003',
      name: 'Bánh mì bò kho',
      category: 'Đồ ăn',
      description: 'Bò kho đậm vị ăn kèm bánh mì nóng giòn',
      price: 59000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MON004',
      name: 'Phở bò tái',
      category: 'Đồ ăn',
      description: 'Nước dùng ninh xương thơm, bánh phở mềm',
      price: 68000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MON005',
      name: 'Bạc xỉu',
      category: 'Đồ uống',
      description: 'Sữa nhiều cà phê, vị béo nhẹ',
      price: 39000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MON006',
      name: 'Khoai tây chiên',
      category: 'Ăn vặt',
      description: 'Khoai tây chiên vàng giòn dùng kèm sốt',
      price: 35000,
      vatRate: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    await prisma.restaurantTable.create({
      data: {
        companyId: company.id,
        code: code('TB', i),
        name: `Bàn ${i + 1}`,
        area: i % 2 === 0 ? 'Tầng trệt' : 'Tầng lầu',
        seats: 4 + (i % 3),
      },
    });

    for (const template of menuTemplates) {
      await prisma.menuItem.create({
        data: {
          companyId: company.id,
          code: `${template.code}_${i + 1}`,
          name: template.name,
          category: template.category,
          imageUrl: template.imageUrl,
          description: template.description,
          price: template.price,
          vatRate: template.vatRate,
          isAvailable: true,
        },
      });
    }
  }

  const managerUsers: any[] = [];
  const employeeUsers: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const branch = pick(branches, i);

    managerUsers.push(
      await prisma.user.create({
        data: {
          companyId: company.id,
          branchId: branch.id,
          username: `manager${i + 1}`,
          email: `manager${i + 1}@example.com`,
          password: hashedPassword,
          firstName: `Manager${i + 1}`,
          lastName: 'User',
          phone: `09210000${String(i).padStart(2, '0')}`,
        },
      }),
    );

    employeeUsers.push(
      await prisma.user.create({
        data: {
          companyId: company.id,
          branchId: branch.id,
          username: `employee${i + 1}`,
          email: `employee${i + 1}@example.com`,
          password: hashedPassword,
          firstName: `Employee${i + 1}`,
          lastName: 'User',
          phone: `09220000${String(i).padStart(2, '0')}`,
        },
      }),
    );
  }

  const superAdminUser = await prisma.user.create({
    data: {
      companyId: companies[0].id,
      branchId: branches[0].id,
      username: 'admin',
      email: 'admin@basecrm.local',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '0909999999',
    },
  });

  const managerRoles: any[] = [];
  const employeeRoles: any[] = [];
  const superAdminRoles: any[] = [];

  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    managerRoles.push(
      await prisma.role.create({
        data: {
          companyId: company.id,
          code: 'MANAGER',
          name: 'Manager',
          description: 'Full access within own company',
        },
      }),
    );
    employeeRoles.push(
      await prisma.role.create({
        data: {
          companyId: company.id,
          code: 'EMPLOYEE',
          name: 'Employee',
          description: 'Read-only access within own company',
        },
      }),
    );
    superAdminRoles.push(
      await prisma.role.create({
        data: {
          companyId: company.id,
          code: 'SUPER_ADMIN',
          name: 'Super Admin',
          description: 'Full access across all companies',
        },
      }),
    );
  }

  const resourceModules: Record<string, string> = {
    companies: 'company',
    branches: 'branch',
    customers: 'customer',
    contacts: 'customer',
    opportunities: 'sales',
    sales_orders: 'sales',
    campaigns: 'marketing',
    leads: 'marketing',
    cases: 'service',
    tickets: 'service',
    products: 'erp',
    vendors: 'erp',
    warehouses: 'erp',
    accounts: 'erp',
    users: 'system',
    roles: 'system',
    permissions: 'system',
  };

  const actions = ['create', 'read', 'update', 'delete'];
  const permissions: any[] = [];
  const readPermissions: any[] = [];
  for (const [resource, module] of Object.entries(resourceModules)) {
    for (const action of actions) {
      const permission = await prisma.permission.create({
        data: {
          code: `${resource}.${action}`,
          name: `${action.toUpperCase()} ${resource}`,
          module,
          resource,
          action,
          description: `${action} permission for ${resource}`,
        },
      });
      permissions.push(permission);
      if (action === 'read') {
        readPermissions.push(permission);
      }
    }
  }

  for (let i = 0; i < N; i++) {
    const managerRole = managerRoles[i];
    const employeeRole = employeeRoles[i];
    const superRole = superAdminRoles[i];

    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
      await prisma.rolePermission.create({
        data: {
          roleId: superRole.id,
          permissionId: permission.id,
        },
      });
    }

    for (const permission of readPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      });
    }

    await prisma.userRole.create({
      data: {
        userId: managerUsers[i].id,
        roleId: managerRole.id,
      },
    });
    await prisma.userRole.create({
      data: {
        userId: employeeUsers[i].id,
        roleId: employeeRole.id,
      },
    });
    await prisma.userRole.create({
      data: {
        userId: superAdminUser.id,
        roleId: superRole.id,
      },
    });
  }

  const users: any[] = [...managerUsers, ...employeeUsers, superAdminUser];

  const customers: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const user = pick(users, i);
    customers.push(
      await prisma.customer.create({
        data: {
          companyId: company.id,
          code: code('CUST', i),
          name: `Customer ${i + 1}`,
          type: i % 2 === 0 ? 'COMPANY' : 'INDIVIDUAL',
          email: `customer${i + 1}@example.com`,
          phone: `09300000${String(i).padStart(2, '0')}`,
          city: 'Ho Chi Minh',
          country: 'Vietnam',
          status: 'ACTIVE',
          assignedTo: user.id,
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  const contacts: any[] = [];
  for (let i = 0; i < N; i++) {
    const customer = pick(customers, i);
    contacts.push(
      await prisma.contact.create({
        data: {
          customerId: customer.id,
          firstName: `ContactFirst${i + 1}`,
          lastName: `ContactLast${i + 1}`,
          email: `contact${i + 1}@example.com`,
          phone: `09400000${String(i).padStart(2, '0')}`,
          isPrimary: i % 3 === 0,
        },
      }),
    );
  }

  const products: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    products.push(
      await prisma.product.create({
        data: {
          companyId: company.id,
          code: code('PROD', i),
          name: `Product ${i + 1}`,
          category: i % 2 === 0 ? 'Software' : 'Service',
          unitPrice: 1000000 + i * 100000,
        },
      }),
    );
  }

  const vendors: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    vendors.push(
      await prisma.vendor.create({
        data: {
          companyId: company.id,
          code: code('VEND', i),
          name: `Vendor ${i + 1}`,
          email: `vendor${i + 1}@example.com`,
          phone: `09500000${String(i).padStart(2, '0')}`,
        },
      }),
    );
  }

  const warehouses: any[] = [];
  for (let i = 0; i < N; i++) {
    const branch = pick(branches, i);
    warehouses.push(
      await prisma.warehouse.create({
        data: {
          branchId: branch.id,
          code: code('WH', i),
          name: `Warehouse ${i + 1}`,
          address: `Warehouse address ${i + 1}`,
        },
      }),
    );
  }

  const accountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  const accounts: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    accounts.push(
      await prisma.account.create({
        data: {
          companyId: company.id,
          code: `${100 + i}`,
          name: `Account ${i + 1}`,
          type: pick(accountTypes, i),
        },
      }),
    );
  }

  const opportunities: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const customer = pick(customers, i);
    const user = pick(users, i);
    opportunities.push(
      await prisma.opportunity.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          code: code('OPP', i),
          name: `Opportunity ${i + 1}`,
          stage: pick(['PROSPECTING', 'PROPOSAL', 'NEGOTIATION'], i),
          probability: (i * 10) % 100,
          amount: 5000000 + i * 1000000,
          assignedTo: user.id,
          status: 'OPEN',
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  for (let i = 0; i < N; i++) {
    const product = pick(products, i);
    const quantity = i + 1;
    const unitPrice = Number(product.unitPrice);
    await prisma.opportunityProduct.create({
      data: {
        opportunityId: pick(opportunities, i).id,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
      },
    });
  }

  const salesOrders: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const customer = pick(customers, i);
    const opportunity = pick(opportunities, i);
    salesOrders.push(
      await prisma.salesOrder.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          opportunityId: opportunity.id,
          code: code('SO', i),
          orderDate: new Date(),
          subtotal: 1000000 + i * 100000,
          taxAmount: 100000,
          totalAmount: 1100000 + i * 100000,
          status: pick(['DRAFT', 'CONFIRMED', 'SHIPPED'], i),
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  for (let i = 0; i < N; i++) {
    const product = pick(products, i);
    const quantity = 1 + (i % 3);
    const unitPrice = Number(product.unitPrice);
    await prisma.salesOrderItem.create({
      data: {
        salesOrderId: pick(salesOrders, i).id,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
      },
    });
  }

  const campaigns: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    campaigns.push(
      await prisma.campaign.create({
        data: {
          companyId: company.id,
          code: code('CAMP', i),
          name: `Campaign ${i + 1}`,
          type: pick(['EMAIL', 'SOCIAL', 'EVENT'], i),
          budget: 10000000 + i * 500000,
          status: pick(['PLANNED', 'ACTIVE', 'COMPLETED'], i),
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  const leads: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const campaign = pick(campaigns, i);
    leads.push(
      await prisma.lead.create({
        data: {
          companyId: company.id,
          campaignId: campaign.id,
          code: code('LEAD', i),
          firstName: `LeadFirst${i + 1}`,
          lastName: `LeadLast${i + 1}`,
          email: `lead${i + 1}@example.com`,
          phone: `09600000${String(i).padStart(2, '0')}`,
          status: pick(['NEW', 'CONTACTED', 'QUALIFIED'], i),
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  for (let i = 0; i < N; i++) {
    const campaign = pick(campaigns, i);
    const customer = pick(customers, i);
    await prisma.campaignTarget.create({
      data: {
        campaignId: campaign.id,
        targetType: 'CUSTOMER',
        targetId: customer.uuid,
        status: pick(['PENDING', 'CONTACTED', 'RESPONDED'], i),
      },
    });
  }

  const cases: any[] = [];
  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const customer = pick(customers, i);
    const user = pick(users, i);
    cases.push(
      await prisma.case.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          code: code('CASE', i),
          subject: `Case ${i + 1}`,
          description: `Case description ${i + 1}`,
          priority: pick(['LOW', 'MEDIUM', 'HIGH'], i),
          status: pick(['NEW', 'IN_PROGRESS', 'RESOLVED'], i),
          assignedTo: user.id,
          createdBy: 'seed',
          updatedBy: 'seed',
        },
      }),
    );
  }

  const tickets: any[] = [];
  for (let i = 0; i < N; i++) {
    const caseItem = pick(cases, i);
    const user = pick(users, i);
    tickets.push(
      await prisma.ticket.create({
        data: {
          caseId: caseItem.id,
          code: code('TICKET', i),
          subject: `Ticket ${i + 1}`,
          description: `Ticket description ${i + 1}`,
          priority: pick(['LOW', 'MEDIUM', 'HIGH'], i),
          status: pick(['OPEN', 'IN_PROGRESS', 'RESOLVED'], i),
          assignedTo: user.id,
          createdBy: user.id,
        },
      }),
    );
  }

  for (let i = 0; i < N; i++) {
    const company = pick(companies, i);
    const user = pick(users, i);
    const customer = pick(customers, i);
    const opportunity = pick(opportunities, i);
    const salesOrder = pick(salesOrders, i);
    const campaign = pick(campaigns, i);
    const lead = pick(leads, i);
    const caseItem = pick(cases, i);
    const ticket = pick(tickets, i);

    await prisma.document.create({
      data: {
        companyId: company.id,
        userId: user.id,
        entityType: 'CUSTOMER',
        entityId: customer.uuid,
        name: `Document ${i + 1}`,
        fileName: `document_${i + 1}.pdf`,
        filePath: `/uploads/document_${i + 1}.pdf`,
        fileSize: 1024 + i * 10,
        mimeType: 'application/pdf',
        customerId: customer.id,
        opportunityId: opportunity.id,
        salesOrderId: salesOrder.id,
        campaignId: campaign.id,
        leadId: lead.id,
        caseId: caseItem.id,
        ticketId: ticket.id,
      },
    });

    await prisma.email.create({
      data: {
        companyId: company.id,
        fromEmail: `noreply${i + 1}@example.com`,
        toEmail: `receiver${i + 1}@example.com`,
        subject: `Seed email ${i + 1}`,
        body: `Seed email body ${i + 1}`,
        entityType: 'CUSTOMER',
        entityId: customer.uuid,
      },
    });

    await prisma.activity.create({
      data: {
        companyId: company.id,
        userId: user.id,
        entityType: 'CUSTOMER',
        entityId: customer.uuid,
        type: pick(['CALL', 'EMAIL', 'MEETING'], i),
        subject: `Activity ${i + 1}`,
        description: `Activity description ${i + 1}`,
        status: pick(['PLANNED', 'COMPLETED'], i),
        customerId: customer.id,
        contactId: pick(contacts, i).id,
        opportunityId: opportunity.id,
        salesOrderId: salesOrder.id,
        campaignId: campaign.id,
        leadId: lead.id,
        caseId: caseItem.id,
        ticketId: ticket.id,
      },
    });

    await prisma.task.create({
      data: {
        userId: user.id,
        entityType: 'LEAD',
        entityId: lead.uuid,
        title: `Task ${i + 1}`,
        description: `Task description ${i + 1}`,
        status: pick(['PENDING', 'IN_PROGRESS', 'COMPLETED'], i),
        priority: pick(['LOW', 'MEDIUM', 'HIGH'], i),
        contactId: pick(contacts, i).id,
        opportunityId: opportunity.id,
        leadId: lead.id,
      },
    });

    await prisma.note.create({
      data: {
        userId: user.id,
        entityType: 'CUSTOMER',
        entityId: customer.uuid,
        title: `Note ${i + 1}`,
        content: `Seed note content ${i + 1}`,
        customerId: customer.id,
        opportunityId: opportunity.id,
        leadId: lead.id,
        caseId: caseItem.id,
        ticketId: ticket.id,
      },
    });
  }

  console.log('✅ Seed completed.');
  console.log('Summary (~10/table):');
  console.log(`- companies: ${companies.length}`);
  console.log(`- branches: ${branches.length}`);
  console.log(`- restaurantTables: ${N}`);
  console.log(`- menuItems: ${N * menuTemplates.length}`);
  console.log(`- users: ${users.length}`);
  console.log(
    `- roles: ${managerRoles.length + employeeRoles.length + superAdminRoles.length}`,
  );
  console.log(`- permissions: ${permissions.length}`);
  console.log(`- customers: ${customers.length}`);
  console.log(`- contacts: ${contacts.length}`);
  console.log(`- products: ${products.length}`);
  console.log(`- vendors: ${vendors.length}`);
  console.log(`- warehouses: ${warehouses.length}`);
  console.log(`- accounts: ${accounts.length}`);
  console.log(`- opportunities: ${opportunities.length}`);
  console.log(`- salesOrders: ${salesOrders.length}`);
  console.log(`- campaigns: ${campaigns.length}`);
  console.log(`- leads: ${leads.length}`);
  console.log(`- cases: ${cases.length}`);
  console.log(`- tickets: ${tickets.length}`);
  console.log('Default user password: 123456');
  console.log('Super admin login: admin / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
