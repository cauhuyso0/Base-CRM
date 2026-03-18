import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { restaurantApi } from '../../api/restaurant.api';

function BusinessSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    businessCategory: 'fnb',
    displayName: '',
    currency: 'VND',
    taxMethod: 'DEDUCTION',
    defaultVatRate: 8,
    serviceChargeRate: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await restaurantApi.getBusinessSetting();
        if (data) {
          setForm({
            businessCategory: data.businessCategory || 'fnb',
            displayName: data.displayName || '',
            currency: data.currency || 'VND',
            taxMethod: data.taxMethod || 'DEDUCTION',
            defaultVatRate: Number(data.defaultVatRate || 0),
            serviceChargeRate: Number(data.serviceChargeRate || 0),
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Không thể tải cấu hình');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await restaurantApi.saveBusinessSetting({
        businessCategory: form.businessCategory,
        displayName: form.displayName || undefined,
        currency: form.currency,
        taxMethod: form.taxMethod as 'DEDUCTION' | 'DIRECT',
        defaultVatRate: Number(form.defaultVatRate),
        serviceChargeRate: Number(form.serviceChargeRate),
      });
      setSuccess('Đã lưu cấu hình thành công');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Business Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cấu hình loại hình kinh doanh và chính sách thuế mặc định
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        ) : (
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Loại hình</label>
              <select
                value={form.businessCategory}
                onChange={(e) => setForm((p) => ({ ...p, businessCategory: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="fnb">F&B (quán ăn/cafe/trà sữa)</option>
                <option value="grocery">Tạp hóa</option>
                <option value="retail">Bán lẻ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tên hiển thị</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="Ví dụ: Cafe Mộc"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Tiền tệ</label>
                <input
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Phương pháp thuế</label>
                <select
                  value={form.taxMethod}
                  onChange={(e) => setForm((p) => ({ ...p, taxMethod: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="DEDUCTION">Khấu trừ</option>
                  <option value="DIRECT">Trực tiếp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">VAT mặc định (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.defaultVatRate}
                  onChange={(e) => setForm((p) => ({ ...p, defaultVatRate: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Phí phục vụ mặc định (%)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.serviceChargeRate}
                  onChange={(e) => setForm((p) => ({ ...p, serviceChargeRate: Number(e.target.value) }))}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default BusinessSettings;

