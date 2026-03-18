import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { caseApi } from '../../api/case.api';
import { companyApi } from '../../api/company.api';
import { customerApi } from '../../api/customer.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'subject', label: 'Tiêu đề' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'customerId', label: 'Customer ID' },
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
  { key: 'code', label: 'Mã case', required: true },
  { key: 'subject', label: 'Tiêu đề', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'type', label: 'Loại' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
];

const editFields: CrudField[] = [
  { key: 'subject', label: 'Tiêu đề', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'type', label: 'Loại' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'resolution', label: 'Hướng xử lý', type: 'textarea' },
];

function ListCase() {
  return (
    <CrudPage
      title="Case"
      api={caseApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListCase;
