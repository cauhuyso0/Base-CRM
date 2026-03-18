import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { branchApi } from '../../api/branch.api';
import { companyApi } from '../../api/company.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Tên chi nhánh' },
  { key: 'companyId', label: 'Company ID' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Điện thoại' },
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
  { key: 'code', label: 'Mã chi nhánh', required: true },
  { key: 'name', label: 'Tên chi nhánh', required: true },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'email', label: 'Email', type: 'email' },
];

const editFields: CrudField[] = [
  { key: 'name', label: 'Tên chi nhánh', required: true },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'email', label: 'Email', type: 'email' },
];

function ListBranch() {
  return (
    <CrudPage
      title="Chi nhánh"
      api={branchApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListBranch;
