import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats(companyId: number) {
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
    ] = await Promise.all([
      this.prisma.restaurantTable.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.menuItem.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false, status: 'NEW' },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false, status: 'PREPARING' },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false, status: 'SERVED' },
      }),
      this.prisma.restaurantOrder.count({
        where: { companyId, isDeleted: false, status: 'PAID' },
      }),
      this.prisma.cashFlowEntry.aggregate({
        where: { companyId, isDeleted: false },
        _sum: { amountInclTax: true },
      }),
      this.prisma.cashFlowEntry.aggregate({
        where: { companyId, isDeleted: false, direction: 'EXPENSE' },
        _sum: { amountInclTax: true },
      }),
      this.prisma.taxLedgerEntry.aggregate({
        where: { companyId, isDeleted: false, direction: 'OUTPUT' },
        _sum: { taxAmount: true },
      }),
      this.prisma.taxLedgerEntry.aggregate({
        where: { companyId, isDeleted: false, direction: 'INPUT' },
        _sum: { taxAmount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amountInclTax || 0);
    const expense = Number(expenseAgg._sum.amountInclTax || 0);
    const taxOutput = Number(taxOutputAgg._sum.taxAmount || 0);
    const taxInput = Number(taxInputAgg._sum.taxAmount || 0);

    return {
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
    };
  }
}
