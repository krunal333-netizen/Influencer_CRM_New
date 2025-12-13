import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface DocumentFiltersProps {
  filters: {
    type?: string;
    status?: string;
    search?: string;
  };
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export default function DocumentFilters({ filters, onFilterChange }: DocumentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search documents..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, type: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PO">Purchase Orders</SelectItem>
            <SelectItem value="INVOICE">Invoices</SelectItem>
            <SelectItem value="FORM">Forms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFilterChange({ ...filters, status: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
