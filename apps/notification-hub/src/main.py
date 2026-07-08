import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import paho.mqtt.client as mqtt

app = FastAPI(title="Notification Hub")

BROKER_HOST = os.getenv("BROKER_HOST", "localhost")
BROKER_PORT = int(os.getenv("BROKER_PORT", 1883))

# Initialize MQTT Client
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "notification_hub_publisher")

class NotificationPayload(BaseModel):
    student_id: str
    message: str
    type: str = "info"

@app.on_event("startup")
async def startup_event():
    try:
        mqtt_client.connect(BROKER_HOST, BROKER_PORT, 60)
        mqtt_client.loop_start()
        print(f"Connected to MQTT broker at {BROKER_HOST}:{BROKER_PORT}")
    except Exception as e:
        print(f"Failed to connect to MQTT broker: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    mqtt_client.loop_stop()
    mqtt_client.disconnect()

@app.post("/notify")
async def send_notification(payload: NotificationPayload):
    topic = f"students/{payload.student_id}/alerts"
    message_str = json.dumps(payload.model_dump())
    
    # QoS 1 for at-least-once delivery as per architecture
    result = mqtt_client.publish(topic, message_str, qos=1)
    
    if result.rc != mqtt.MQTT_ERR_SUCCESS:
        raise HTTPException(status_code=500, detail="Failed to publish message to MQTT broker")
        
    return {"status": "sent", "topic": topic, "message": payload.message}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "notification-hub"}
