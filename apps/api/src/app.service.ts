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
      totalCustomers,
      totalOpportunities,
      totalSalesOrders,
      totalCases,
      totalTickets,
      activeOpportunities,
      wonOpportunities,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.customer.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.opportunity.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.salesOrder.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.case.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.ticket.count({
        where: { isDeleted: false },
      }),
      this.prisma.opportunity.count({
        where: { companyId, status: 'OPEN', isDeleted: false },
      }),
      this.prisma.opportunity.count({
        where: { companyId, status: 'WON', isDeleted: false },
      }),
      this.prisma.salesOrder.aggregate({
        where: { companyId, isDeleted: false },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: await this.prisma.customer.count({
          where: { companyId, status: 'ACTIVE', isDeleted: false },
        }),
      },
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
        won: wonOpportunities,
      },
      salesOrders: {
        total: totalSalesOrders,
        revenue: totalRevenue._sum.totalAmount || 0,
      },
      cases: {
        total: totalCases,
        open: await this.prisma.case.count({
          where: { companyId, status: 'NEW', isDeleted: false },
        }),
      },
      tickets: {
        total: totalTickets,
        open: await this.prisma.ticket.count({
          where: { status: 'OPEN', isDeleted: false },
        }),
      },
    };
  }
}
