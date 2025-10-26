from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import SustainabilityAction, UserProfile, Challenge, ChallengeParticipation
from .serializers import (
    SustainabilityActionSerializer, UserProfileSerializer, 
    ChallengeSerializer, ChallengeParticipationSerializer,
    LeaderboardSerializer, UserSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SustainabilityActionViewSet(viewsets.ModelViewSet):
    serializer_class = SustainabilityActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return SustainabilityAction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        action = serializer.save(user=self.request.user)
        # Update user profile points
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        profile.update_points()

    def perform_update(self, serializer):
        action = serializer.save()
        profile = UserProfile.objects.get_or_create(user=self.request.user)[0]
        profile.update_points()

    def perform_destroy(self, instance):
        instance.delete()
        profile = UserProfile.objects.get_or_create(user=self.request.user)[0]
        profile.update_points()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def leaderboard(self, request):
        """Get top 10 users by points - PUBLIC endpoint"""
        profiles = UserProfile.objects.select_related('user').order_by('-total_points')[:10]
        data = []
        
        for idx, profile in enumerate(profiles):
            data.append({
                'rank': idx + 1,
                'username': profile.user.username,
                'total_points': profile.total_points,
                'level': profile.level,
                'avatar': profile.avatar.url if profile.avatar else None
            })
        
        serializer = LeaderboardSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's statistics"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.update_points()
        
        # Get monthly stats
        current_month = timezone.now().month
        current_year = timezone.now().year
        monthly_actions = request.user.sustainability_actions.filter(
            date__month=current_month,
            date__year=current_year
        ).count()
        
        monthly_points = request.user.sustainability_actions.filter(
            date__month=current_month,
            date__year=current_year
        ).aggregate(total=Sum('points'))['total'] or 0
        
        stats = {
            'total_points': profile.total_points,
            'level': profile.level,
            'rank': profile.get_rank(),
            'total_actions': request.user.sustainability_actions.count(),
            'monthly_actions': monthly_actions,
            'monthly_points': monthly_points,
            'profile': UserProfileSerializer(profile).data
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def recent_actions(self, request):
        """Get recent actions across all users (public feed)"""
        actions = SustainabilityAction.objects.select_related('user').order_by('-created_at')[:20]
        serializer = self.get_serializer(actions, many=True)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return UserProfile.objects.select_related('user').all()

    def get_object(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            if 'pk' in self.kwargs and self.kwargs['pk'] == 'me':
                profile, created = UserProfile.objects.get_or_create(user=self.request.user)
                return profile
        return super().get_object()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class ChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Challenge.objects.all()
        active_only = self.request.query_params.get('active', None)
        if active_only == 'true':
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a challenge"""
        challenge = self.get_object()
        participation, created = ChallengeParticipation.objects.get_or_create(
            user=request.user,
            challenge=challenge
        )
        
        if created:
            return Response({'message': 'Successfully joined the challenge!'})
        else:
            return Response(
                {'message': 'You are already participating in this challenge.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a challenge as completed"""
        challenge = self.get_object()
        try:
            participation = ChallengeParticipation.objects.get(
                user=request.user,
                challenge=challenge
            )
            if not participation.completed:
                participation.completed = True
                participation.completion_date = timezone.now()
                participation.save()
                
                # Award points
                action = SustainabilityAction.objects.create(
                    user=request.user,
                    action=f"Completed challenge: {challenge.title}",
                    action_type='other',
                    date=timezone.now().date(),
                    points=challenge.points_reward,
                    description=f"Challenge completion reward"
                )
                
                # Update user profile
                profile, created = UserProfile.objects.get_or_create(user=request.user)
                profile.update_points()
                
                return Response({'message': f'Challenge completed! You earned {challenge.points_reward} points!'})
            else:
                return Response(
                    {'message': 'You have already completed this challenge.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ChallengeParticipation.DoesNotExist:
            return Response(
                {'message': 'You must join the challenge first.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def my_challenges(self, request):
        """Get challenges the user is participating in"""
        participations = ChallengeParticipation.objects.filter(
            user=request.user
        ).select_related('challenge')
        
        data = []
        for participation in participations:
            challenge_data = ChallengeSerializer(participation.challenge, context={'request': request}).data
            challenge_data['participation_status'] = {
                'completed': participation.completed,
                'completion_date': participation.completion_date,
                'joined_date': participation.created_at
            }
            data.append(challenge_data)
        
        return Response(data)
