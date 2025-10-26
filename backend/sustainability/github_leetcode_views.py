import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Sum, Count
from .models import LeetCodeSubmission, GitHubRepository, UserProfile
from .serializers import (
    LeetCodeSubmissionSerializer,
    GitHubRepositorySerializer,
    GitHubSetupSerializer
)


class GitHubIntegrationView(APIView):
    """Handle GitHub integration during login"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Set up GitHub integration for user
        Expected data: {github_username, github_repo_url (optional)}
        """
        serializer = GitHubSetupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        github_username = serializer.validated_data['github_username']
        
        try:
            # Fetch user's repositories from GitHub API
            response = requests.get(
                f'https://api.github.com/users/{github_username}/repos',
                headers={'Accept': 'application/vnd.github.v3+json'},
                timeout=10
            )
            
            if response.status_code != 200:
                return Response({
                    'error': 'Failed to fetch GitHub repositories. Please check the username.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            repos = response.json()
            
            # Update user profile
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile.github_username = github_username
            profile.github_repo_count = len(repos)
            profile.github_points = len(repos) * 10  # 10 points per repo
            profile.save()
            
            # Save individual repositories
            for repo in repos:
                GitHubRepository.objects.get_or_create(
                    user=request.user,
                    repo_name=repo['name'],
                    defaults={
                        'repo_url': repo['html_url'],
                        'description': repo['description'] or '',
                        'stars': repo['stargazers_count'],
                        'points_awarded': 10
                    }
                )
            
            # Update total points
            profile.update_points()
            
            return Response({
                'message': 'GitHub integration successful',
                'github_username': github_username,
                'repo_count': len(repos),
                'points_earned': len(repos) * 10,
                'total_points': profile.total_points
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            return Response({
                'error': 'Failed to connect to GitHub API. Please try again later.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeetCodeSubmissionViewSet(viewsets.ModelViewSet):
    """Handle LeetCode problem submissions"""
    serializer_class = LeetCodeSubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LeetCodeSubmission.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's LeetCode statistics"""
        submissions = request.user.leetcode_submissions
        
        stats = {
            'total_submissions': submissions.count(),
            'correct_submissions': submissions.filter(is_correct=True).count(),
            'wrong_submissions': submissions.filter(is_correct=False).count(),
            'total_points': submissions.aggregate(total=Sum('points_earned'))['total'] or 0,
            'easy_solved': submissions.filter(is_correct=True, problem_difficulty='easy').count(),
            'medium_solved': submissions.filter(is_correct=True, problem_difficulty='medium').count(),
            'hard_solved': submissions.filter(is_correct=True, problem_difficulty='hard').count(),
        }
        
        return Response(stats)


class GitHubRepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    """View user's GitHub repositories"""
    serializer_class = GitHubRepositorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GitHubRepository.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Refresh GitHub repositories from API"""
        profile = request.user.sustainability_profile
        
        if not profile.github_username:
            return Response({
                'error': 'GitHub username not set. Please complete GitHub setup first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            response = requests.get(
                f'https://api.github.com/users/{profile.github_username}/repos',
                headers={'Accept': 'application/vnd.github.v3+json'},
                timeout=10
            )
            
            if response.status_code != 200:
                return Response({
                    'error': 'Failed to fetch GitHub repositories.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            repos = response.json()
            
            # Update existing repos and add new ones
            for repo in repos:
                GitHubRepository.objects.update_or_create(
                    user=request.user,
                    repo_name=repo['name'],
                    defaults={
                        'repo_url': repo['html_url'],
                        'description': repo['description'] or '',
                        'stars': repo['stargazers_count'],
                        'points_awarded': 10
                    }
                )
            
            # Update profile
            profile.github_repo_count = len(repos)
            profile.github_points = len(repos) * 10
            profile.update_points()
            
            return Response({
                'message': 'GitHub repositories refreshed successfully',
                'repo_count': len(repos),
                'points': len(repos) * 10
            })
            
        except requests.exceptions.RequestException:
            return Response({
                'error': 'Failed to connect to GitHub API.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
