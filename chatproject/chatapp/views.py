from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import ChatSession, UserProfile, Interest, Message
from .serializers import UserSerializer, UserProfileSerializer, InterestSerializer, MessageSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_requests(request):
    interests = Interest.objects.filter(receiver=request.user, status='pending')
    serializer = InterestSerializer(interests, many=True)
    print("Serialized interests:", serializer.data)  # For debugging
    return Response(serializer.data)

# views.py

class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver != request.user:
            return Response({"detail": "You can't accept this interest."}, status=status.HTTP_403_FORBIDDEN)
        interest.status = 'accepted'
        interest.save()

        # Create a chat session
        chat_session = ChatSession.objects.create()
        chat_session.participants.add(interest.sender, interest.receiver)
        chat_session.save()

        return Response({"detail": "Interest accepted.", "chat_session_id": chat_session.id})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver != request.user:
            return Response({"detail": "You can't reject this interest."}, status=status.HTTP_403_FORBIDDEN)
        interest.status = 'rejected'
        interest.save()
        return Response({"detail": "Interest rejected."})


 


# views.py

class ChatMessageViewSet(viewsets.ModelViewSet):  # Renamed the viewset
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_interest(request):
    print(f"Received data: {request.data}")  # Log received data
    serializer = InterestSerializer(data=request.data)
    if serializer.is_valid():
        receiver_id = serializer.validated_data.get('receiver').id

        if request.user.id == receiver_id:
            return Response({'detail': 'You cannot send an interest to yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        interest = serializer.save(sender=request.user)
        print(f"Interest saved: {interest.id}, Receiver: {interest.receiver.username}")  # Log saved interest
        
        # Send WebSocket message
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "chat",
            {
                "type": "new_interest",
                "receiver": interest.receiver.id,
                "sender": request.user.id
            }
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(f"Serializer errors: {serializer.errors}")  # Log serializer errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def sync_user(request):
    uid = request.data.get('uid')
    email = request.data.get('email')
    name = request.data.get('name')

    user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
    
    user_profile, created = UserProfile.objects.get_or_create(user=user)
    user_profile.name = name
    user_profile.save()

    return Response({'status': 'success'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_interests(request):
    try:
        print(f"User: {request.user.username}")
        profile = UserProfile.objects.get(user=request.user)
        if request.method == 'GET':
            return Response({'interests': profile.interests})
        elif request.method == 'POST':
            interest = request.data['interest']
            print(f"Adding interest: {interest}")
            if interest not in profile.interests:
                profile.interests.append(interest)
                profile.save()
            return Response({'status': 'success'})
    except Exception as e:
        print(f"Error in user_interests: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matched_users(request):
    interest = request.query_params.get('interest')
    if not interest:
        return Response({'error': 'Interest parameter is required'}, status=400)

    user_profiles = UserProfile.objects.all()
    matched_users = [
        profile.user for profile in user_profiles
        if interest in profile.interests and profile.user != request.user
    ]

    serializer = UserSerializer(matched_users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request, uid):
    try:
        user = User.objects.get(username=uid)  # Assuming the uid is stored as the username
        return Response({
            'username': user.username,
            'email': user.email
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

# views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, session_id):
    try:
        chat_session = ChatSession.objects.get(id=session_id)
        if request.user not in chat_session.participants.all():
            return Response({"detail": "You are not a participant of this chat session."}, status=status.HTTP_403_FORBIDDEN)
        
        messages = Message.objects.filter(chat_session=chat_session).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except ChatSession.DoesNotExist:
        return Response({"detail": "Chat session not found."}, status=status.HTTP_404_NOT_FOUND)