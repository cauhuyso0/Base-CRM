import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateIncomeDto,
  CreateExpenseDto,
  CreateMenuItemDto,
  CreateQrOrderDto,
  CreateRestaurantTableDto,
  CreateTaxRuleDto,
  UpdateMenuItemDto,
  UpsertBusinessSettingDto,
} from './dto/restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  private async createIncomeLedger(
    tx: PrismaService,
    companyId: number,
    sourceType: string,
    sourceId: number,
    amountExclTax: number,
    taxAmount: number,
    vatRate: number,
    note?: string,
  ) {
    await tx.cashFlowEntry.create({
      data: {
        companyId,
        direction: 'INCOME',
        sourceModule: 'restaurant',
        sourceType,
        sourceId,
        businessCategory: 'fnb',
        category: 'sales',
        amountExclTax,
        taxAmount,
        amountInclTax: amountExclTax + taxAmount,
        occurredAt: new Date(),
        note,
      },
    });
    await tx.taxLedgerEntry.create({
      data: {
        companyId,
        direction: 'OUTPUT',
        sourceModule: 'restaurant',
        sourceType,
        sourceId,
        businessCategory: 'fnb',
        vatRate,
        taxableAmount: amountExclTax,
        taxAmount,
        occurredAt: new Date(),
        note,
      },
    });
  }

  async listTables(companyId: number) {
    return this.prisma.restaurantTable.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTable(companyId: number, dto: CreateRestaurantTableDto) {
    return this.prisma.restaurantTable.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        area: dto.area,
        seats: dto.seats ?? 4,
      },
    });
  }

  async listMenuItems(companyId: number) {
    return this.prisma.menuItem.findMany({
      where: { companyId, isDeleted: false },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createMenuItem(companyId: number, dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        category: dto.category,
        imageUrl: dto.imageUrl,
        description: dto.description,
        price: dto.price,
        vatRate: dto.vatRate ?? 8,
        isAvailable: dto.isAvailable ?? true,
      },
    });
  }

  async updateMenuItem(companyId: number, id: number, dto: UpdateMenuItemDto) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, companyId, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        category: dto.category,
        imageUrl: dto.imageUrl,
        description: dto.description,
        price: dto.price,
        vatRate: dto.vatRate,
        isAvailable: dto.isAvailable,
      },
    });
  }

  async removeMenuItem(companyId: number, id: number) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, companyId, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  async getQrMenu(qrToken: string) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { qrToken, isActive: true, isDeleted: false },
    });
    if (!table) {
      throw new NotFoundException('QR table not found or inactive');
    }

    const menuItems = await this.listMenuItems(table.companyId);
    return { table, menuItems };
  }

  async createOrderFromQr(qrToken: string, dto: CreateQrOrderDto) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: { qrToken, isActive: true, isDeleted: false },
    });
    if (!table) {
      throw new NotFoundException('QR table not found or inactive');
    }

    const menuItemIds = dto.items.map((item) => item.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        companyId: table.companyId,
        id: { in: menuItemIds },
        isDeleted: false,
        isAvailable: true,
      },
    });

    const menuMap = new Map(menuItems.map((item) => [item.id, item]));
    let subtotal = 0;
    let taxAmount = 0;

    const itemCreates = dto.items.map((item) => {
      const menu = menuMap.get(item.menuItemId);
      if (!menu) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }
      const quantity = Number(item.quantity);
      const unitPrice = Number(menu.price);
      const rate = Number(menu.vatRate);
      const lineSubtotal = unitPrice * quantity;
      const lineTax = (lineSubtotal * rate) / 100;
      const lineTotal = lineSubtotal + lineTax;
      subtotal += lineSubtotal;
      taxAmount += lineTax;
      return {
        menuItemId: menu.id,
        itemName: menu.name,
        quantity,
        unitPrice,
        vatRate: rate,
        taxAmount: lineTax,
        lineTotal,
        note: item.note,
      };
    });

    const totalAmount = subtotal + taxAmount;
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.restaurantOrder.create({
        data: {
          companyId: table.companyId,
          tableId: table.id,
          orderNumber,
          customerName: dto.customerName,
          note: dto.note,
          subtotal,
          taxAmount,
          totalAmount,
          items: {
            create: itemCreates,
          },
        },
        include: {
          items: true,
          table: true,
        },
      });

      await tx.orderNotification.create({
        data: {
          orderId: order.id,
          type: 'NEW_ORDER',
          message: `Ban ${table.name} vua tao don ${order.orderNumber}`,
        },
      });

      await tx.restaurantTable.update({
        where: { id: table.id },
        data: { status: 'OCCUPIED' },
      });

      return order;
    });
  }

  async listOrders(companyId: number, status?: string) {
    return this.prisma.restaurantOrder.findMany({
      where: {
        companyId,
        isDeleted: false,
        ...(status ? { status } : {}),
      },
      include: {
        table: true,
        items: true,
      },
      orderBy: { orderedAt: 'desc' },
    });
  }

  async updateOrderStatus(companyId: number, orderId: number, status: string) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: { id: orderId, companyId, isDeleted: false },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.restaurantOrder.update({
        where: { id: orderId },
        data: {
          status,
          paidAt: status === 'PAID' ? new Date() : order.paidAt,
        },
        include: {
          items: true,
          table: true,
        },
      });

      if (status === 'PAID' && order.status !== 'PAID') {
        const blendedVatRate =
          Number(order.subtotal) > 0
            ? (Number(order.taxAmount) / Number(order.subtotal)) * 100
            : 0;
        await this.createIncomeLedger(
          tx as unknown as PrismaService,
          companyId,
          'order',
          order.id,
          Number(order.subtotal),
          Number(order.taxAmount),
          blendedVatRate,
          `Paid order ${order.orderNumber}`,
        );
      }

      if (status === 'PAID' || status === 'CANCELLED') {
        await tx.restaurantTable.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updated;
    });
  }

  async createExpense(companyId: number, dto: CreateExpenseDto) {
    const vatRate = Number(dto.vatRate ?? 0);
    const amount = Number(dto.amount);
    const taxAmount = (amount * vatRate) / 100;
    const totalAmount = amount + taxAmount;

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          companyId,
          referenceCode: dto.referenceCode,
          type: dto.type,
          description: dto.description,
          amount,
          vatRate,
          taxAmount,
          totalAmount,
          expenseDate: new Date(dto.expenseDate),
          paymentMethod: dto.paymentMethod,
        },
      });

      await tx.cashFlowEntry.create({
        data: {
          companyId,
          direction: 'EXPENSE',
          sourceModule: 'restaurant',
          sourceType: 'expense',
          sourceId: expense.id,
          businessCategory: 'fnb',
          category: dto.type,
          amountExclTax: amount,
          taxAmount,
          amountInclTax: totalAmount,
          paymentMethod: dto.paymentMethod,
          note: dto.description,
          occurredAt: new Date(dto.expenseDate),
        },
      });

      if (taxAmount > 0) {
        await tx.taxLedgerEntry.create({
          data: {
            companyId,
            direction: 'INPUT',
            sourceModule: 'restaurant',
            sourceType: 'expense',
            sourceId: expense.id,
            businessCategory: 'fnb',
            vatRate,
            taxableAmount: amount,
            taxAmount,
            occurredAt: new Date(dto.expenseDate),
            note: dto.description,
          },
        });
      }

      return expense;
    });
  }

  async listExpenses(companyId: number, from?: string, to?: string) {
    return this.prisma.expense.findMany({
      where: {
        companyId,
        isDeleted: false,
        ...(from || to
          ? {
              expenseDate: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async createIncome(companyId: number, dto: CreateIncomeDto) {
    const vatRate = Number(dto.vatRate ?? 0);
    const amount = Number(dto.amount);
    const taxAmount = (amount * vatRate) / 100;
    const amountInclTax = amount + taxAmount;
    const occurredAt = new Date(dto.occurredAt);

    return this.prisma.$transaction(async (tx) => {
      const cashflow = await tx.cashFlowEntry.create({
        data: {
          companyId,
          direction: 'INCOME',
          sourceModule: dto.sourceModule || 'restaurant',
          sourceType: dto.type,
          businessCategory: dto.businessCategory || 'fnb',
          category: dto.type,
          amountExclTax: amount,
          taxAmount,
          amountInclTax,
          paymentMethod: dto.paymentMethod,
          note: dto.description || dto.referenceCode,
          occurredAt,
        },
      });

      if (taxAmount > 0) {
        await tx.taxLedgerEntry.create({
          data: {
            companyId,
            direction: 'OUTPUT',
            sourceModule: dto.sourceModule || 'restaurant',
            sourceType: dto.type,
            sourceId: cashflow.id,
            businessCategory: dto.businessCategory || 'fnb',
            vatRate,
            taxableAmount: amount,
            taxAmount,
            occurredAt,
            note: dto.description || dto.referenceCode,
          },
        });
      }

      return cashflow;
    });
  }

  async listCashFlow(
    companyId: number,
    from?: string,
    to?: string,
    direction?: string,
    sourceModule?: string,
    businessCategory?: string,
  ) {
    return this.prisma.cashFlowEntry.findMany({
      where: {
        companyId,
        isDeleted: false,
        ...(direction ? { direction } : {}),
        ...(sourceModule ? { sourceModule } : {}),
        ...(businessCategory ? { businessCategory } : {}),
        ...(from || to
          ? {
              occurredAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async upsertBusinessSetting(companyId: number, dto: UpsertBusinessSettingDto) {
    return this.prisma.companyBusinessSetting.upsert({
      where: { companyId },
      update: {
        businessCategory: dto.businessCategory,
        displayName: dto.displayName,
        currency: dto.currency,
        taxMethod: dto.taxMethod,
        defaultVatRate: dto.defaultVatRate,
        serviceChargeRate: dto.serviceChargeRate,
      },
      create: {
        companyId,
        businessCategory: dto.businessCategory || 'fnb',
        displayName: dto.displayName,
        currency: dto.currency || 'VND',
        taxMethod: dto.taxMethod || 'DEDUCTION',
        defaultVatRate: dto.defaultVatRate ?? 8,
        serviceChargeRate: dto.serviceChargeRate ?? 0,
      },
    });
  }

  async getBusinessSetting(companyId: number) {
    return this.prisma.companyBusinessSetting.findFirst({
      where: { companyId, isDeleted: false },
    });
  }

  async createTaxRule(companyId: number, dto: CreateTaxRuleDto) {
    if (dto.isDefault) {
      await this.prisma.taxRule.updateMany({
        where: { companyId, isDeleted: false, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.taxRule.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        vatRate: dto.vatRate,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async listTaxRules(companyId: number) {
    return this.prisma.taxRule.findMany({
      where: { companyId, isDeleted: false, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { effectiveFrom: 'desc' }],
    });
  }

  async getDashboard(companyId: number, from?: string, to?: string) {
    const dateFilter = from || to
      ? {
          occurredAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {};

    const [incomeAgg, expenseAgg, taxOutputAgg, taxInputAgg, totalOrders] =
      await Promise.all([
        this.prisma.cashFlowEntry.aggregate({
          where: {
            companyId,
            direction: 'INCOME',
            isDeleted: false,
            ...dateFilter,
          },
          _sum: { amountInclTax: true },
        }),
        this.prisma.cashFlowEntry.aggregate({
          where: {
            companyId,
            direction: 'EXPENSE',
            isDeleted: false,
            ...dateFilter,
          },
          _sum: { amountInclTax: true },
        }),
        this.prisma.taxLedgerEntry.aggregate({
          where: {
            companyId,
            direction: 'OUTPUT',
            isDeleted: false,
            ...dateFilter,
          },
          _sum: { taxAmount: true },
        }),
        this.prisma.taxLedgerEntry.aggregate({
          where: {
            companyId,
            direction: 'INPUT',
            isDeleted: false,
            ...dateFilter,
          },
          _sum: { taxAmount: true },
        }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          isDeleted: false,
          ...(from || to
            ? {
                orderedAt: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
        },
      }),
      ]);

    const revenue = Number(incomeAgg._sum.amountInclTax || 0);
    const expense = Number(expenseAgg._sum.amountInclTax || 0);
    const outputTax = Number(taxOutputAgg._sum.taxAmount || 0);
    const inputTax = Number(taxInputAgg._sum.taxAmount || 0);

    return {
      revenue,
      expense,
      taxOutput: outputTax,
      taxInput: inputTax,
      taxPayable: outputTax - inputTax,
      profit: revenue - expense,
      totalOrders,
    };
  }

  async getTaxSummary(
    companyId: number,
    from?: string,
    to?: string,
    businessCategory?: string,
  ) {
    const where = {
      companyId,
      isDeleted: false,
      ...(businessCategory ? { businessCategory } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [outputByRate, inputByRate] = await Promise.all([
      this.prisma.taxLedgerEntry.groupBy({
        by: ['vatRate'],
        where: { ...where, direction: 'OUTPUT' },
        _sum: { taxableAmount: true, taxAmount: true },
      }),
      this.prisma.taxLedgerEntry.groupBy({
        by: ['vatRate'],
        where: { ...where, direction: 'INPUT' },
        _sum: { taxableAmount: true, taxAmount: true },
      }),
    ]);

    const outputTotal = outputByRate.reduce(
      (sum, row) => sum + Number(row._sum.taxAmount || 0),
      0,
    );
    const inputTotal = inputByRate.reduce(
      (sum, row) => sum + Number(row._sum.taxAmount || 0),
      0,
    );

    return {
      outputByRate,
      inputByRate,
      taxOutput: outputTotal,
      taxInput: inputTotal,
      taxPayable: outputTotal - inputTotal,
    };
  }

  async listNotifications(companyId: number) {
    return this.prisma.orderNotification.findMany({
      where: {
        isRead: false,
        order: { companyId, isDeleted: false },
      },
      include: {
        order: {
          include: {
            table: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(companyId: number, notificationId: number) {
    const notification = await this.prisma.orderNotification.findFirst({
      where: { id: notificationId, order: { companyId } },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.orderNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
