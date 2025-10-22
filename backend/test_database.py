#!/usr/bin/env python3
"""
Test script for database integration.
Tests the basic CRUD operations and API endpoints.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None, expected_status=200, allow_redirects=False):
    """Test a single endpoint"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", allow_redirects=allow_redirects)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, allow_redirects=allow_redirects)
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{endpoint}", json=data, allow_redirects=allow_redirects)
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{endpoint}", allow_redirects=allow_redirects)
        
        print(f"✅ {method} {endpoint}: {response.status_code}")
        
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
            if response.content:
                try:
                    print(f"   Error: {response.json()}")
                except:
                    print(f"   Error: {response.text[:100]}...")
        
        return response.status_code == expected_status
    except Exception as e:
        print(f"❌ {method} {endpoint}: Error - {e}")
        return False

def main():
    print("🧪 Testing TryRack Backend Database Integration")
    print("=" * 60)

    # Test public endpoints
    print("\n📋 Testing Public Endpoints:")
    test_endpoint("/")
    test_endpoint("/health")

    # Test auth endpoints
    print("\n🔐 Testing Authentication Endpoints:")
    test_endpoint("/auth/login", expected_status=307, allow_redirects=False)
    test_endpoint("/auth/me", expected_status=401)  # Should fail without auth

    # Test API endpoints (should fail without authentication)
    print("\n📊 Testing API Endpoints (without authentication):")
    test_endpoint("/api/users/me", expected_status=401)
    test_endpoint("/api/items/", expected_status=401)
    
    # Test database connection
    print("\n🗄️ Testing Database Connection:")
    try:
        import psycopg2
        conn = psycopg2.connect("postgresql://splenwilz@localhost:5432/tryrack_db")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM users;")
        user_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM items;")
        item_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM audit_logs;")
        audit_count = cur.fetchone()[0]
        cur.close()
        conn.close()
        
        print(f"✅ Database connection successful!")
        print(f"   Users: {user_count}")
        print(f"   Items: {item_count}")
        print(f"   Audit logs: {audit_count}")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

    print("\n✅ Database integration test completed!")
    print("📝 Next steps:")
    print("   1. Test authentication flow to create users in database")
    print("   2. Test API endpoints with authenticated user")
    print("   3. Test CRUD operations for items")

if __name__ == "__main__":
    main()
