from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .github_leetcode_views import GitHubIntegrationView, LeetCodeSubmissionViewSet, GitHubRepositoryViewSet

router = DefaultRouter()
router.register(r'actions', views.SustainabilityActionViewSet, basename='sustainability-actions')
router.register(r'profiles', views.UserProfileViewSet, basename='user-profiles')
router.register(r'challenges', views.ChallengeViewSet, basename='challenges')
router.register(r'leetcode', LeetCodeSubmissionViewSet, basename='leetcode')
router.register(r'github/repos', GitHubRepositoryViewSet, basename='github-repos')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/github/setup/', GitHubIntegrationView.as_view(), name='github-setup'),
]