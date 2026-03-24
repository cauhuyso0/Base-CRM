import { useEffect, useMemo, useState } from 'react';
import { RestaurantOrder, RestaurantTable, restaurantApi } from '../../api/restaurant.api';

interface TableManagerProps {
  refreshSignal?: number;
}

/** Base URL cho link/QR gọi món: không dùng localhost trên điện thoại. */
function resolveWebOriginForQr(): string {
  if (typeof window !== 'undefined') {
    const current = window.location.origin;
    try {
      const hostname = new URL(current).hostname;
      // Nếu đang chạy bằng host thật (LAN/tunnel/domain) thì dùng luôn theo host hiện tại.
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return current;
      }
    } catch {
      // ignore parse errors and continue fallback
    }
  }

  const explicit = (import.meta.env.VITE_PUBLIC_WEB_ORIGIN as string | undefined)?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    try {
      const base = apiBase.replace(/\/$/, '').replace(/\/api\/?$/, '');
      const url = new URL(base);
      if (url.port === '3001') {
        url.port = '3000';
      }
      return url.origin;
    } catch {
      /* ignore */
    }
  }

  return typeof window !== 'undefined' ? window.location.origin : '';
}

function TableManager({ refreshSignal = 0 }: TableManagerProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [selectedTableOrders, setSelectedTableOrders] = useState<RestaurantOrder[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    area: '',
    seats: 4,
  });

  const loadTables = async () => {
    try {
      setError('');
      const data = await restaurantApi.getTables();
      setTables(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void loadTables();
  }, [refreshSignal]);

  const stats = useMemo(() => {
    const total = tables.length;
    const occupied = tables.filter((table) => table.status === 'OCCUPIED').length;
    const available = tables.filter((table) => table.status === 'AVAILABLE').length;
    return { total, occupied, available };
  }, [tables]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await restaurantApi.createTable({
        code: form.code.trim(),
        name: form.name.trim(),
        area: form.area.trim() || undefined,
        seats: Number(form.seats || 0) || 4,
      });
      setForm({ code: '', name: '', area: '', seats: 4 });
      setShowCreate(false);
      await loadTables();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tạo bàn');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openTableDetail = async (table: RestaurantTable) => {
    setSelectedTable(table);
    setDetailLoading(true);
    try {
      setError('');
      const orders = await restaurantApi.getOrders();
      const tableOrders = (Array.isArray(orders) ? orders : []).filter(
        (order) => order.table?.id === table.id,
      );
      setSelectedTableOrders(tableOrders);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết bàn');
      setSelectedTableOrders([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeTableDetail = () => {
    setSelectedTable(null);
    setSelectedTableOrders([]);
  };

  const activeOrders = useMemo(
    () =>
      selectedTableOrders.filter(
        (order) => order.status !== 'PAID' && order.status !== 'CANCELLED',
      ),
    [selectedTableOrders],
  );

  const webOriginForQr = resolveWebOriginForQr();

  const orderLink =
    selectedTable?.qrToken && webOriginForQr
      ? `${webOriginForQr}/order/${selectedTable.qrToken}`
      : '';
  const qrImageUrl = orderLink
    ? `https://quickchart.io/qr?size=260&text=${encodeURIComponent(orderLink)}`
    : '';

  const copyOrderLink = async () => {
    if (!orderLink) return;
    try {
      await navigator.clipboard.writeText(orderLink);
    } catch {
      setError('Không thể copy link QR trên trình duyệt này');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quản lý bàn</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tổng: {stats.total} - Trống: {stats.available} - Đang phục vụ: {stats.occupied}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadTables()}
            className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Tải lại bàn
          </button>
          <button
            type="button"
            onClick={() => setShowCreate((prev) => !prev)}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {showCreate ? 'Đóng form' : 'Thêm bàn'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            required
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            placeholder="Mã bàn (VD: B01)"
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <input
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Tên bàn"
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <input
            value={form.area}
            onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
            placeholder="Khu vực"
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={form.seats}
              onChange={(e) => setForm((prev) => ({ ...prev, seats: Number(e.target.value) }))}
              className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {submitLoading ? 'Đang lưu' : 'Lưu'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-gray-600 dark:text-gray-300">Đang tải bàn...</div>
      ) : tables.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Chưa có bàn nào</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {tables.map((table) => {
            const isOccupied = table.status === 'OCCUPIED';
            return (
              <button
                type="button"
                key={table.id}
                onClick={() => void openTableDetail(table)}
                className={`rounded-md border p-3 ${
                  isOccupied
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                    : 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                } text-left hover:shadow`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">{table.code}</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{table.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {table.area || '-'} - {table.seats || 0} chỗ
                </div>
                <div className="mt-1 text-xs font-medium">
                  {isOccupied ? 'Đang phục vụ' : table.status || 'AVAILABLE'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-lg bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 px-5 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chi tiết bàn {selectedTable.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTable.code} - {selectedTable.area || '-'} - {selectedTable.seats || 0} chỗ
                </p>
              </div>
              <button
                type="button"
                onClick={closeTableDetail}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Đóng
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Order đang mở</h4>
                {detailLoading ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Đang tải order...</p>
                ) : activeOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có order đang mở</p>
                ) : (
                  <div className="space-y-2">
                    {activeOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-md border border-gray-200 dark:border-gray-800 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.orderNumber}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {order.items.length} món - {Number(order.totalAmount).toLocaleString('vi-VN')} VND
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.orderedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">QR gọi món</h4>
                {selectedTable.qrToken ? (
                  <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                    <div className="flex justify-center">
                      <img src={qrImageUrl} alt={`QR ${selectedTable.name}`} className="w-56 h-56" />
                    </div>
                    <p className="text-xs break-all text-gray-500 dark:text-gray-400">{orderLink}</p>
                    <button
                      type="button"
                      onClick={() => void copyOrderLink()}
                      className="w-full px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Copy link QR
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bàn này chưa có `qrToken`, chưa thể tạo QR.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableManager;
