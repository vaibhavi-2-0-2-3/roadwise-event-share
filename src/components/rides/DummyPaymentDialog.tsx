import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DummyPaymentDialogProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DummyPaymentDialog({ bookingId, open, onOpenChange }: DummyPaymentDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('✅ Payment successful!');
      queryClient.invalidateQueries({ queryKey: ['ride-details'] });
      queryClient.invalidateQueries({ queryKey: ['user-booking'] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error('❌ Failed to update payment status');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulated Payment</DialogTitle>
        </DialogHeader>
        <p>This is a dummy payment. Click below to simulate success.</p>
        <Button
          className="mt-4 w-full bg-green-600 text-white"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Processing...' : 'Pay Now ₹100'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
