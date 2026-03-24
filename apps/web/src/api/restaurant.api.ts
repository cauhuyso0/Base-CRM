import apiClient from './client';

export type BusinessSetting = {
  businessCategory: string;
  displayName?: string | null;
  currency: string;
  taxMethod: 'DEDUCTION' | 'DIRECT';
  defaultVatRate: number | string;
  serviceChargeRate: number | string;
};

export type CashFlowEntry = {
  id: number;
  direction: 'INCOME' | 'EXPENSE';
  sourceModule: string;
  sourceType: string;
  businessCategory?: string | null;
  category: string;
  amountExclTax: number | string;
  taxAmount: number | string;
  amountInclTax: number | string;
  paymentMethod?: string | null;
  occurredAt: string;
  note?: string | null;
};

export type RestaurantOrderItem = {
  id: number;
  itemName: string;
  quantity: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
  note?: string | null;
};

export type RestaurantTable = {
  id: number;
  code: string;
  name: string;
  area?: string | null;
  seats?: number | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | string;
  isActive?: boolean;
  qrToken?: string;
};

export type RestaurantOrder = {
  id: number;
  orderNumber: string;
  status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED';
  customerName?: string | null;
  note?: string | null;
  subtotal: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  orderedAt: string;
  table: {
    id: number;
    name: string;
    code: string;
  };
  items: RestaurantOrderItem[];
};

export type OrderNotification = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  order?: {
    id: number;
    orderNumber: string;
    table?: {
      name?: string;
    };
  };
};

export type QrMenuItem = {
  id: number;
  code: string;
  name: string;
  category?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  price: number | string;
  vatRate: number | string;
  isAvailable?: boolean;
};

export type QrMenuResponse = {
  table: {
    id: number;
    code: string;
    name: string;
    area?: string | null;
  };
  menuItems: QrMenuItem[];
};

export const restaurantApi = {
  getBusinessSetting: async (): Promise<BusinessSetting | null> => {
    const response = await apiClient.get('/restaurant/business-setting');
    return response.data;
  },
  saveBusinessSetting: async (payload: Partial<BusinessSetting>) => {
    const response = await apiClient.post('/restaurant/business-setting', payload);
    return response.data;
  },
  getCashflow: async (params?: {
    from?: string;
    to?: string;
    direction?: string;
    sourceModule?: string;
    businessCategory?: string;
  }): Promise<CashFlowEntry[]> => {
    const response = await apiClient.get('/restaurant/cashflow', { params });
    return response.data;
  },
  getTaxSummary: async (params?: {
    from?: string;
    to?: string;
    businessCategory?: string;
  }) => {
    const response = await apiClient.get('/restaurant/tax-summary', { params });
    return response.data;
  },
  getOrders: async (params?: { status?: string }): Promise<RestaurantOrder[]> => {
    const response = await apiClient.get('/restaurant/orders', { params });
    return response.data;
  },
  getTables: async (): Promise<RestaurantTable[]> => {
    const response = await apiClient.get('/restaurant/tables');
    return response.data;
  },
  createTable: async (payload: {
    code: string;
    name: string;
    area?: string;
    seats?: number;
  }): Promise<RestaurantTable> => {
    const response = await apiClient.post('/restaurant/tables', payload);
    return response.data;
  },
  updateOrderStatus: async (
    id: number,
    status: RestaurantOrder['status'],
  ): Promise<RestaurantOrder> => {
    const response = await apiClient.patch(`/restaurant/orders/${id}/status`, { status });
    return response.data;
  },
  getNotifications: async (): Promise<OrderNotification[]> => {
    const response = await apiClient.get('/restaurant/notifications');
    return response.data;
  },
  markNotificationRead: async (id: number) => {
    const response = await apiClient.patch(`/restaurant/notifications/${id}/read`);
    return response.data;
  },
  getQrMenu: async (token: string): Promise<QrMenuResponse> => {
    const response = await apiClient.get(`/restaurant/qr/${token}/menu`);
    return response.data;
  },
  createQrOrder: async (
    token: string,
    payload: {
      customerName?: string;
      note?: string;
      items: Array<{ menuItemId: number; quantity: number; note?: string }>;
    },
  ) => {
    const response = await apiClient.post(`/restaurant/qr/${token}/orders`, payload);
    return response.data;
  },
  getMenuItems: async (): Promise<QrMenuItem[]> => {
    const response = await apiClient.get('/restaurant/menu-items');
    return response.data;
  },
  createMenuItem: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post('/restaurant/menu-items', payload);
    return response.data;
  },
  updateMenuItem: async (id: number, payload: Record<string, unknown>) => {
    const response = await apiClient.patch(`/restaurant/menu-items/${id}`, payload);
    return response.data;
  },
  deleteMenuItem: async (id: number) => {
    await apiClient.delete(`/restaurant/menu-items/${id}`);
  },
};

