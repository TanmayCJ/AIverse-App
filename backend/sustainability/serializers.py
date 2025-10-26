from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import SustainabilityAction, UserProfile, Challenge, ChallengeParticipation, LeetCodeSubmission, GitHubRepository


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    rank = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'total_points', 'level', 'bio', 'avatar', 'rank',
            'github_username', 'github_repo_url', 'github_repo_count', 'github_points',
            'leetcode_username', 'leetcode_solved', 'leetcode_points',
            'created_at'
        ]
        read_only_fields = ['id', 'total_points', 'level', 'github_points', 'leetcode_points', 'created_at']
    
    def get_rank(self, obj):
        return obj.get_rank()


class SustainabilityActionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = SustainabilityAction
        fields = [
            'id', 'user', 'action', 'action_type', 'action_type_display', 
            'date', 'points', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_points(self, value):
        if value < 1 or value > 100:
            raise serializers.ValidationError("Points must be between 1 and 100.")
        return value


class ChallengeSerializer(serializers.ModelSerializer):
    participants_count = serializers.SerializerMethodField()
    is_participating = serializers.SerializerMethodField()
    
    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'description', 'challenge_type', 'points_reward',
            'start_date', 'end_date', 'is_active', 'participants_count', 
            'is_participating', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    
    def get_is_participating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(id=request.user.id).exists()
        return False


class ChallengeParticipationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    challenge = ChallengeSerializer(read_only=True)
    
    class Meta:
        model = ChallengeParticipation
        fields = ['id', 'user', 'challenge', 'completed', 'completion_date', 'created_at']
        read_only_fields = ['id', 'user', 'completion_date', 'created_at']


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data"""
    rank = serializers.IntegerField()
    username = serializers.CharField()
    total_points = serializers.IntegerField()
    level = serializers.IntegerField()
    avatar = serializers.ImageField(allow_null=True)


class LeetCodeSubmissionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = LeetCodeSubmission
        fields = ['id', 'user', 'problem_name', 'problem_difficulty', 'is_correct', 'points_earned', 'submission_date']
        read_only_fields = ['id', 'user', 'points_earned', 'submission_date']
    
    def create(self, validated_data):
        # Automatically calculate points based on correctness
        validated_data['points_earned'] = 10 if validated_data['is_correct'] else -5
        submission = LeetCodeSubmission.objects.create(**validated_data)
        
        # Update user profile points
        profile = submission.user.sustainability_profile
        profile.leetcode_solved = submission.user.leetcode_submissions.filter(is_correct=True).count()
        profile.leetcode_points = submission.user.leetcode_submissions.aggregate(
            total=models.Sum('points_earned')
        )['total'] or 0
        profile.update_points()
        
        return submission


class GitHubRepositorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GitHubRepository
        fields = ['id', 'user', 'repo_name', 'repo_url', 'description', 'stars', 'points_awarded', 'added_date']
        read_only_fields = ['id', 'user', 'points_awarded', 'added_date']


class GitHubSetupSerializer(serializers.Serializer):
    """Serializer for initial GitHub setup during login"""
    github_username = serializers.CharField(max_length=100)
    github_repo_url = serializers.URLField(required=False, allow_blank=True)