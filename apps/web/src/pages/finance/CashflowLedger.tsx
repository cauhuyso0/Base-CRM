import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CashFlowEntry, restaurantApi } from '../../api/restaurant.api';

function newExpenseRefCode() {
  return `EXP${Date.now().toString(36).toUpperCase().slice(-10)}`;
}

function CashflowLedger() {
  const [items, setItems] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    direction: '',
    businessCategory: '',
  });

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [expenseForm, setExpenseForm] = useState({
    referenceCode: newExpenseRefCode(),
    type: 'ingredients',
    description: '',
    amount: '',
    vatRate: '0',
    expenseDate: todayStr,
    paymentMethod: 'CASH',
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await restaurantApi.getCashflow({
        from: filters.from || undefined,
        to: filters.to || undefined,
        direction: filters.direction || undefined,
        businessCategory: filters.businessCategory || undefined,
      });
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải sổ thu chi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expenseForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Nhập số tiền chi hợp lệ');
      return;
    }
    try {
      setExpenseSubmitting(true);
      setError('');
      setSuccess('');
      const expenseDateIso = new Date(`${expenseForm.expenseDate}T12:00:00`).toISOString();
      await restaurantApi.createExpense({
        referenceCode: expenseForm.referenceCode.trim(),
        type: expenseForm.type,
        description: expenseForm.description.trim() || undefined,
        amount,
        vatRate: Number(expenseForm.vatRate) || 0,
        expenseDate: expenseDateIso,
        paymentMethod: expenseForm.paymentMethod || undefined,
      });
      setSuccess('Đã ghi nhận khoản chi. Dòng tiền sẽ cập nhật trong bảng bên dưới.');
      setExpenseForm((prev) => ({
        ...prev,
        referenceCode: newExpenseRefCode(),
        description: '',
        amount: '',
        vatRate: '0',
        expenseDate: todayStr,
      }));
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể lưu chi phí');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cashflow Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sổ thu chi tổng quát cho nhiều loại hình kinh doanh
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ghi chi phí</h2>
          <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Mã tham chiếu</label>
              <input
                required
                value={expenseForm.referenceCode}
                onChange={(e) => setExpenseForm((p) => ({ ...p, referenceCode: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Loại chi</label>
              <select
                value={expenseForm.type}
                onChange={(e) => setExpenseForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="ingredients">Nguyên liệu</option>
                <option value="salary">Lương</option>
                <option value="rent">Thuê mặt bằng</option>
                <option value="utilities">Điện nước</option>
                <option value="marketing">Marketing</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày chi</label>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm((p) => ({ ...p, expenseDate: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Số tiền (trước VAT)</label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="VD: 500000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">VAT %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={expenseForm.vatRate}
                onChange={(e) => setExpenseForm((p) => ({ ...p, vatRate: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hình thức thanh toán</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="CASH">Tiền mặt</option>
                <option value="TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ghi chú</label>
              <input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="Mô tả ngắn (tùy chọn)"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={expenseSubmitting}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm disabled:opacity-60"
              >
                {expenseSubmitting ? 'Đang lưu...' : 'Lưu khoản chi'}
              </button>
            </div>
          </form>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <select
            value={filters.direction}
            onChange={(e) => setFilters((p) => ({ ...p, direction: e.target.value }))}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="">Tất cả dòng tiền</option>
            <option value="INCOME">Thu</option>
            <option value="EXPENSE">Chi</option>
          </select>
          <select
            value={filters.businessCategory}
            onChange={(e) => setFilters((p) => ({ ...p, businessCategory: e.target.value }))}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="">Tất cả loại hình</option>
            <option value="fnb">F&B</option>
            <option value="grocery">Tạp hóa</option>
            <option value="retail">Retail</option>
          </select>
          <button
            onClick={() => void load()}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            Lọc
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {['Ngày', 'Loại', 'Module', 'Danh mục', 'Trước thuế', 'Thuế', 'Sau thuế', 'Ghi chú'].map((head) => (
                      <th key={head} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{new Date(item.occurredAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm">{item.direction === 'INCOME' ? 'Thu' : 'Chi'}</td>
                        <td className="px-4 py-3 text-sm">{item.sourceModule}</td>
                        <td className="px-4 py-3 text-sm">{item.category}</td>
                        <td className="px-4 py-3 text-sm">{Number(item.amountExclTax).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm">{Number(item.taxAmount).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm font-medium">{Number(item.amountInclTax).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-3 text-sm">{item.note || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CashflowLedger;

