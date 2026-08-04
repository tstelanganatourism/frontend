'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TransportOptionInfo } from '@/stores/inventoryStore';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import PremiumSelect from '@/components/ui/PremiumSelect';

interface BulkInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any) => Promise<void>;
  type: 'package' | 'room' | 'transport';
  entityId: number; // variant_id, room_variant_id, or package_id
  transportOptions?: TransportOptionInfo[];
  entityName?: string;
}

export function BulkInventoryModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  entityId,
  transportOptions = [],
  entityName,
}: BulkInventoryModalProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [action, setAction] = useState('CLOSE');
  
  // Package/Room capacity
  const [capacity, setCapacity] = useState<string>('');
  
  // Transport counts { optionId: count }
  const [optionCounts, setOptionCounts] = useState<Record<string, string>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate) return;
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        from_date: fromDate,
        to_date: toDate,
        action,
      };
      
      if (type === 'package') {
        payload.variant_id = entityId;
        if (action === 'UPDATE_CAPACITY') payload.total_capacity = parseInt(capacity || '0', 10);
      } else if (type === 'room') {
        payload.room_variant_id = entityId;
        if (action === 'UPDATE_CAPACITY') payload.total_rooms = parseInt(capacity || '0', 10);
      } else if (type === 'transport') {
        payload.package_id = entityId;
        if (action === 'UPDATE_CAPACITY') {
          payload.option_counts = {};
          Object.entries(optionCounts).forEach(([k, v]) => {
            if (v !== '') payload.option_counts[k] = parseInt(v, 10);
          });
        }
      }
      
      await onConfirm(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Inventory Actions</DialogTitle>
          <DialogDescription>Apply actions to multiple inventory dates at once.</DialogDescription>
        </DialogHeader>

        {entityName && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm font-semibold text-slate-800">
            {entityName}
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <CustomDatePicker value={fromDate} onChange={setFromDate} dropUp={true} isAdmin={true} />
            </div>
            <div className="space-y-2 relative">
              <Label>To Date</Label>
              <CustomDatePicker value={toDate} onChange={setToDate} min={fromDate} align="right" dropUp={true} isAdmin={true} />
            </div>
          </div>
          
          <div className="space-y-2">
            <PremiumSelect
              label="Action"
              value={action}
              onChange={(val) => setAction(val as string)}
              options={[
                { value: 'CLOSE', label: 'Close Slots' },
                { value: 'OPEN', label: 'Open Slots' },
                { value: 'DELETE', label: 'Delete Slots' },
                { value: 'UPDATE_CAPACITY', label: 'Update Capacity' },
              ]}
              placeholder="Select action"
            />
          </div>
          
          {action === 'UPDATE_CAPACITY' && type !== 'transport' && (
            <div className="space-y-2">
              <Label>{type === 'package' ? 'New Capacity' : 'New Total Rooms'}</Label>
              <Input 
                type="number" 
                min="0"
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                placeholder="Enter new capacity"
              />
            </div>
          )}
          
          {action === 'UPDATE_CAPACITY' && type === 'transport' && transportOptions.length > 0 && (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mt-2">
              <Label className="text-sm text-slate-500">Update capacity by transport option (leave blank to skip)</Label>
              {transportOptions.map((opt) => (
                <div key={opt.id} className="flex flex-col space-y-1">
                  <Label className="text-xs">{opt.title} <span className="text-slate-400">({opt.type === 'SHARED' ? `Seats: ${opt.capacity}` : 'Separate'})</span></Label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Enter new capacity"
                    value={optionCounts[opt.id] ?? ''}
                    onChange={(e) => setOptionCounts({ ...optionCounts, [opt.id]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !fromDate || !toDate}>
            {isSubmitting ? 'Applying...' : 'Apply Bulk Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}