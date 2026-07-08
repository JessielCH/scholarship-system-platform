'use client';

import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface NotificationPayload {
  student_id: string;
  message: string;
  type?: string;
}

export function useMqtt(studentId: string | null) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [messages, setMessages] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    if (!studentId) return;

    // Use environment variable or fallback to localhost for development
    // In production, this will point to the Edge node proxying port 9001
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://localhost:9001';
    
    const mqttClient = mqtt.connect(brokerUrl);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker via WebSockets');
      const topic = `students/${studentId}/alerts`;
      mqttClient.subscribe(topic, (err) => {
        if (!err) {
          console.log(`Subscribed to topic: ${topic}`);
        } else {
          console.error(`Failed to subscribe to ${topic}`, err);
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
      console.log(`Received message on ${topic}`);
      try {
        const payload: NotificationPayload = JSON.parse(message.toString());
        setMessages((prev) => [payload, ...prev]);
        
        // Push notification logic could go here, or handled by the UI layer using this hook
      } catch (err) {
        console.error('Failed to parse MQTT message', err);
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT connection error:', err);
    });

    setTimeout(() => {
      setClient(mqttClient);
    }, 0);

    return () => {
      mqttClient.end();
    };
  }, [studentId]);

  return { client, messages };
}
