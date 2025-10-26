from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class SustainabilityAction(models.Model):
    ACTION_TYPES = [
        ('transport', 'Sustainable Transport'),
        ('energy', 'Energy Conservation'),
        ('waste', 'Waste Reduction'),
        ('water', 'Water Conservation'),
        ('food', 'Sustainable Food'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sustainability_actions')
    action = models.CharField(max_length=200)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, default='other')
    date = models.DateField()
    points = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'action', 'date']  # Prevent duplicate actions per day

    def __str__(self):
        return f"{self.user.username} - {self.action} ({self.points} pts)"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='sustainability_profile')
    total_points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # New fields for GitHub and LeetCode integration
    github_username = models.CharField(max_length=100, blank=True, null=True)
    github_repo_url = models.URLField(blank=True, null=True)
    github_repo_count = models.IntegerField(default=0)
    github_points = models.IntegerField(default=0)  # 10 points per repo
    
    leetcode_username = models.CharField(max_length=100, blank=True, null=True)
    leetcode_solved = models.IntegerField(default=0)
    leetcode_points = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_points(self):
        """Calculate total points from all sources"""
        # Sustainability actions points
        sustainability_points = self.user.sustainability_actions.aggregate(
            total=models.Sum('points')
        )['total'] or 0
        
        # LeetCode points
        leetcode_points = self.leetcode_points
        
        # GitHub points (10 per repo)
        github_points = self.github_points
        
        # Total points
        self.total_points = sustainability_points + leetcode_points + github_points
        self.level = (self.total_points // 100) + 1  # Level up every 100 points
        self.save()

    def get_rank(self):
        """Get user's rank on the leaderboard"""
        return UserProfile.objects.filter(total_points__gt=self.total_points).count() + 1

    class Meta:
        ordering = ['-total_points']

    def __str__(self):
        return f"{self.user.username} - {self.total_points} points (Level {self.level})"


class LeetCodeSubmission(models.Model):
    """Track individual LeetCode problem submissions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leetcode_submissions')
    problem_name = models.CharField(max_length=200)
    problem_difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ])
    is_correct = models.BooleanField()  # True if solved correctly, False if wrong
    points_earned = models.IntegerField()  # +10 for correct, -5 for wrong
    submission_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-submission_date']
    
    def __str__(self):
        status = "Correct" if self.is_correct else "Wrong"
        return f"{self.user.username} - {self.problem_name} ({status})"


class GitHubRepository(models.Model):
    """Track user's GitHub repositories"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='github_repos')
    repo_name = models.CharField(max_length=200)
    repo_url = models.URLField()
    description = models.TextField(blank=True)
    stars = models.IntegerField(default=0)
    points_awarded = models.IntegerField(default=10)  # 10 points per repo
    added_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_date']
        unique_together = ['user', 'repo_name']  # Prevent duplicate repos
    
    def __str__(self):
        return f"{self.user.username} - {self.repo_name}"


class Challenge(models.Model):
    CHALLENGE_TYPES = [
        ('daily', 'Daily Challenge'),
        ('weekly', 'Weekly Challenge'),
        ('monthly', 'Monthly Challenge'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    points_reward = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    participants = models.ManyToManyField(User, through='ChallengeParticipation', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.challenge_type})"


class ChallengeParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'challenge']

    def __str__(self):
        status = "Completed" if self.completed else "In Progress"
        return f"{self.user.username} - {self.challenge.title} ({status})"
