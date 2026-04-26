import json
import paho.mqtt.client as mqtt

latest_iot_data = {
    "N": 88.0,
    "P": 50.0,
    "K": 42.0,
    "temperature": 25.5,
    "humidity": 40.0,
    "ph": 6.8,
    "rainfall": 50.0,
    "tds": 150.0,
}

def on_connect(client, userdata, flags, reason_code, properties=None):
    try:
        client.subscribe("agritech/ps10/sensors")
        print("MQTT connected and subscribed to agritech/ps10/sensors")
    except Exception as e:
        print(f"MQTT subscribe failed: {e}")

def on_mqtt_message(client, userdata, msg):
    global latest_iot_data
    try:
        payload = json.loads(msg.payload.decode())
        if isinstance(payload, dict):
            latest_iot_data.update(payload)
    except Exception as e:
        print(f"MQTT parse error: {e}")

def start_mqtt():
    try:
        client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2, client_id="agritech_god_server")
        client.on_connect = on_connect
        client.on_message = on_mqtt_message
        client.connect("broker.hivemq.com", 1883, 60)
        client.loop_forever()
    except Exception as e:
        print(f"MQTT connection failed (running without MQTT): {e}")
