import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  private resolvePeriodStart(period: '7d' | '30d' | '90d' | '12m' | 'all') {
    if (period === 'all') {
      return null;
    }

    const now = new Date();
    const start = new Date(now);
    if (period === '12m') {
      start.setMonth(now.getMonth() - 12);
      return start;
    }

    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    start.setDate(now.getDate() - daysMap[period]);
    return start;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats(
    companyId: number,
    period: '7d' | '30d' | '90d' | '12m' | 'all' = '30d',
  ) {
    const safePeriod = ['7d', '30d', '90d', '12m', 'all'].includes(period)
      ? period
      : '30d';
    const startDate = this.resolvePeriodStart(safePeriod);
    const dateFilter = startDate ? { gte: startDate } : undefined;

    const [
      totalTables,
      totalMenuItems,
      totalOrders,
      newOrders,
      preparingOrders,
      servedOrders,
      paidOrders,
      incomeAgg,
      expenseAgg,
      taxOutputAgg,
      taxInputAgg,
      revenueEntries,
    ] = await Promise.all([
      this.prisma.restaurantTable.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.menuItem.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false, createdAt: dateFilter },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          isDeleted: false,
          status: 'NEW',
          createdAt: dateFilter,
        },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          isDeleted: false,
          status: 'PREPARING',
          createdAt: dateFilter,
        },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          isDeleted: false,
          status: 'SERVED',
          createdAt: dateFilter,
        },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          companyId,
          isDeleted: false,
          status: 'PAID',
          createdAt: dateFilter,
        },
      }),
      this.prisma.cashFlowEntry.aggregate({
        where: { companyId, isDeleted: false, createdAt: dateFilter },
        _sum: { amountInclTax: true },
      }),
      this.prisma.cashFlowEntry.aggregate({
        where: {
          companyId,
          isDeleted: false,
          direction: 'EXPENSE',
          createdAt: dateFilter,
        },
        _sum: { amountInclTax: true },
      }),
      this.prisma.taxLedgerEntry.aggregate({
        where: {
          companyId,
          isDeleted: false,
          direction: 'OUTPUT',
          createdAt: dateFilter,
        },
        _sum: { taxAmount: true },
      }),
      this.prisma.taxLedgerEntry.aggregate({
        where: {
          companyId,
          isDeleted: false,
          direction: 'INPUT',
          createdAt: dateFilter,
        },
        _sum: { taxAmount: true },
      }),
      this.prisma.cashFlowEntry.findMany({
        where: {
          companyId,
          isDeleted: false,
          direction: 'INCOME',
          createdAt: dateFilter,
        },
        select: { amountInclTax: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const income = Number(incomeAgg._sum.amountInclTax || 0);
    const expense = Number(expenseAgg._sum.amountInclTax || 0);
    const taxOutput = Number(taxOutputAgg._sum.taxAmount || 0);
    const taxInput = Number(taxInputAgg._sum.taxAmount || 0);

    const revenueMap: Record<string, number> = {};
    revenueEntries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const key =
        safePeriod === '12m'
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : `${date.getDate()}/${date.getMonth() + 1}`;
      revenueMap[key] =
        (revenueMap[key] || 0) + Number(entry.amountInclTax || 0);
    });
    const revenueSeries = Object.entries(revenueMap).map(([label, value]) => ({
      label,
      value,
    }));

    return {
      period: safePeriod,
      operations: {
        totalTables,
        totalMenuItems,
        totalOrders,
        newOrders,
        preparingOrders,
        servedOrders,
        paidOrders,
      },
      finance: {
        income,
        expense,
        profit: income - expense,
      },
      tax: {
        output: taxOutput,
        input: taxInput,
        payable: taxOutput - taxInput,
      },
      revenueSeries,
    };
  }
}
