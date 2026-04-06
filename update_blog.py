import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def scrape_blog():
    base_url = "https://blog-islandconnect.pages.dev/"
    print(f"Scraping {base_url}...")
    try:
        response = requests.get(base_url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"Error scraping blog index: {e}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    # Looking for article cards - based on common patterns
    articles = soup.find_all('article', limit=6)
    posts = []

    for article in articles:
        title_tag = article.find('h2') or article.find('h3')
        link_tag = article.find('a')
        img_tag = article.find('img')
        excerpt_tag = article.find('p')

        if not title_tag or not link_tag:
            continue

        title = title_tag.get_text(strip=True)
        post_url = urljoin(base_url, link_tag['href'])

        print(f"Scraping post: {title} at {post_url}")

        try:
            post_res = requests.get(post_url, timeout=10)
            post_res.raise_for_status()
            post_soup = BeautifulSoup(post_res.text, 'html.parser')

            # Find the main content
            # Try a few common selectors for content
            content_div = post_soup.find('div', class_='prose') or \
                          post_soup.find('div', class_='content') or \
                          post_soup.find('article') or \
                          post_soup.find('main')

            if content_div:
                # Clean up some elements we might not want (nav, footer, ads)
                for tag in content_div.find_all(['nav', 'footer', 'header', 'script', 'style']):
                    tag.decompose()

                content_html = "".join([str(c) for c in content_div.contents])
            else:
                content_html = "<p>Content not found.</p>"
        except Exception as e:
            print(f"Error scraping post {title}: {e}")
            content_html = "<p>Error loading content.</p>"

        posts.append({
            "id": slugify(title),
            "title": title,
            "url": post_url,
            "image": urljoin(base_url, img_tag['src']) if img_tag and 'src' in img_tag.attrs else "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
            "excerpt": excerpt_tag.get_text(strip=True) if excerpt_tag else "",
            "content": content_html,
            "date": "February 21, 2025",
            "category": "Industry Insights"
        })

    return posts

def main():
    posts = scrape_blog()

    # User's specific "Smart Tourism" content
    smart_tourism_content = """
<p>Jamaica’s tourism sector is currently at a pivotal crossroads. As one of the most desirable destinations globally, the challenge remains: how do we scale hospitality while maintaining the authentic island charm? The answer lies in <strong>Smart Tourism</strong>—the strategic integration of AI, IoT, and high-speed connectivity to personalize the guest experience.</p>

<h2 class="text-2xl font-bold text-white mt-8 mb-4">1. AI-Driven Personalization</h2>
<p class="mb-6">Imagine a guest arriving at a resort in Montego Bay. Before they even step into the lobby, the resort’s AI system has already coordinated their room temperature, prepared a localized digital itinerary based on their previous preferences, and alerted the concierge to their arrival. This isn't science fiction; it's the new standard for luxury.</p>

<h2 class="text-2xl font-bold text-white mt-8 mb-4">2. The Role of Island Connect</h2>
<p class="mb-6">At Island Connect, we are facilitating this transition by providing the underlying infrastructure. From low-latency satellite links for remote eco-lodges to custom software portals that allow tourists to book local artisans and tours seamlessly, we are bridging the gap between traditional tourism and the digital nomad era.</p>

<h2 class="text-2xl font-bold text-white mt-8 mb-4">3. Sustainable Growth</h2>
<p class="mb-6">Technology also plays a key role in sustainability. Smart grids and IoT sensors help resorts reduce water and energy waste by up to 30%, ensuring that Jamaica's natural beauty is preserved for generations to come.</p>

<div class="bg-jamaica-green/10 border-l-4 border-jamaica-green p-6 my-8 rounded-r-xl">
    <h4 class="text-xl font-bold text-white mb-3">References & Further Reading:</h4>
    <ul class="space-y-2">
        <li>• <a href="https://www.visitjamaica.com/digital-transformation" class="text-jamaica-gold hover:underline">Jamaica Ministry of Tourism: Digital Transformation Roadmap</a></li>
        <li>• <a href="#" class="text-jamaica-gold hover:underline">Caribbean Journal: How AI is Changing Resort Operations (2024)</a></li>
        <li>• <a href="#" class="text-jamaica-gold hover:underline">Island Connect Whitepaper: Infrastructure for Smart Islands</a></li>
    </ul>
</div>
"""

    # Fix duplicated content if found
    for post in posts:
        if "Smart Tourism" in post['title'] and "Strategies" not in post['title']:
            post['content'] = smart_tourism_content
            print(f"Injected specific content for Smart Tourism post: {post['title']}")

        # Check if it has the "AI-Powered Matching" boilerplate and replace with more relevant content if title is different
        if "property matching" in post['content'].lower() and "Property Matching" not in post['title']:
             # Create better specific content based on title
             if "Revolution" in post['title']:
                 post['content'] = """
                 <p>Jamaica is standing at the forefront of a digital revolution. The integration of Artificial Intelligence across various sectors is not just a trend; it's a fundamental shift in how the island operates and competes on a global stage.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">The Economic Impact</h2>
                 <p class="mb-6">AI-driven automation is expected to contribute significantly to the local GDP by 2030. From agriculture to finance, the efficiencies gained are unprecedented.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">Education and Upskilling</h2>
                 <p class="mb-6">The revolution requires a workforce ready to handle new technologies. Programs are already in place to train the next generation of Jamaican developers and AI ethics specialists.</p>
                 """
             elif "Luxury" in post['title']:
                 post['content'] = """
                 <p>Luxury real estate in Jamaica is being redefined. Discerning buyers are no longer just looking for breathtaking views; they're looking for intelligent homes that anticipate their needs.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">Next-Gen Amenities</h2>
                 <p class="mb-6">Smart villas now feature integrated AI systems that manage everything from security and climate control to personalized entertainment and concierge services.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">Seamless Ownership</h2>
                 <p class="mb-6">For international buyers, AI simplifies the management of luxury properties from afar, providing real-time data and peace of mind.</p>
                 """
             elif "Recovery" in post['title']:
                 post['content'] = """
                 <p>Post-pandemic recovery in Jamaica has been accelerated by the adoption of smart technologies. The tourism sector, in particular, has bounced back stronger than ever.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">Data-Driven Resilience</h2>
                 <p class="mb-6">By analyzing global travel trends and consumer behavior, Jamaican businesses have been able to pivot quickly and capture new markets.</p>
                 <h2 class="text-2xl font-bold text-white mt-8 mb-4">Efficiency in Operations</h2>
                 <p class="mb-6">Reduced overhead through smart resource management has allowed local entrepreneurs to reinvest in their services and employee welfare.</p>
                 """

    with open('blog_posts.json', 'w') as f:
        json.dump(posts, f, indent=4)
    print(f"Saved {len(posts)} posts to blog_posts.json")

if __name__ == "__main__":
    main()
