import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { restaurantApi } from '../../api/restaurant.api';

type TaxRow = {
  vatRate: number | string;
  _sum: {
    taxableAmount: number | string | null;
    taxAmount: number | string | null;
  };
};

function TaxSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    businessCategory: '',
  });
  const [data, setData] = useState<{
    outputByRate: TaxRow[];
    inputByRate: TaxRow[];
    taxOutput: number;
    taxInput: number;
    taxPayable: number;
  } | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await restaurantApi.getTaxSummary({
        from: filters.from || undefined,
        to: filters.to || undefined,
        businessCategory: filters.businessCategory || undefined,
      });
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể tải tổng hợp thuế');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const renderRows = (rows: TaxRow[]) =>
    rows.length === 0 ? (
      <tr>
        <td colSpan={3} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
          Không có dữ liệu
        </td>
      </tr>
    ) : (
      rows.map((row) => (
        <tr key={String(row.vatRate)}>
          <td className="px-4 py-3">{row.vatRate}%</td>
          <td className="px-4 py-3">{Number(row._sum.taxableAmount || 0).toLocaleString('vi-VN')}</td>
          <td className="px-4 py-3 font-medium">{Number(row._sum.taxAmount || 0).toLocaleString('vi-VN')}</td>
        </tr>
      ))
    );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tax Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng hợp thuế GTGT đầu ra, đầu vào và số thuế phải nộp
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
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
            value={filters.businessCategory}
            onChange={(e) => setFilters((p) => ({ ...p, businessCategory: e.target.value }))}
            className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="">Tất cả loại hình</option>
            <option value="fnb">F&B</option>
            <option value="grocery">Tạp hóa</option>
            <option value="retail">Retail</option>
          </select>
          <button onClick={() => void load()} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
            Lọc
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Thuế đầu ra</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Number(data.taxOutput).toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Thuế đầu vào</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Number(data.taxInput).toLocaleString('vi-VN')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Thuế phải nộp</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Number(data.taxPayable).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <h3 className="px-4 py-3 font-semibold border-b dark:border-gray-800">Đầu ra theo thuế suất</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs">VAT</th>
                      <th className="px-4 py-2 text-left text-xs">Doanh số chịu thuế</th>
                      <th className="px-4 py-2 text-left text-xs">Thuế</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows(data.outputByRate || [])}</tbody>
                </table>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <h3 className="px-4 py-3 font-semibold border-b dark:border-gray-800">Đầu vào theo thuế suất</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs">VAT</th>
                      <th className="px-4 py-2 text-left text-xs">Giá trị mua vào</th>
                      <th className="px-4 py-2 text-left text-xs">Thuế</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows(data.inputByRate || [])}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default TaxSummary;

