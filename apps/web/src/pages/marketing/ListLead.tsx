import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { leadApi } from '../../api/lead.api';
import { companyApi } from '../../api/company.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'firstName', label: 'Tên' },
  { key: 'lastName', label: 'Họ' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Trạng thái' },
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
  { key: 'code', label: 'Mã lead', required: true },
  { key: 'firstName', label: 'Tên', required: true },
  { key: 'lastName', label: 'Họ', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'company', label: 'Tên công ty' },
  { key: 'title', label: 'Chức danh' },
  { key: 'source', label: 'Nguồn' },
];

const editFields: CrudField[] = [
  { key: 'firstName', label: 'Tên', required: true },
  { key: 'lastName', label: 'Họ', required: true },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'company', label: 'Tên công ty' },
  { key: 'title', label: 'Chức danh' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'rating', label: 'Đánh giá', type: 'number' },
];

function ListLead() {
  return (
    <CrudPage
      title="Lead"
      api={leadApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListLead;
