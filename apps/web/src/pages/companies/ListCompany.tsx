import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { companyApi } from '../../api/company.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Tên công ty' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'isActive', label: 'Hoạt động' },
];

const createFields: CrudField[] = [
  { key: 'code', label: 'Mã công ty', required: true },
  { key: 'name', label: 'Tên công ty', required: true },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website' },
];

const editFields: CrudField[] = [
  { key: 'name', label: 'Tên công ty', required: true },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website' },
];

function ListCompany() {
  return (
    <CrudPage
      title="Công ty"
      api={companyApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListCompany;
