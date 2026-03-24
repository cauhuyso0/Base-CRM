import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { RestaurantOrder, restaurantApi } from '../../api/restaurant.api';
import TableManager from '../../components/restaurant/TableManager';

const STATUS_ORDER: RestaurantOrder['status'][] = [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'SERVED',
  'PAID',
  'CANCELLED',
];

function getNextStatus(status: RestaurantOrder['status']): RestaurantOrder['status'] | null {
  if (status === 'PAID' || status === 'CANCELLED') return null;
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 && idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
}

function OrderBoard() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tableRefreshSignal, setTableRefreshSignal] = useState(0);

  const load = async () => {
    try {
      setError('');
      const orderData = await restaurantApi.getOrders({
        status: statusFilter || undefined,
      });
      setOrders(orderData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải order board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void load();
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [statusFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, RestaurantOrder[]> = {};
    for (const status of STATUS_ORDER) {
      map[status] = [];
    }
    for (const order of orders) {
      if (!map[order.status]) map[order.status] = [];
      map[order.status].push(order);
    }
    return map;
  }, [orders]);

  const handleNext = async (order: RestaurantOrder) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    try {
      await restaurantApi.updateOrderStatus(order.id, next);
      setTableRefreshSignal((prev) => prev + 1);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái đơn');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nhận Order</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cập nhật tự động mỗi 1 phút cho nhân viên phục vụ
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {status} ({grouped[status]?.length || 0})
                </h3>
                <div className="space-y-3">
                  {(grouped[status] || []).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Không có đơn</p>
                  ) : (
                    (grouped[status] || []).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-md border border-gray-200 dark:border-gray-800 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bàn {order.table?.name || '-'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          KH: {order.customerName || 'Khách lẻ'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.items.length} món - Tổng: {Number(order.totalAmount).toLocaleString('vi-VN')} VND
                        </p>
                        <div className="rounded-md bg-gray-50 dark:bg-gray-800/50 px-2 py-2">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Món cần chuẩn bị:
                          </p>
                          <ul className="space-y-1">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="text-sm text-gray-700 dark:text-gray-200 flex items-start justify-between gap-2"
                              >
                                <span className="truncate">{item.itemName}</span>
                                <span className="font-semibold whitespace-nowrap">x{Number(item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.orderedAt).toLocaleString('vi-VN')}
                        </div>
                        {getNextStatus(order.status) && (
                          <button
                            type="button"
                            onClick={() => void handleNext(order)}
                            className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            Chuyển {getNextStatus(order.status)}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <TableManager refreshSignal={tableRefreshSignal} />
      </div>
    </Layout>
  );
}

export default OrderBoard;

