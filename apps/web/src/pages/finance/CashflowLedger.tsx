import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { CashFlowEntry, restaurantApi } from '../../api/restaurant.api';

function CashflowLedger() {
  const [items, setItems] = useState<CashFlowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    direction: '',
    businessCategory: '',
  });

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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cashflow Ledger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sổ thu chi tổng quát cho nhiều loại hình kinh doanh
          </p>
        </div>

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

