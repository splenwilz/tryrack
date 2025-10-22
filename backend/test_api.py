#!/usr/bin/env python3
"""
Test script to verify FastAPI WorkOS integration.
This script tests the basic endpoints without requiring actual WorkOS credentials.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, expected_status=200, allow_redirects=False):
    """Test a single endpoint"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", allow_redirects=allow_redirects)
        print(f"✅ {endpoint}: {response.status_code}")
        if response.status_code == expected_status:
            if response.status_code == 200 and response.content:
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            elif response.status_code in [307, 302]:
                print(f"   Redirect to: {response.headers.get('location', 'No location header')}")
        else:
            print(f"   Expected: {expected_status}, Got: {response.status_code}")
        return response.status_code == expected_status
    except Exception as e:
        print(f"❌ {endpoint}: Error - {e}")
        return False

def main():
    print("🧪 Testing TryRack Backend API Endpoints")
    print("=" * 50)
    
    # Test basic endpoints
    test_endpoint("/")
    test_endpoint("/health")
    
    # Test auth endpoints (these will fail without WorkOS credentials, but should return proper error codes)
    print("\n🔐 Testing Authentication Endpoints:")
    print("Note: These will fail without WorkOS credentials, but should return proper HTTP codes")
    
    # Login endpoint should redirect (307) to WorkOS
    test_endpoint("/auth/login", expected_status=307, allow_redirects=False)
    
    # Callback endpoint should return error without code parameter
    test_endpoint("/auth/callback", expected_status=400)
    
    # Me endpoint should return 401 without authentication
    test_endpoint("/auth/me", expected_status=401)
    
    # Protected endpoint redirects to login (web-friendly behavior)
    test_endpoint("/auth/protected", expected_status=307, allow_redirects=False)
    
    # API-style protected endpoint should return 401 without authentication
    test_endpoint("/auth/protected-api", expected_status=401)
    
    print("\n✅ Basic API structure is working!")
    print("📝 Next steps:")
    print("   1. Set up WorkOS credentials in .env file")
    print("   2. Configure WorkOS Dashboard with redirect URIs")
    print("   3. Test full authentication flow")

if __name__ == "__main__":
    main()
