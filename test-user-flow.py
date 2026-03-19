import requests
import sys

BASE_URL = "http://localhost:3009"

def test_main_page():
    """Test if main page loads"""
    print("\n[TEST 1] Testing main page load...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            if "SEO Meta Preview" in response.text:
                print("[OK] Main page loads successfully")
                return True
            else:
                print("[FAIL] Page loaded but missing expected content")
                return False
        else:
            print(f"[FAIL] Page returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Failed to load page: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print("\n[TEST 2] Testing API endpoints...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/og?title=Test&score=85", timeout=5)
        if response.status_code == 200:
            print("[OK] /api/og endpoint works")
        else:
            print(f"[WARN] /api/og returned {response.status_code}")
    except Exception as e:
        print(f"[WARN] /api/og failed: {e}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/fetch-meta",
            json={"url": "https://example.com"},
            timeout=5
        )
        if response.status_code in [200, 400, 403]:
            print("[OK] /api/fetch-meta endpoint exists")
        else:
            print(f"[WARN] /api/fetch-meta returned {response.status_code}")
    except Exception as e:
        print(f"[WARN] /api/fetch-meta error: {e}")

def test_embed_page():
    """Test embed page"""
    print("\n[TEST 3] Testing embed page...")
    try:
        response = requests.get(f"{BASE_URL}/embed", timeout=5)
        if response.status_code == 200:
            print("[OK] Embed page loads")
            return True
        else:
            print(f"[FAIL] Embed page returned {response.status_code}")
    except Exception as e:
        print(f"[WARN] Embed page error: {e}")
    return False

def test_widget_page():
    """Test widget page"""
    print("\n[TEST 4] Testing widget page...")
    try:
        response = requests.get(f"{BASE_URL}/widget", timeout=5)
        if response.status_code == 200:
            print("[OK] Widget page loads")
            return True
        else:
            print(f"[WARN] Widget page returned {response.status_code}")
    except Exception as e:
        print(f"[WARN] Widget page error: {e}")
    return False

def check_page_content():
    """Check key content on main page"""
    print("\n[TEST 5] Checking key UI elements...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        content = response.text
        
        checks = [
            ("Title input", "title" in content.lower()),
            ("Description input", "description" in content.lower()),
            ("Preview/scoring features", "Google" in content or "score" in content.lower()),
            ("Dark mode support", "seo-theme" in content),
        ]
        
        for name, found in checks:
            status = "[OK]" if found else "[WARN]"
            print(f"{status} {name}")
            
    except Exception as e:
        print(f"[FAIL] Error checking content: {e}")

if __name__ == "__main__":
    print("="*50)
    print("TESTING SEO META PREVIEW & SCORER")
    print("="*50)
    
    test_main_page()
    test_api_endpoints()
    test_embed_page()
    test_widget_page()
    check_page_content()
    
    print("\n" + "="*50)
    print("BASIC TESTS COMPLETE")
    print("="*50)
