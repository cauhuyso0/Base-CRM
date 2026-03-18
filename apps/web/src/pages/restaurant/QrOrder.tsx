import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QrMenuItem, restaurantApi } from '../../api/restaurant.api';

function QrOrder() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tableName, setTableName] = useState('');
  const [menuItems, setMenuItems] = useState<QrMenuItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      if (!token) {
        setError('Thiếu QR token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await restaurantApi.getQrMenu(token);
        setTableName(data.table?.name || data.table?.code || 'N/A');
        setMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không thể tải menu');
      } finally {
        setLoading(false);
      }
    };

    void loadMenu();
  }, [token]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['all', ...Array.from(set)];
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !keyword ||
        String(item.name || '')
          .toLowerCase()
          .includes(keyword) ||
        String(item.description || '')
          .toLowerCase()
          .includes(keyword);
      return matchCategory && matchSearch;
    });
  }, [menuItems, activeCategory, search]);

  const selectedItems = useMemo(
    () =>
      menuItems.filter((item) => (quantities[item.id] || 0) > 0).map((item) => ({
        item,
        qty: quantities[item.id],
      })),
    [menuItems, quantities],
  );

  const selectedCount = useMemo(
    () => selectedItems.reduce((sum, row) => sum + row.qty, 0),
    [selectedItems],
  );

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const row of selectedItems) {
      const price = Number(row.item.price || 0);
      const rate = Number(row.item.vatRate || 0);
      const lineSubtotal = price * row.qty;
      subtotal += lineSubtotal;
      tax += (lineSubtotal * rate) / 100;
    }
    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  }, [selectedItems]);

  const updateQty = (menuItemId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [menuItemId]: value < 0 ? 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất 1 món');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const payload = {
        customerName: customerName.trim() || undefined,
        note: note.trim() || undefined,
        items: selectedItems.map((row) => ({
          menuItemId: row.item.id,
          quantity: row.qty,
        })),
      };
      const order = await restaurantApi.createQrOrder(token, payload);
      setLastOrderNumber(order.orderNumber || '');
      setSuccess(`Đặt món thành công. Mã đơn: ${order.orderNumber}`);
      setQuantities({});
      setNote('');
      setShowCart(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể đặt món');
    } finally {
      setSubmitting(false);
    }
  };

  const getItemEmoji = (category?: string | null) => {
    const value = (category || '').toLowerCase();
    if (value.includes('uống') || value.includes('drink')) return '🥤';
    if (value.includes('coffee') || value.includes('cafe')) return '☕';
    if (value.includes('tea') || value.includes('trà')) return '🍵';
    if (value.includes('đồ ăn') || value.includes('food') || value.includes('món')) return '🍜';
    return '🍽️';
  };

  const getItemBadge = (index: number) => {
    if (index % 5 === 0) {
      return { label: 'Best seller', className: 'bg-rose-500 text-white' };
    }
    if (index % 4 === 0) {
      return { label: 'Mới', className: 'bg-emerald-500 text-white' };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full px-4 md:px-8 xl:px-12 py-6 space-y-6 pb-28">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-5 shadow-lg">
          <h1 className="text-2xl font-bold">Menu gọi món</h1>
          <p className="text-sm text-blue-100 mt-1">Bàn: {tableName || '-'}</p>
          <p className="text-xs text-blue-100 mt-1">
            Chọn món xong bấm "Đặt món" để gửi ngay cho nhân viên
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}
        {success && !lastOrderNumber && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải menu...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="Tìm món..."
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category === 'all' ? 'Tất cả' : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Danh sách món</h2>
              {filteredMenu.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có món khả dụng</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredMenu.map((item, index) => {
                    const qty = quantities[item.id] || 0;
                    const badge = getItemBadge(index);
                    return (
                      <div
                        key={item.id}
                        className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative w-full h-52 md:h-60 overflow-hidden bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-5xl">
                          {badge && (
                            <span
                              className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          )}
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center"
                            style={{ display: item.imageUrl ? 'none' : 'flex' }}
                          >
                            {getItemEmoji(item.category)}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.description}
                            </p>
                          )}
                          {item.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: item.imageUrl as string, name: item.name })}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Xem ảnh lớn
                            </button>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.category || 'Khác'}
                          </p>

                          <div className="mt-3 flex items-end justify-between gap-3">
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                                {Number(item.price).toLocaleString('vi-VN')} VND
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                VAT {item.vatRate}%
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQty(item.id, qty - 1)}
                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={qty}
                                onChange={(e) => updateQty(item.id, Number(e.target.value))}
                                className="w-14 text-center border rounded-md px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                              />
                              <button
                                type="button"
                                onClick={() => updateQty(item.id, qty + 1)}
                                className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 backdrop-blur">
          <div className="w-full px-1 md:px-4 xl:px-8 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedCount} món - Tổng cộng
              </p>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {totals.total.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xem giỏ hàng
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-3">
          <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-900 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Giỏ hàng của bạn</h3>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                {selectedItems.map((row) => (
                  <div
                    key={row.item.id}
                    className="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{row.item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {row.qty} x {Number(row.item.price).toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {(row.qty * Number(row.item.price)).toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Tên khách (không bắt buộc)
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    placeholder="Ví dụ: Anh Nam"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    placeholder="Ví dụ: Ít đá, không đường"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 space-y-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Tạm tính: <span className="font-semibold">{totals.subtotal.toLocaleString('vi-VN')} VND</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Thuế: <span className="font-semibold">{totals.tax.toLocaleString('vi-VN')} VND</span>
                </p>
                <p className="text-base text-gray-900 dark:text-gray-100">
                  Tổng cộng: <span className="font-bold">{totals.total.toLocaleString('vi-VN')} VND</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                {submitting ? 'Đang gửi...' : 'Xác nhận đặt món'}
              </button>
            </form>
          </div>
        </div>
      )}

      {lastOrderNumber && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 shadow-xl p-5 text-center space-y-3">
            <div className="text-4xl">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Đặt món thành công
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Mã đơn của bạn là <span className="font-bold">{lastOrderNumber}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nhân viên sẽ xác nhận và phục vụ sớm nhất.
            </p>
            <button
              type="button"
              onClick={() => {
                setLastOrderNumber('');
                setSuccess('');
              }}
              className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 px-3 py-1.5 rounded-md bg-white/20 text-white hover:bg-white/30"
            >
              Đóng
            </button>
            <div className="rounded-xl overflow-hidden bg-black">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full max-h-[85vh] object-contain"
              />
            </div>
            <p className="text-center text-white/90 text-sm mt-2">{previewImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QrOrder;

