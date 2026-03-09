import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateCustomerRequest, Customer } from '@base-crm/shared';
import Layout from '../../components/layout/Layout';
import { customerApi } from '../../api/customer.api';
import { RefreshCw } from 'lucide-react';

type ActiveFilter = 'all' | 'active' | 'inactive';
type SortField = 'createdAt' | 'name' | 'code' | 'rating';
type SortDirection = 'asc' | 'desc';
type TypeFilter = 'all' | 'individual' | 'corporation';

function ListCustomer() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState<CreateCustomerRequest>({
    companyId: 1,
    code: '',
    name: '',
    type: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError('');

        const skip = (page - 1) * pageSize;
        const isActiveValue =
          activeFilter === 'all' ? undefined : activeFilter === 'active';
        const commonFilters = {
          search: searchTerm || undefined,
          isActive: isActiveValue,
          type: typeFilter === 'all' ? undefined : typeFilter,
        };

        const [items, total] = await Promise.all([
          customerApi.getAll({
            ...commonFilters,
            skip,
            take: pageSize,
            orderBy: `${sortField}:${sortDirection}`,
          }),
          customerApi.count(commonFilters),
        ]);

        setCustomers(items);
        setTotalItems(total);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Không thể tải danh sách khách hàng',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [activeFilter, typeFilter, page, pageSize, reloadKey, searchTerm, sortDirection, sortField]);

  const resetCreateForm = () => {
    setForm({
      companyId: 1,
      code: '',
      name: '',
      type: '',
      email: '',
      phone: '',
    });
    setCreateError('');
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await customerApi.create({
        companyId: Number(form.companyId),
        code: form.code.trim(),
        name: form.name.trim(),
        type: form.type?.trim() || undefined,
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
      });
      setShowCreateModal(false);
      resetCreateForm();
      setPage(1);
      setReloadKey((prev) => prev + 1);
    } catch (err: any) {
      setCreateError(
        err.response?.data?.message ||
        err.message ||
        'Không thể tạo khách hàng mới',
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return '↕';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Danh sách khách hàng</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
          >
            Thêm khách hàng
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
          <input
            type="text"
            placeholder="Tìm theo mã, tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as ActiveFilter);
              setPage(1);
            }}
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TypeFilter);
              setPage(1);
            }}
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <option value="all">Tất cả loại</option>
            <option value="INDIVIDUAL">INDIVIDUAL</option>
            <option value="CORPORATION">CORPORATION</option>
          </select>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Đặt lại bộ lọc"
              title="Đặt lại bộ lọc"
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
                setActiveFilter('all');
                setTypeFilter('all');
                setSortField('createdAt');
                setSortDirection('desc');
                setPage(1);
              }}
              className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || activeFilter !== 'all'
                ? 'Không tìm thấy khách hàng phù hợp bộ lọc'
                : 'Chưa có khách hàng nào'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('code')}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Mã
                        <span>{getSortIndicator('code')}</span>
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('name')}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Tên khách hàng
                        <span>{getSortIndicator('name')}</span>
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Điện thoại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      <button
                        type="button"
                        onClick={() => handleColumnSort('rating')}
                        className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        Đánh giá
                        <span>{getSortIndicator('rating')}</span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                  {customers.map((customer) => (
                    <tr
                      key={customer.uuid}
                      className="hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800/60"
                      onClick={() => navigate(`/customers/${customer.uuid}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {customer.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.phone || customer.mobile || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                        >
                          {customer.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {customer.rating ? '⭐'.repeat(customer.rating) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tổng: <span className="font-semibold">{totalItems}</span> khách hàng
          </p>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 min-w-[110px] rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading}
              className="h-9 rounded-md bg-gray-100 px-3 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Trước
            </button>
            <span className="min-w-[96px] text-center text-sm text-gray-700 dark:text-gray-200">
              Trang {page}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              className="h-9 rounded-md bg-gray-100 px-3 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <div className="border-b px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Thêm khách hàng
              </h2>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 px-6 py-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Company ID *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.companyId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      companyId: Number(e.target.value),
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Mã khách hàng *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Tên khách hàng *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Loại</label>
                <select
                  value={form.type || 'INDIVIDUAL'}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                  <option value="CORPORATION">CORPORATION</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Điện thoại</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  disabled={createLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                  disabled={createLoading}
                >
                  {createLoading ? 'Đang tạo...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ListCustomer;
