import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COLD':
        return 'outline';
      case 'ACTIVE':
        return 'info';
      case 'FINAL':
        return 'success';
      case 'DRAFT':
        return 'secondary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      case 'APPROVED':
        return 'success';
      case 'PAID':
        return 'success';
      case 'RUNNING':
        return 'info';
      case 'SUCCEEDED':
        return 'success';
      case 'FAILED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Badge variant={getVariant(status) as any}>
      {formatLabel(status)}
    </Badge>
  );
}
