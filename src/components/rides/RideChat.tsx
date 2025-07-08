
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RideChatProps {
  rideId: string;
  driverId: string;
}

export function RideChat({ rideId, driverId }: RideChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['ride-messages', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey (
            id,
            name,
            image_url
          )
        `)
        .eq('ride_id', rideId)
        .is('event_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');

      // Determine receiver (if user is driver, receiver is null for group chat, otherwise receiver is driver)
      const receiverId = user.id === driverId ? null : driverId;

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          ride_id: rideId,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['ride-messages', rideId] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel('ride-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ride_id=eq.${rideId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ride-messages', rideId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId, queryClient]);

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${msg.sender_id === user?.id
              ? 'bg-gradient-to-br from-blue-500 to-fuchsia-600 text-white rounded-br-none'
              : 'bg-muted text-foreground border border-border rounded-bl-none'
              }`}>
              {msg.sender_id !== user?.id && (
                <p className="text-xs font-medium mb-1">{msg.sender_profile?.name}</p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p className={`text-[10px] mt-2 italic ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-muted-foreground'
                }`}>

                {new Date(msg.created_at!).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-black rounded-none px-4 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:border-black placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

    </div>
  );
}
