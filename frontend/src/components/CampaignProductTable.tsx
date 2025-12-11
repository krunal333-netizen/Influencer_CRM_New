import { Trash2 } from 'lucide-react';
import { CampaignProduct } from '../types/models';

interface CampaignProductTableProps {
  products: CampaignProduct[];
  onRemove?: (productId: string) => void;
  loading?: boolean;
}

export default function CampaignProductTable({
  products,
  onRemove,
  loading = false,
}: CampaignProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No products linked to this campaign yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-2 text-left font-semibold text-slate-900">
              Product
            </th>
            <th className="px-4 py-2 text-left font-semibold text-slate-900">
              SKU
            </th>
            <th className="px-4 py-2 text-right font-semibold text-slate-900">
              Quantity
            </th>
            <th className="px-4 py-2 text-right font-semibold text-slate-900">
              Price
            </th>
            {onRemove && (
              <th className="px-4 py-2 text-center font-semibold text-slate-900">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-4 py-3 text-slate-900 font-medium">
                {item.product?.name || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {item.product?.sku || '-'}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                ${parseFloat(item.product?.price || '0').toFixed(2)}
              </td>
              {onRemove && (
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onRemove(item.productId)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
