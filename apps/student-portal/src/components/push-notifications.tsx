'use client';

import { useMqtt } from '@/hooks/useMqtt';
import { useEffect } from 'react';
import { useAuth } from '@/app/providers/auth-provider';
import { useQueryClient } from '@tanstack/react-query';

export function PushNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Connect to MQTT broker if the user is authenticated and is a student
  const { messages } = useMqtt(user?.sub ? user.sub : null);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[0];
      
      // Auto-refresh queries whenever a new message arrives
      queryClient.invalidateQueries({ queryKey: ['sagaStatus'] });
      queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
      
      // Use native browser notifications if allowed, or simple alert/toast
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Scholarship Update', {
            body: latestMessage.message,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Scholarship Update', {
                body: latestMessage.message,
                icon: '/favicon.ico'
              });
            }
          });
        } else {
          // Fallback to basic alert if permissions denied but we got a push
          alert(`New Update: ${latestMessage.message}`);
        }
      }
    }
  }, [messages]);

  // This is a headless component, it only triggers side effects
  return null;
}
