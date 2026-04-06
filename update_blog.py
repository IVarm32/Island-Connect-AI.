import urllib.request
import json
import re
from html.parser import HTMLParser
from urllib.parse import urljoin

class BlogIndexParser(HTMLParser):
    def __init__(self, base_url):
        super().__init__()
        self.base_url = base_url
        self.posts = []
        self.current_post = None
        self.in_article = False
        self.in_title = False
        self.in_excerpt = False
        self.capture_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'article':
            if len(self.posts) < 6:
                self.in_article = True
                self.current_post = {
                    "id": "", "title": "", "url": "", "image": "",
                    "excerpt": "", "content": "", "date": "February 21, 2025",
                    "category": "Industry Insights"
                }

        if self.in_article:
            if tag in ['h2', 'h3']:
                self.in_title = True
                self.capture_text = ""
            elif tag == 'p' and not self.current_post["excerpt"]:
                self.in_excerpt = True
                self.capture_text = ""
            elif tag == 'a' and 'href' in attrs_dict and not self.current_post["url"]:
                self.current_post["url"] = urljoin(self.base_url, attrs_dict['href'])
            elif tag == 'img' and 'src' in attrs_dict and not self.current_post["image"]:
                self.current_post["image"] = urljoin(self.base_url, attrs_dict['src'])

    def handle_endtag(self, tag):
        if tag == 'article' and self.in_article:
            if self.current_post["title"]:
                self.current_post["id"] = slugify(self.current_post["title"])
                self.posts.append(self.current_post)
            self.in_article = False
            self.current_post = None

        if self.in_title:
            if tag in ['h2', 'h3']:
                self.current_post["title"] = self.capture_text.strip()
                self.in_title = False

        if self.in_excerpt:
            if tag == 'p':
                self.current_post["excerpt"] = self.capture_text.strip()
                self.in_excerpt = False

    def handle_data(self, data):
        if self.in_title or self.in_excerpt:
            self.capture_text += data

class BlogPostParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.content_html = ""
        self.in_content = False
        self.content_started = False
        self.depth = 0
        self.tags_to_ignore = ['nav', 'footer', 'header', 'script', 'style']
        self.ignore_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        # Identify content container
        if not self.in_content:
            classes = attrs_dict.get('class', '')
            if 'prose' in classes or 'content' in classes or tag == 'article' or tag == 'main':
                self.in_content = True
                self.depth = 1
                return

        if self.in_content:
            if tag in self.tags_to_ignore:
                self.ignore_depth += 1
                return

            if self.ignore_depth > 0:
                self.ignore_depth += 1
                return

            self.depth += 1
            attr_str = "".join([f' {k}="{v}"' for k, v in attrs])
            self.content_html += f"<{tag}{attr_str}>"

    def handle_endtag(self, tag):
        if self.in_content:
            if self.ignore_depth > 0:
                self.ignore_depth -= 1
                return

            if tag in self.tags_to_ignore:
                # Should not happen with logic above but for safety
                return

            self.depth -= 1
            if self.depth == 0:
                self.in_content = False
            else:
                self.content_html += f"</{tag}>"

    def handle_data(self, data):
        if self.in_content and self.ignore_depth == 0:
            self.content_html += data

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def get_html(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    base_url = "https://blog-islandconnect.pages.dev/"
    print(f"Scraping {base_url}...")

    index_html = get_html(base_url)
    if not index_html:
        return

    index_parser = BlogIndexParser(base_url)
    index_parser.feed(index_html)
    posts = index_parser.posts

    for post in posts:
        print(f"Scraping post: {post['title']} at {post['url']}")
        post_html = get_html(post['url'])
        if post_html:
            post_parser = BlogPostParser()
            post_parser.feed(post_html)
            post["content"] = post_parser.content_html

        if not post["content"]:
            post["content"] = "<p>Content not found.</p>"

    # Content Injection Logic (Same as before)
    smart_tourism_content = """
<p>Jamaica’s tourism sector is currently at a pivotal crossroads. As one of the most desirable destinations globally, the challenge remains: how do we scale hospitality while maintaining the authentic island charm? The answer lies in <strong>Smart Tourism</strong>—the strategic integration of AI, IoT, and high-speed connectivity to personalize the guest experience.</p>
<h2 class="text-2xl font-bold text-white mt-8 mb-4">1. AI-Driven Personalization</h2>
<p class="mb-6">Imagine a guest arriving at a resort in Montego Bay. Before they even step into the lobby, the resort’s AI system has already coordinated their room temperature, prepared a localized digital itinerary based on their previous preferences, and alerted the concierge to their arrival.</p>
<h2 class="text-2xl font-bold text-white mt-8 mb-4">2. The Role of Island Connect</h2>
<p class="mb-6">At Island Connect, we are facilitating this transition by providing the underlying infrastructure. From low-latency satellite links to custom software portals, we are bridging the gap.</p>
<div class="bg-jamaica-green/10 border-l-4 border-jamaica-green p-6 my-8 rounded-r-xl">
    <h4 class="text-xl font-bold text-white mb-3">References:</h4>
    <ul class="space-y-2">
        <li>• <a href="https://www.visitjamaica.com/digital-transformation" class="text-jamaica-gold hover:underline">Jamaica Ministry of Tourism Roadmap</a></li>
    </ul>
</div>
"""

    for post in posts:
        if "Smart Tourism" in post['title'] and "Strategies" not in post['title']:
            post['content'] = smart_tourism_content
        elif "property matching" in post['content'].lower() and "Property Matching" not in post['title']:
             if "Revolution" in post['title']:
                 post['content'] = "<p>Jamaica is standing at the forefront of a digital revolution...</p>"
             elif "Luxury" in post['title']:
                 post['content'] = "<p>Luxury real estate in Jamaica is being redefined...</p>"
             elif "Recovery" in post['title']:
                 post['content'] = "<p>Post-pandemic recovery in Jamaica has been accelerated by AI...</p>"

    with open('blog_posts.json', 'w') as f:
        json.dump(posts, f, indent=4)
    print(f"Saved {len(posts)} posts to blog_posts.json")

if __name__ == "__main__":
    main()
