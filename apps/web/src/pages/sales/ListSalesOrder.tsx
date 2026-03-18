import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { salesOrderApi } from '../../api/salesOrder.api';
import { companyApi } from '../../api/company.api';
import { customerApi } from '../../api/customer.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'customerId', label: 'Customer ID' },
  { key: 'orderDate', label: 'Ngày đặt' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'totalAmount', label: 'Tổng tiền' },
];

const createFields: CrudField[] = [
  {
    key: 'companyId',
    label: 'Công ty',
    type: 'select',
    required: true,
    loadOptions: () => companyApi.getAll({ take: 100, orderBy: 'name:asc' }),
    optionLabelBuilder: (item) => `${String(item.code ?? '')} - ${String(item.name ?? '')}`,
  },
  {
    key: 'customerId',
    label: 'Khách hàng',
    type: 'select',
    required: true,
    loadOptions: () => customerApi.getAll({ take: 100, orderBy: 'name:asc' }),
    optionLabelBuilder: (item) => `${String(item.code ?? '')} - ${String(item.name ?? '')}`,
  },
  { key: 'code', label: 'Mã đơn hàng', required: true },
  { key: 'orderDate', label: 'Ngày đặt', type: 'date' },
  { key: 'deliveryDate', label: 'Ngày giao', type: 'date' },
  { key: 'paymentTerm', label: 'Điều khoản thanh toán' },
  { key: 'shippingAddress', label: 'Địa chỉ giao hàng' },
  { key: 'totalAmount', label: 'Tổng tiền', type: 'number' },
];

const editFields: CrudField[] = [
  { key: 'deliveryDate', label: 'Ngày giao', type: 'date' },
  { key: 'paymentTerm', label: 'Điều khoản thanh toán' },
  { key: 'shippingAddress', label: 'Địa chỉ giao hàng' },
  { key: 'billingAddress', label: 'Địa chỉ hóa đơn' },
  { key: 'notes', label: 'Ghi chú', type: 'textarea' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'totalAmount', label: 'Tổng tiền', type: 'number' },
];

function ListSalesOrder() {
  return (
    <CrudPage
      title="Đơn hàng"
      api={salesOrderApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListSalesOrder;
