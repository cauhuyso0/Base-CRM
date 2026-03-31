export interface DashboardStats {
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
    };
}
export type DashboardPeriod = '7d' | '30d' | '90d' | '12m' | 'all';
