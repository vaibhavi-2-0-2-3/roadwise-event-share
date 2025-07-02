
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EventChatProps {
  eventId: string;
}

export function EventChat({ eventId }: EventChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['event-messages', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            id,
            name,
            image_url
          )
        `)
        .eq('event_id', eventId)
        .is('receiver_id', null)
        .is('ride_id', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          event_id: eventId,
          content: content.trim()
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['event-messages', eventId] });
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
      .channel('event-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['event-messages', eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  if (isLoading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              {msg.profiles?.image_url ? (
                <img 
                  src={msg.profiles.image_url} 
                  alt={msg.profiles.name} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium text-blue-600">
                  {msg.profiles?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{msg.profiles?.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at!).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
