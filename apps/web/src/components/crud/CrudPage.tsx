import { useEffect, useMemo, useState } from 'react';
import Layout from '../layout/Layout';

const EMPTY_QUICK_FILTERS: CrudQuickFilter[] = [];
const EMPTY_QUICK_SORTS: CrudQuickSort[] = [];

export type CrudFieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'date'
  | 'email'
  | 'select';

export interface CrudSelectOption {
  value: string | number | boolean;
  label: string;
}

export interface CrudField {
  key: string;
  label: string;
  type?: CrudFieldType;
  required?: boolean;
  placeholder?: string;
  options?: CrudSelectOption[];
  loadOptions?: () => Promise<any[]>;
  optionValueKey?: string;
  optionLabelKey?: string;
  optionLabelBuilder?: (item: any) => string;
}

export interface CrudColumn {
  key: string;
  label: string;
}

export interface CrudApi {
  getAll: (params?: {
    search?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }) => Promise<Record<string, unknown>[]>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: number) => Promise<void>;
}

export interface CrudQuickFilter {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: string;
  dynamicOptionsFromItems?: boolean;
}

export interface CrudQuickSortOption {
  value: string;
  label: string;
  sortByKey?: string;
  direction?: 'asc' | 'desc';
  valueType?: 'number' | 'string';
}

export interface CrudQuickSort {
  key: string;
  label: string;
  options: CrudQuickSortOption[];
  defaultValue?: string;
}

interface CrudPageProps {
  title: string;
  api: CrudApi;
  columns: CrudColumn[];
  createFields: CrudField[];
  editFields: CrudField[];
  createDefaults?: Record<string, unknown>;
  quickFilters?: CrudQuickFilter[];
  quickSorts?: CrudQuickSort[];
}

function CrudPage({
  title,
  api,
  columns,
  createFields,
  editFields,
  createDefaults,
  quickFilters = EMPTY_QUICK_FILTERS,
  quickSorts = EMPTY_QUICK_SORTS,
}: CrudPageProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilterValues, setQuickFilterValues] = useState<Record<string, string>>(
    () =>
      quickFilters.reduce<Record<string, string>>((acc, filter) => {
        acc[filter.key] = filter.defaultValue || '';
        return acc;
      }, {}),
  );
  const [quickSortValues, setQuickSortValues] = useState<Record<string, string>>(() =>
    quickSorts.reduce<Record<string, string>>((acc, sort) => {
      acc[sort.key] = sort.defaultValue || '';
      return acc;
    }, {}),
  );
  const [quickFilterOptions, setQuickFilterOptions] = useState<
    Record<string, Array<{ value: string; label: string }>>
  >(
    () =>
      quickFilters.reduce<Record<string, Array<{ value: string; label: string }>>>(
        (acc, filter) => {
          acc[filter.key] = filter.options;
          return acc;
        },
        {},
      ),
  );
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(createDefaults || {});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<Record<string, CrudSelectOption[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAll({
        search: searchTerm || undefined,
        take: 100,
        orderBy: 'createdAt:desc',
      });
      const nextItems = Array.isArray(data) ? data : [];
      setQuickFilterOptions((prev) => {
        const next = { ...prev };
        for (const filter of quickFilters) {
          if (!filter.dynamicOptionsFromItems) {
            next[filter.key] = filter.options;
            continue;
          }
          const uniqueValues = Array.from(
            new Set(
              nextItems
                .map((item) => item[filter.key])
                .filter((value) => value !== undefined && value !== null && value !== ''),
            ),
          );
          const dynamicOptions = uniqueValues
            .map((value) => ({
              value: String(value),
              label: String(value),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          const baseOption =
            filter.options.length > 0
              ? [filter.options[0]]
              : [{ value: '', label: `Tất cả ${filter.label.toLowerCase()}` }];
          next[filter.key] = [...baseOption, ...dynamicOptions];
        }
        return next;
      });
      const filteredItems = nextItems.filter((item) =>
        quickFilters.every((filter) => {
          const selected = quickFilterValues[filter.key] || '';
          if (!selected) {
            return true;
          }
          const value = item[filter.key];
          if (typeof value === 'boolean') {
            return String(value) === selected;
          }
          return String(value ?? '') === selected;
        }),
      );
      const sortedItems = [...filteredItems];
      for (const sort of quickSorts) {
        const selected = quickSortValues[sort.key] || '';
        if (!selected) {
          continue;
        }
        const selectedOption = sort.options.find((option) => option.value === selected);
        if (!selectedOption?.sortByKey || !selectedOption.direction) {
          continue;
        }
        const sortKey = selectedOption.sortByKey;
        const sortDirection = selectedOption.direction === 'asc' ? 1 : -1;
        const sortValueType = selectedOption.valueType || 'string';
        sortedItems.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];
          if (sortValueType === 'number') {
            const aNum = Number(aValue ?? 0);
            const bNum = Number(bValue ?? 0);
            return (aNum - bNum) * sortDirection;
          }
          const aStr = String(aValue ?? '');
          const bStr = String(bValue ?? '');
          return aStr.localeCompare(bStr) * sortDirection;
        });
      }
      setItems(sortedItems);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || `Không thể tải ${title}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [searchTerm, quickFilters, quickFilterValues, quickSorts, quickSortValues]);

  const activeFields = useMemo(
    () => (editId === null ? createFields : editFields),
    [createFields, editFields, editId],
  );

  const loadFieldOptions = async (
    fields: CrudField[],
    initializeDefaultValue = false,
  ) => {
    const asyncFields = fields.filter(
      (field) => field.type === 'select' && field.loadOptions,
    );
    if (asyncFields.length === 0) {
      return;
    }

    try {
      const loaded = await Promise.all(
        asyncFields.map(async (field) => {
          const items = await field.loadOptions?.();
          const valueKey = field.optionValueKey || 'id';
          const labelKey = field.optionLabelKey || 'name';
          const options: CrudSelectOption[] = (items || [])
            .map((item): CrudSelectOption | null => {
              const value = item[valueKey] as string | number | boolean | undefined;
              if (value === undefined || value === null || value === '') {
                return null;
              }
              const label =
                field.optionLabelBuilder?.(item) ||
                String(item[labelKey] ?? item.code ?? item.id ?? value);
              return { value, label };
            })
            .filter((option): option is CrudSelectOption => option !== null);

          return { key: field.key, options };
        }),
      );

      setFieldOptions((prev) => {
        const next = { ...prev };
        for (const row of loaded) {
          next[row.key] = row.options;
        }
        return next;
      });

      if (initializeDefaultValue) {
        setForm((prev) => {
          const next = { ...prev };
          for (const row of loaded) {
            if (
              (next[row.key] === undefined ||
                next[row.key] === null ||
                next[row.key] === '') &&
              row.options.length > 0
            ) {
              next[row.key] = row.options[0].value;
            }
          }
          return next;
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Không thể tải dữ liệu tham chiếu',
      );
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(createDefaults || {});
    setShowModal(true);
    void loadFieldOptions(createFields, true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    const itemId = Number(item.id);
    if (!Number.isFinite(itemId)) {
      setError('Bản ghi này không có id hợp lệ để chỉnh sửa');
      return;
    }
    setEditId(itemId);
    const nextForm: Record<string, unknown> = {};
    for (const field of editFields) {
      const value = item[field.key];
      if (field.type === 'date' && typeof value === 'string') {
        nextForm[field.key] = value.slice(0, 10);
      } else {
        nextForm[field.key] = value ?? '';
      }
    }
    setForm(nextForm);
    setShowModal(true);
    void loadFieldOptions(editFields, false);
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};
    for (const field of activeFields) {
      const rawValue = form[field.key];
      if (rawValue === '' || rawValue === null || rawValue === undefined) {
        continue;
      }
      if (field.type === 'number') {
        payload[field.key] =
          typeof rawValue === 'number' ? rawValue : Number(rawValue);
      } else if (field.type === 'date') {
        payload[field.key] = new Date(rawValue as string).toISOString();
      }
      else {
        payload[field.key] = rawValue;
      }
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const payload = buildPayload();
      if (editId === null) {
        await api.create(payload);
      } else {
        await api.update(editId, payload);
      }
      setShowModal(false);
      await loadItems();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || `Không thể lưu ${title}`,
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm('Bạn có chắc muốn xóa bản ghi này?');
    if (!ok) return;
    try {
      await api.delete(id);
      await loadItems();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || `Không thể xóa ${title}`,
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <button
            type="button"
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Thêm mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-80 border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            {quickFilters.map((filter) => (
              <select
                key={filter.key}
                value={quickFilterValues[filter.key] || ''}
                onChange={(e) =>
                  setQuickFilterValues((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }))
                }
                className="w-full md:w-56 border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                {(quickFilterOptions[filter.key] || filter.options).map((option) => (
                  <option key={`${filter.key}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
            {quickSorts.map((sort) => (
              <select
                key={sort.key}
                value={quickSortValues[sort.key] || ''}
                onChange={(e) =>
                  setQuickSortValues((prev) => ({
                    ...prev,
                    [sort.key]: e.target.value,
                  }))
                }
                className="w-full md:w-56 border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                {sort.options.map((option) => (
                  <option key={`${sort.key}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={String(item.uuid || item.id)}>
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                          >
                            {String(item[column.key] ?? '-')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            disabled={!Number.isFinite(Number(item.id))}
                            className="px-3 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(Number(item.id))}
                            disabled={!Number.isFinite(Number(item.id))}
                            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-lg bg-white shadow-xl dark:bg-gray-900 dark:shadow-none dark:ring-1 dark:ring-gray-800">
            <div className="border-b px-6 py-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editId === null ? `Thêm ${title}` : `Sửa ${title}`}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
              {activeFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => {
                        const selected = (fieldOptions[field.key] || field.options || []).find(
                          (option) => String(option.value) === e.target.value,
                        );
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: selected ? selected.value : e.target.value,
                        }));
                      }}
                      className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      {(fieldOptions[field.key] || field.options || []).map((option) => (
                        <option key={`${field.key}-${option.value}`} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={field.required}
                      type={field.type || 'text'}
                      value={String(form[field.key] ?? '')}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  disabled={submitLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CrudPage;
