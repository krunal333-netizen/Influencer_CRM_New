import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCreateFinancialDocument } from '../../hooks/useFinancialDocuments';

const documentSchema = z.object({
  type: z.enum(['PO', 'INVOICE', 'FORM']),
  documentNumber: z.string().min(1, 'Document number is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  status: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  campaignId: z.string().min(1, 'Campaign is required'),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  campaigns?: Array<{ id: string; name: string }>;
}

export default function DocumentGenerationModal({
  isOpen,
  onClose,
  campaignId,
  campaigns = [],
}: DocumentGenerationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDocument = useCreateFinancialDocument();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: 'INVOICE',
      status: 'PENDING',
      campaignId: campaignId || '',
      issueDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    try {
      await createDocument.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Generate Financial Document</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as 'PO' | 'INVOICE' | 'FORM')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PO">Purchase Order (PO)</SelectItem>
                  <SelectItem value="INVOICE">Invoice</SelectItem>
                  <SelectItem value="FORM">Form</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                {...register('documentNumber')}
                placeholder="e.g., INV-001"
              />
              {errors.documentNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.documentNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue="PENDING"
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                {...register('issueDate')}
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="campaignId">Campaign</Label>
            <Select
              value={watch('campaignId')}
              onValueChange={(value) => setValue('campaignId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.campaignId && (
              <p className="mt-1 text-sm text-red-600">{errors.campaignId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
