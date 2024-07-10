from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'interests', views.InterestViewSet)
# router.register(r'messages', views.MessageViewSet)
router.register(r'messages', views.ChatMessageViewSet, basename='chatmessage')  # Use a unique basename
urlpatterns = [
    path('', include(router.urls)),
    path('sync-user/', views.sync_user),
    path('user-interests/', views.user_interests),
    path('matched-users/', views.matched_users),
    path('interests/', views.send_interest, name='send_interest'),
    path('user-profile/<str:uid>/', views.user_profile),
    path('interests/<str:pk>/accept/', views.InterestViewSet.as_view({'post': 'accept'}), name='accept_interest'),
    path('interests/<str:pk>/reject/', views.InterestViewSet.as_view({'post': 'reject'}), name='reject_interest'),
        path('chat-requests/', views.get_chat_requests, name='get_chat_requests'),
            path('chat-messages/<int:session_id>/', views.get_chat_messages, name='get_chat_messages'),
]