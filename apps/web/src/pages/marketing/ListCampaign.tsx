import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { campaignApi } from '../../api/campaign.api';
import { companyApi } from '../../api/company.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Tên campaign' },
  { key: 'type', label: 'Loại' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'budget', label: 'Ngân sách' },
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
  { key: 'code', label: 'Mã campaign', required: true },
  { key: 'name', label: 'Tên campaign', required: true },
  { key: 'type', label: 'Loại campaign', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
  { key: 'endDate', label: 'Ngày kết thúc', type: 'date' },
  { key: 'budget', label: 'Ngân sách', type: 'number' },
];

const editFields: CrudField[] = [
  { key: 'name', label: 'Tên campaign', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
  { key: 'endDate', label: 'Ngày kết thúc', type: 'date' },
  { key: 'budget', label: 'Ngân sách', type: 'number' },
  { key: 'status', label: 'Trạng thái' },
];

function ListCampaign() {
  return (
    <CrudPage
      title="Campaign"
      api={campaignApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
    />
  );
}

export default ListCampaign;
