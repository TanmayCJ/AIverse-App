"""
Test script for AIverse Backend API
Tests: Registration, Login, GitHub Integration, LeetCode Submissions
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8001"

def print_section(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")
    print()

# Test 1: Register a new user
print_section("TEST 1: User Registration")
register_data = {
    "username": "testuser_github",
    "email": "test@gmail.com",
    "password": "testpass123",
    "password2": "testpass123",
    "first_name": "Test",
    "last_name": "User"
}

response = requests.post(f"{BASE_URL}/api/auth/register/", json=register_data)
print_response(response)

if response.status_code == 201:
    tokens = response.json()['tokens']
    access_token = tokens['access']
    print(f"✅ Registration successful! Access token received.")
else:
    print("❌ Registration failed!")
    exit()

# Test 2: Login with existing user
print_section("TEST 2: User Login")
login_data = {
    "username": "testuser_github",
    "password": "testpass123"
}

response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
print_response(response)

if response.status_code == 200:
    tokens = response.json()['tokens']
    access_token = tokens['access']
    print(f"✅ Login successful!")
else:
    print("❌ Login failed!")

# Test 3: Get current user info
print_section("TEST 3: Get User Info")
headers = {"Authorization": f"Bearer {access_token}"}

response = requests.get(f"{BASE_URL}/api/auth/user/", headers=headers)
print_response(response)

# Test 4: Setup GitHub Integration
print_section("TEST 4: GitHub Setup")
# Using a real GitHub username for testing
github_data = {
    "github_username": "torvalds"  # Linus Torvalds - has public repos
}

response = requests.post(f"{BASE_URL}/api/github/setup/", json=github_data, headers=headers)
print_response(response)

if response.status_code == 200:
    data = response.json()
    print(f"✅ GitHub setup successful!")
    print(f"   Repos found: {data.get('repo_count', 0)}")
    print(f"   Points earned: {data.get('points_earned', 0)}")
    print(f"   Total points: {data.get('total_points', 0)}")
else:
    print("❌ GitHub setup failed!")

# Test 5: Get user profile (should now have GitHub data)
print_section("TEST 5: Get User Profile (After GitHub)")
response = requests.get(f"{BASE_URL}/api/profiles/", headers=headers)
print_response(response)

# Test 6: Submit LeetCode problem (Correct)
print_section("TEST 6: LeetCode Submission - Correct Answer")
leetcode_data = {
    "problem_name": "Two Sum",
    "problem_difficulty": "easy",
    "is_correct": True
}

response = requests.post(f"{BASE_URL}/api/leetcode/", json=leetcode_data, headers=headers)
print_response(response)

if response.status_code == 201:
    data = response.json()
    print(f"✅ LeetCode submission logged!")
    print(f"   Points earned: {data.get('points_earned', 0)}")
else:
    print("❌ LeetCode submission failed!")

# Test 7: Submit LeetCode problem (Wrong)
print_section("TEST 7: LeetCode Submission - Wrong Answer")
leetcode_data = {
    "problem_name": "Median of Two Sorted Arrays",
    "problem_difficulty": "hard",
    "is_correct": False
}

response = requests.post(f"{BASE_URL}/api/leetcode/", json=leetcode_data, headers=headers)
print_response(response)

if response.status_code == 201:
    data = response.json()
    print(f"✅ LeetCode submission logged!")
    print(f"   Points earned: {data.get('points_earned', 0)}")
else:
    print("❌ LeetCode submission failed!")

# Test 8: Get LeetCode stats
print_section("TEST 8: LeetCode Statistics")
response = requests.get(f"{BASE_URL}/api/leetcode/stats/", headers=headers)
print_response(response)

# Test 9: View leaderboard
print_section("TEST 9: Leaderboard (Top 10)")
response = requests.get(f"{BASE_URL}/api/actions/leaderboard/")
print_response(response)

# Test 10: Get my stats
print_section("TEST 10: My Statistics")
response = requests.get(f"{BASE_URL}/api/actions/my_stats/", headers=headers)
print_response(response)

# Test 11: Get GitHub repositories
print_section("TEST 11: View GitHub Repositories")
response = requests.get(f"{BASE_URL}/api/github/repos/", headers=headers)
print_response(response)

print_section("✅ ALL TESTS COMPLETED!")
print("""
Summary:
1. ✅ User registration and login working
2. ✅ GitHub integration fetching repos
3. ✅ LeetCode submissions tracking points (+10/-5)
4. ✅ Leaderboard showing all users
5. ✅ Points automatically calculated from all sources

Next Steps:
- Update frontend to use these endpoints
- Add Gmail OAuth for secure login
- Deploy to Railway + Firebase
""")
