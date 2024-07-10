import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("chat", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'send_interest':
            await self.channel_layer.group_send(
                "chat",
                {
                    'type': 'chat.interest',
                    'receiver': text_data_json['receiver'],
                    'sender': text_data_json['sender']
                }
            )

    async def chat_interest(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_interest',
            'receiver': event['receiver'],
            'sender': event['sender']
        }))