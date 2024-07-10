import os
import firebase_admin
from firebase_admin import credentials, auth
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions

# Use an absolute path to the JSON file
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cred_path = os.path.join(base_dir, 'chatapp', 'reactchatapp-df8d3-firebase-adminsdk-xahma-ed5dc8fb05.json')

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header:
            return None
        id_token = auth_header.split(" ").pop()
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]
            user, created = User.objects.get_or_create(username=uid)
            return (user, None)
        except:
            raise exceptions.AuthenticationFailed('Invalid token')