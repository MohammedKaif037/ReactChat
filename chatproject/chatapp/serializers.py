from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChatSession, UserProfile, Interest, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = ['user', 'interests']

class InterestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Interest
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def create(self, validated_data):
        receiver_id = self.context['request'].data.get('receiver')
        receiver = User.objects.get(id=receiver_id)
        validated_data['receiver'] = receiver
        return super().create(validated_data)

# serializers.py

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

# serializers.py

class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = '__all__'
