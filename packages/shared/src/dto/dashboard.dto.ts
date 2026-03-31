/**
 * Dashboard DTOs
 */
import { DashboardPeriod } from '../types/dashboard.types';

export interface DashboardStatsRequest {
  period?: DashboardPeriod;
}

export interface DashboardStatsResponse {
  period: DashboardPeriod;
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
  revenueSeries: {
    label: string;
    value: number;
  }[];
}
