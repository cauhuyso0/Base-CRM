import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { restaurantApi } from '../../api/restaurant.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã món' },
  { key: 'name', label: 'Tên món' },
  { key: 'category', label: 'Danh mục' },
  { key: 'imageUrl', label: 'Ảnh món (URL)' },
  { key: 'price', label: 'Giá' },
  { key: 'vatRate', label: 'VAT (%)' },
  { key: 'availabilityLabel', label: 'Trạng thái' },
];

const createFields: CrudField[] = [
  { key: 'code', label: 'Mã món', required: true },
  { key: 'name', label: 'Tên món', required: true },
  { key: 'category', label: 'Danh mục' },
  { key: 'imageUrl', label: 'Ảnh món (URL)' },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'price', label: 'Giá', type: 'number', required: true },
  { key: 'vatRate', label: 'VAT (%)', type: 'number' },
  {
    key: 'isAvailable',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { value: true, label: 'Còn bán' },
      { value: false, label: 'Hết món' },
    ],
  },
];

const editFields: CrudField[] = [
  { key: 'name', label: 'Tên món', required: true },
  { key: 'category', label: 'Danh mục' },
  { key: 'imageUrl', label: 'Ảnh món (URL)' },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'price', label: 'Giá', type: 'number' },
  { key: 'vatRate', label: 'VAT (%)', type: 'number' },
  {
    key: 'isAvailable',
    label: 'Trạng thái',
    type: 'select',
    options: [
      { value: true, label: 'Còn bán' },
      { value: false, label: 'Hết món' },
    ],
  },
];

function MenuManagement() {
  return (
    <CrudPage
      title="Quản lý menu"
      api={{
        getAll: async () =>
          (await restaurantApi.getMenuItems()).map((item) => ({
            ...item,
            availabilityLabel: item.isAvailable === false ? 'Hết món' : 'Còn bán',
          })) as unknown as Record<string, unknown>[],
        create: (data) => restaurantApi.createMenuItem(data),
        update: (id, data) => restaurantApi.updateMenuItem(id, data),
        delete: (id) => restaurantApi.deleteMenuItem(id),
      }}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
      createDefaults={{ isAvailable: true }}
      quickFilters={[
        {
          key: 'isAvailable',
          label: 'Trạng thái',
          defaultValue: '',
          options: [
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Còn bán' },
            { value: 'false', label: 'Hết món' },
          ],
        },
        {
          key: 'category',
          label: 'Danh mục',
          defaultValue: '',
          dynamicOptionsFromItems: true,
          options: [{ value: '', label: 'Tất cả danh mục' }],
        },
      ]}
      quickSorts={[
        {
          key: 'priceSort',
          label: 'Sắp xếp',
          defaultValue: '',
          options: [
            { value: '', label: 'Sắp xếp giá' },
            {
              value: 'priceAsc',
              label: 'Giá: thấp đến cao',
              sortByKey: 'price',
              direction: 'asc',
              valueType: 'number',
            },
            {
              value: 'priceDesc',
              label: 'Giá: cao đến thấp',
              sortByKey: 'price',
              direction: 'desc',
              valueType: 'number',
            },
          ],
        },
      ]}
    />
  );
}

export default MenuManagement;

