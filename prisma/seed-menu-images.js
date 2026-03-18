const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({
    where: { isDeleted: false },
    orderBy: { id: 'asc' },
  });

  if (!company) {
    console.log('No company found, skip menu seed.');
    return;
  }

  const existingTable = await prisma.restaurantTable.findFirst({
    where: { companyId: company.id, isDeleted: false },
  });

  if (!existingTable) {
    await prisma.restaurantTable.create({
      data: {
        companyId: company.id,
        code: 'TB-EX01',
        name: 'Bàn sample',
        area: 'Khu A',
        seats: 4,
      },
    });
  }

  const drinkTemplates = [
    {
      name: 'Cà phê sữa đá',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
      price: 32000,
    },
    {
      name: 'Trà đào cam sả',
      category: 'Trà',
      imageUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      price: 45000,
    },
    {
      name: 'Sinh tố xoài',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1553530666-ba11a90bb918?auto=format&fit=crop&w=800&q=80',
      price: 48000,
    },
    {
      name: 'Nước cam ép',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      price: 42000,
    },
    {
      name: 'Trà sữa trân châu',
      category: 'Trà',
      imageUrl:
        'https://images.unsplash.com/photo-1558857563-c0c61f7a7023?auto=format&fit=crop&w=800&q=80',
      price: 55000,
    },
    {
      name: 'Matcha đá xay',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80',
      price: 60000,
    },
    {
      name: 'Americano',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80',
      price: 39000,
    },
    {
      name: 'Latte nóng',
      category: 'Đồ uống',
      imageUrl:
        'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
      price: 52000,
    },
  ];

  const examples = Array.from({ length: 20 }, (_, index) => {
    const template = drinkTemplates[index % drinkTemplates.length];
    return {
      code: `EXM${String(index + 1).padStart(3, '0')}`,
      name: `${template.name} #${index + 1}`,
      category: template.category,
      description: 'Món nước sample có hình ảnh',
      imageUrl: template.imageUrl,
      price: template.price + (index % 4) * 3000,
      vatRate: 8,
    };
  });

  for (const item of examples) {
    await prisma.menuItem.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: item.code,
        },
      },
      create: {
        companyId: company.id,
        ...item,
        isAvailable: true,
      },
      update: {
        name: item.name,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl,
        price: item.price,
        vatRate: item.vatRate,
        isAvailable: true,
      },
    });
  }

  console.log(`Seeded ${examples.length} menu items with images for companyId=${company.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
