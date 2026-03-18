import CrudPage, { CrudColumn, CrudField } from '../../components/crud/CrudPage';
import { ticketApi } from '../../api/ticket.api';
import { caseApi } from '../../api/case.api';

const columns: CrudColumn[] = [
  { key: 'code', label: 'Mã' },
  { key: 'subject', label: 'Tiêu đề' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdBy', label: 'Created By' },
];

const createFields: CrudField[] = [
  { key: 'code', label: 'Mã ticket', required: true },
  { key: 'subject', label: 'Tiêu đề', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  {
    key: 'caseId',
    label: 'Case',
    type: 'select',
    loadOptions: () => caseApi.getAll({ take: 100, orderBy: 'createdAt:desc' }),
    optionLabelBuilder: (item) => `${String(item.code ?? '')} - ${String(item.subject ?? '')}`,
  },
  { key: 'type', label: 'Loại' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdBy', label: 'Created By', type: 'number', required: true },
];

const editFields: CrudField[] = [
  { key: 'subject', label: 'Tiêu đề', required: true },
  { key: 'description', label: 'Mô tả', type: 'textarea' },
  { key: 'type', label: 'Loại' },
  { key: 'priority', label: 'Mức độ' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'assignedTo', label: 'Assigned To', type: 'number' },
];

function ListTicket() {
  return (
    <CrudPage
      title="Ticket"
      api={ticketApi}
      columns={columns}
      createFields={createFields}
      editFields={editFields}
      createDefaults={{ createdBy: 1 }}
    />
  );
}

export default ListTicket;
