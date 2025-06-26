import subprocess
subprocess.run(["playwright", "install", "chromium"])

from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from datetime import datetime, timezone
import re
import time
import schedule

def connect_to_mongo():
    client = MongoClient("mongodb+srv://Nikita:nikita26@scrape.5nxr3wz.mongodb.net/?retryWrites=true&w=majority&appName=Scrape")
    return client["Product_data"]

def extract_amazon_products(page, query):
    products = []
    items = page.locator("div[data-component-type='s-search-result']")
    count = items.count()
    for i in range(count):
        try:
            item = items.nth(i)
            title = item.locator("h2 span").inner_text()
            price = item.locator("span.a-price-whole").first.inner_text()
            rating = item.locator("span.a-icon-alt").first.inner_text()
            link = item.locator("a").first.get_attribute("href")
            image = item.locator("img").first.get_attribute("src")
            reviews = item.locator("span.a-size-base").first
            reviews_text = reviews.inner_text() if reviews.count() > 0 else "0"

            memory_match = re.search(r'(\d+\s?(GB|TB))', title, re.I)
            rating_value = re.findall(r"\d+\.\d+", rating)

            products.append({
                "Category": query,
                "Product Name": title,
                "Memory": memory_match.group(1) if memory_match else "N/A",
                "Price": price,
                "Ratings": float(rating_value[0]) if rating_value else "N/A",
                "Reviews": reviews_text,
                "Links": f"https://www.amazon.in{link}" if link else "N/A",
                "Image": image,
                "Source": "Amazon",
                "Timestamp": datetime.now(timezone.utc)
            })
        except Exception:
            continue
    return products

def extract_flipkart_products(page, query):
    products = []
    items = page.locator("div[data-id]")
    count = items.count()
    for i in range(count):
        try:
            item = items.nth(i)
            title = item.locator("._4rR01T, .KzDlHZ").first.inner_text()
            price = item.locator("._30jeq3, .Nx9bqj").first.inner_text()
            rating = item.locator("._3LWZlK, .XQDdHH").first.inner_text()
            reviews = item.locator("._2_R_DZ, .Wphh3N").first.inner_text()
            link = item.locator("a").first.get_attribute("href")
            image = item.locator("img").first.get_attribute("src")

            memory_match = re.search(r'(\d+\s?(GB|TB))', title, re.I)
            rating_value = re.findall(r"\d+\.\d+", rating)

            products.append({
                "Category": query,
                "Product Name": title,
                "Memory": memory_match.group(1) if memory_match else "N/A",
                "Price": price,
                "Ratings": float(rating_value[0]) if rating_value else "N/A",
                "Reviews": reviews,
                "Links": f"https://www.flipkart.com{link}" if link else "N/A",
                "Image": image,
                "Source": "Flipkart",
                "Timestamp": datetime.now(timezone.utc)
            })
        except Exception:
            continue
    return products

def insert_data(data, platform):
    db = connect_to_mongo()
    collection = db["product_info"]

    for record in data:
        new_price_entry = {
            "Price": record["Price"],
            "Timestamp": record["Timestamp"]
        }

        existing = collection.find_one({
            "Links": record["Links"],
            "Source": record["Source"]
        })

        if existing:
            last_price = existing.get("Latest Price", "")
            if last_price != record["Price"]:
                collection.update_one(
                    {"_id": existing["_id"]},
                    {
                        "$set": {
                            "Latest Price": record["Price"],
                            "Category": record["Category"],
                            "Image": record["Image"],
                            "Memory": record["Memory"]
                        },
                        "$push": {"Price History": new_price_entry}
                    }
                )
            else:
                collection.update_one(
                    {"_id": existing["_id"]},
                    {
                        "$set": {
                            "Category": record["Category"],
                            "Image": record["Image"],
                            "Memory": record["Memory"]
                        }
                    }
                )
        else:
            record["Price History"] = [new_price_entry]
            record["Latest Price"] = record["Price"]
            collection.insert_one(record)

def scrape_all(categories, pages=1):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114 Safari/537.36")
        page = context.new_page()

        for query in categories:
            for page_num in range(1, pages + 1):
                # Amazon
                print(f"Scraping Amazon: {query}, page {page_num}")
                amazon_url = f"https://www.amazon.in/s?k={query}&page={page_num}"
                page.goto(amazon_url, timeout=60000)
                try:
                    page.wait_for_selector("div[data-component-type='s-search-result']", timeout=15000)
                    amazon_data = extract_amazon_products(page, query)
                    insert_data(amazon_data, "Amazon")
                except Exception as e:
                    print(f"❌ Amazon error: {e}")

                # Flipkart
                print(f"Scraping Flipkart: {query}, page {page_num}")
                flipkart_url = f"https://www.flipkart.com/search?q={query}&page={page_num}"
                page.goto(flipkart_url, timeout=60000)
                try:
                    if page.is_visible("._2KpZ6l._2doB4z"):
                        page.click("._2KpZ6l._2doB4z")

                    page.wait_for_selector("div[data-id]", timeout=15000)
                    flipkart_data = extract_flipkart_products(page, query)
                    insert_data(flipkart_data, "Flipkart")
                except Exception as e:
                    print(f"❌ Flipkart error: {e}")

                time.sleep(3)

        browser.close()

# 🕒 Daily schedule trigger
def job():
    categories = ['macbook', 'samsung phone','Samsung TV', 'sony TV','Asus Laptop','asus laptop','iPhone','xiaomi phone']
    scrape_all(categories, pages=5)

schedule.every().day.at("00:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)
