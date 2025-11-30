import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import StatusBadge from '../components/StatusBadge';

const mockFinancialDocuments = [
  {
    id: '1',
    type: 'INVOICE',
    documentNumber: 'INV-001',
    amount: 5000,
    status: 'PAID',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    paidDate: '2024-02-10',
  },
  {
    id: '2',
    type: 'PO',
    documentNumber: 'PO-001',
    amount: 15000,
    status: 'APPROVED',
    issueDate: '2024-02-01',
    dueDate: '2024-03-01',
  },
  {
    id: '3',
    type: 'FORM',
    documentNumber: 'FORM-001',
    amount: 2500,
    status: 'PENDING',
    issueDate: '2024-02-20',
  },
];

export default function FinancialPage() {
  const totalAmount = mockFinancialDocuments.reduce((sum, doc) => sum + doc.amount, 0);
  const paidAmount = mockFinancialDocuments
    .filter((doc) => doc.status === 'PAID')
    .reduce((sum, doc) => sum + doc.amount, 0);
  const pendingAmount = mockFinancialDocuments
    .filter((doc) => doc.status === 'PENDING' || doc.status === 'APPROVED')
    .reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Financial Overview</h2>
          <p className="text-slate-600">Track invoices, purchase orders, and financial documents</p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-3xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Paid</p>
                <p className="text-3xl font-bold text-emerald-600">${paidAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">${pendingAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Types Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { type: 'PO', label: 'Purchase Orders', count: mockFinancialDocuments.filter((d) => d.type === 'PO').length },
            { type: 'INVOICE', label: 'Invoices', count: mockFinancialDocuments.filter((d) => d.type === 'INVOICE').length },
            { type: 'FORM', label: 'Forms', count: mockFinancialDocuments.filter((d) => d.type === 'FORM').length },
          ].map((group) => (
            <Card key={group.type}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{group.count}</p>
                  <p className="mt-2 text-sm text-slate-600">{group.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest financial documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Document</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Issue Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFinancialDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {doc.documentNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{doc.type}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        ${doc.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(doc.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
