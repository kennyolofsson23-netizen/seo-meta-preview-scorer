import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log("Loading page...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 15000 });
    
    // Get the page HTML structure
    const html = await page.evaluate(() => {
      return {
        h1: document.querySelector("h1")?.textContent,
        title: document.title,
        inputs: Array.from(document.querySelectorAll("input")).map(i => ({
          id: i.id,
          name: i.name,
          placeholder: i.placeholder,
          type: i.type
        })),
        textareas: Array.from(document.querySelectorAll("textarea")).map(t => ({
          id: t.id,
          name: t.name,
          placeholder: t.placeholder
        })),
        buttons: Array.from(document.querySelectorAll("button")).slice(0, 10).map(b => b.textContent?.trim()),
        bodyText: document.body.textContent?.substring(0, 200)
      };
    });
    
    console.log("Page Structure:");
    console.log(JSON.stringify(html, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();
