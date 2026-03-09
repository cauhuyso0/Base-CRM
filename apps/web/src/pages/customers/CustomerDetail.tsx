import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Customer } from '@base-crm/shared';
import Layout from '../../components/layout/Layout';
import { customerApi } from '../../api/customer.api';

function CustomerDetail() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!uuid) {
        setError('Thiếu customer uuid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await customerApi.getByUuid(uuid);
        setCustomer(response);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Không thể tải chi tiết khách hàng',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [uuid]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chi tiết khách hàng</h1>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Quay lại
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800 dark:text-gray-300">
            Đang tải...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && customer && (
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm dark:text-gray-200">
              <div>
                <span className="text-gray-500 dark:text-gray-400">ID:</span> {customer.uuid}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Mã:</span> {customer.code || '-'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tên:</span> {customer.name || '-'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Loại:</span> {customer.type || '-'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span> {customer.email || '-'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Điện thoại:</span>{' '}
                {customer.phone || customer.mobile || '-'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>{' '}
                {customer.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Rating:</span>{' '}
                {customer.rating ? '⭐'.repeat(customer.rating) : '-'}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !customer && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
            Không tìm thấy khách hàng. <Link to="/customers">Quay về danh sách</Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CustomerDetail;
