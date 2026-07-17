import { InventoryItem } from '../types';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
}

export function InventoryTable({ items, isLoading }: InventoryTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4 h-12 bg-muted rounded-md" />
          ))}
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <p>No inventory items found.</p>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-primary/10 text-primary';
      case 'Reserved': return 'bg-warning/10 text-warning';
      case 'Sold': return 'bg-secondary/10 text-secondary';
      case 'Expired': return 'bg-danger/10 text-danger';
      case 'Donated': return 'bg-info/10 text-info';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isExpiringSoon = (date: string) => {
    const hours = (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hours > 0 && hours < 24;
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Item Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Price (Orig / Disc)</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Expiry</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const expiring = isExpiringSoon(item.expiryDate);
              
              return (
                <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {expiring && <span title="Expiring within 24h"><AlertCircle className="w-4 h-4 text-warning" /></span>}
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={item.quantity === 0 ? 'text-danger font-medium' : ''}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{formatCurrency(item.discountedPrice)}</span>
                      {item.discountedPrice < item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={expiring || item.status === 'Expired' ? 'text-danger font-medium' : 'text-muted-foreground'}>
                        {formatRelativeTime(item.expiryDate)}
                      </span>
                      <span className="text-xs text-muted-foreground opacity-70">
                        {formatDate(item.expiryDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
