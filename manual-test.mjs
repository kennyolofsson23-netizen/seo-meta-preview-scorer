import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function testApp() {
  console.log("=== MANUAL TESTING SEO META PREVIEW & SCORER ===\n");

  // Test 1: Check home page loads
  console.log("TEST 1: Check homepage");
  try {
    const res = await fetch(BASE_URL);
    const html = await res.text();

    if (html.includes("title") || html.includes("description")) {
      console.log("✓ Homepage loads with content");
    }

    // Check for key components
    const checks = [
      ["Title input", "input.*title|title.*input"],
      ["Description input", "description|meta description"],
      ["URL input", "url|URL"],
      ["Preview tabs", "tab|preview"],
      ["Score", "score|Score"],
      ["Theme toggle", "theme|Theme|dark|light"],
      ["Export", "export|download|screenshot|Download"],
      ["Embed", "embed|widget|Widget"],
      ["History", "history|History|recent|Recent"],
    ];

    console.log("\nChecking for component keywords in HTML:");
    checks.forEach(([name, pattern]) => {
      const regex = new RegExp(pattern, "i");
      if (regex.test(html)) {
        console.log(`✓ ${name}`);
      } else {
        console.log(`✗ ${name}`);
      }
    });
  } catch (e) {
    console.log("✗ Failed to load homepage:", e.message);
  }

  // Test 2: Check embed page
  console.log("\n\nTEST 2: Check embed page");
  try {
    const res = await fetch(`${BASE_URL}/embed`);
    if (res.ok) {
      console.log("✓ Embed page exists and is accessible");
    } else {
      console.log("✗ Embed page returned:", res.status);
    }
  } catch (e) {
    console.log("⚠ Could not reach embed page:", e.message);
  }

  // Test 3: Check widget page
  console.log("\nTEST 3: Check widget page");
  try {
    const res = await fetch(`${BASE_URL}/widget`);
    if (res.ok) {
      console.log("✓ Widget page exists and is accessible");
    } else {
      console.log("✗ Widget page returned:", res.status);
    }
  } catch (e) {
    console.log("⚠ Could not reach widget page:", e.message);
  }

  // Test 4: Check API endpoints
  console.log("\nTEST 4: Check API endpoints");
  const endpoints = ["/api/og", "/api/fetch-meta"];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { method: "GET" });
      console.log(`✓ ${endpoint} responds (status: ${res.status})`);
    } catch (e) {
      console.log(`⚠ ${endpoint} error: ${e.message}`);
    }
  }
}

testApp().catch(console.error);
