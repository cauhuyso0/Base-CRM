/**
 * Dashboard DTOs
 */

export interface DashboardStatsRequest {
  // No request params needed, uses companyId from JWT
}

export interface DashboardStatsResponse {
  customers: {
    total: number;
    active: number;
  };
  opportunities: {
    total: number;
    active: number;
    won: number;
  };
  salesOrders: {
    total: number;
    revenue: number;
  };
  cases: {
    total: number;
    open: number;
  };
  tickets: {
    total: number;
    open: number;
  };
}

