import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { opportunityApi } from '../../api/opportunity.api';
import { companyApi } from '../../api/company.api';
import { customerApi } from '../../api/customer.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Tên cơ hội' },
  { key: 'stage', label: 'Giai đoạn' },
  { key: 'probability', label: 'Xác suất' },
  { key: 'amount', label: 'Giá trị' },
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
  { key: 'code', label: 'Mã cơ hội', required: true },
  { key: 'name', label: 'Tên cơ hội', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'stage', label: 'Giai đoạn' },
  { key: 'probability', label: 'Xác suất', type: 'number' },
  { key: 'amount', label: 'Giá trị', type: 'number' },
];

const editFields: CrudField[] = [
  { key: 'name', label: 'Tên cơ hội', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'stage', label: 'Giai đoạn' },
  { key: 'probability', label: 'Xác suất', type: 'number' },
  { key: 'amount', label: 'Giá trị', type: 'number' },
  { key: 'status', label: 'Trạng thái' },
];

function ListOpportunity() {
  return (
    <CrudPage
      title="Cơ hội"
      api={opportunityApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListOpportunity;
