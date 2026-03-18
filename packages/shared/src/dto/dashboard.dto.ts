/**
 * Dashboard DTOs
 */

export interface DashboardStatsRequest {
  // No request params needed, uses companyId from JWT
}

export interface DashboardStatsResponse {
  operations: {
    totalTables: number;
    totalMenuItems: number;
    totalOrders: number;
    newOrders: number;
    preparingOrders: number;
    servedOrders: number;
    paidOrders: number;
  };
  finance: {
    income: number;
    expense: number;
    profit: number;
  };
  tax: {
    output: number;
    input: number;
    payable: number;
  };
}

