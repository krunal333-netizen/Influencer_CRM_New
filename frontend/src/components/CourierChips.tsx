import { Truck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CourierShipment } from '../types/models';
import StatusBadge from './StatusBadge';

interface CourierChipsProps {
  shipments?: CourierShipment[];
}

export default function CourierChips({ shipments }: CourierChipsProps) {
  const navigate = useNavigate();

  if (!shipments || shipments.length === 0) {
    return <div className="text-sm text-slate-500">No shipments linked</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">
          Linked Shipments ({shipments.length})
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/dashboard/courier')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View All
        </Button>
      </div>
      <div className="space-y-2">
        {shipments.slice(0, 3).map((shipment) => (
          <div
            key={shipment.id}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm"
          >
            <Truck className="h-4 w-4 text-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 truncate">
                {shipment.trackingNumber}
              </div>
              <div className="text-xs text-slate-500">
                {shipment.courierName}
              </div>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
        ))}
        {shipments.length > 3 && (
          <div className="text-xs text-slate-500 text-center">
            +{shipments.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}
