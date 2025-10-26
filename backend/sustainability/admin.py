from django.contrib import admin
from .models import SustainabilityAction, UserProfile, Challenge, ChallengeParticipation, LeetCodeSubmission, GitHubRepository


@admin.register(SustainabilityAction)
class SustainabilityActionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'action_type', 'points', 'date', 'created_at']
    list_filter = ['action_type', 'date', 'created_at']
    search_fields = ['user__username', 'action', 'description']
    date_hierarchy = 'date'
    ordering = ['-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_points', 'level', 'github_repo_count', 'leetcode_solved', 'get_rank', 'created_at']
    search_fields = ['user__username', 'github_username', 'leetcode_username']
    ordering = ['-total_points']
    readonly_fields = ['total_points', 'level', 'github_points', 'leetcode_points', 'created_at', 'updated_at']
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'bio', 'avatar')
        }),
        ('Points & Level', {
            'fields': ('total_points', 'level')
        }),
        ('GitHub Integration', {
            'fields': ('github_username', 'github_repo_url', 'github_repo_count', 'github_points')
        }),
        ('LeetCode Integration', {
            'fields': ('leetcode_username', 'leetcode_solved', 'leetcode_points')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'challenge_type', 'points_reward', 'start_date', 'end_date', 'is_active']
    list_filter = ['challenge_type', 'is_active', 'start_date']
    search_fields = ['title', 'description']
    date_hierarchy = 'start_date'
    ordering = ['-created_at']


@admin.register(ChallengeParticipation)
class ChallengeParticipationAdmin(admin.ModelAdmin):
    list_display = ['user', 'challenge', 'completed', 'completion_date', 'created_at']
    list_filter = ['completed', 'challenge', 'created_at']
    search_fields = ['user__username', 'challenge__title']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(LeetCodeSubmission)
class LeetCodeSubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'problem_name', 'problem_difficulty', 'is_correct', 'points_earned', 'submission_date']
    list_filter = ['is_correct', 'problem_difficulty', 'submission_date']
    search_fields = ['user__username', 'problem_name']
    date_hierarchy = 'submission_date'
    ordering = ['-submission_date']
    readonly_fields = ['points_earned', 'submission_date']


@admin.register(GitHubRepository)
class GitHubRepositoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'repo_name', 'stars', 'points_awarded', 'added_date']
    list_filter = ['added_date']
    search_fields = ['user__username', 'repo_name', 'description']
    date_hierarchy = 'added_date'
    ordering = ['-added_date']
    readonly_fields = ['points_awarded', 'added_date']
