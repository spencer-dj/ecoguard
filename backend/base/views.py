from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Note
from .serializer import NoteSerializer, UserRegistrationSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            accesss_token = tokens['access']
            refresh_token = tokens['refresh']

            user = User.objects.get(username=request.data['username'])

            res = Response({
                'success': True,
                'username': user.username,
                'is_admin': user.is_superuser,
                'is_staff': user.is_staff
            })
            

            res.set_cookie(
                key='access_token',
                value=accesss_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )  
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )          
            return res

        except:
            return Response({'success': False})
        
class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)

            tokens = response.data
            access_token = tokens['access']

            res = Response()
            res.data = {'refreshed':True}

            res.set_cookie(
                key='access',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res
        
        except:
            return Response({'refreshed':False})

@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data  = {'success':True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res
    except:
        return Response({'success':False})
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'authenticated':True})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notes(request):
    user = request.user
    notes = Note.objects.filter(owner=user)
    serilizer = NoteSerializer(notes, many=True)
    return Response(serilizer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
