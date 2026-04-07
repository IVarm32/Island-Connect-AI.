import urllib.request
import json
import re
import os
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
        self.depth = 0
        self.tags_to_ignore = ['nav', 'footer', 'header', 'script', 'style', 'aside', 'button', 'form', 'input']
        self.ignore_depth = 0
        self.img_count = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if not self.in_content:
            classes = attrs_dict.get('class', '')
            if any(c in classes for c in ['prose', 'post-content', 'entry-content', 'article-content']) or tag in ['article', 'main']:
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

            if tag == 'img':
                self.img_count += 1
                if self.img_count == 1:
                    return

            self.depth += 1

            allowed_attrs = ['src', 'alt', 'href', 'target']
            clean_attrs = []
            for k, v in attrs:
                if k in allowed_attrs:
                    clean_attrs.append((k, v))

            attr_str = "".join([f' {k}="{v}"' for k, v in clean_attrs])
            self.content_html += f"<{tag}{attr_str}>"

    def handle_endtag(self, tag):
        if self.in_content:
            if self.ignore_depth > 0:
                self.ignore_depth -= 1
                return

            self.depth -= 1
            if self.depth == 0:
                self.in_content = False
            else:
                if tag not in ['img', 'br', 'hr']:
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
    manual_posts = []
    manual_ids = []
    if os.path.exists('manual_posts.json'):
        with open('manual_posts.json', 'r') as f:
            manual_posts = json.load(f)
            manual_ids = [p['id'] for p in manual_posts]

    base_url = "https://blog-islandconnect.pages.dev/"
    print(f"Scraping {base_url}...")

    index_html = get_html(base_url)
    if not index_html:
        all_posts = manual_posts
    else:
        index_parser = BlogIndexParser(base_url)
        index_parser.feed(index_html)
        scraped_posts = index_parser.posts

        final_scraped = []
        for post in scraped_posts:
            # Skip if ID conflicts with manual post OR if it's the scraped version of Tourism Recovery (we might have manual one)
            if post['id'] in manual_ids or post['id'] == 'jamaican-tourism-recovery':
                continue

            print(f"Scraping post: {post['title']} at {post['url']}")
            post_html = get_html(post['url'])
            if post_html:
                post_parser = BlogPostParser()
                post_parser.feed(post_html)
                content = post_parser.content_html
                content = re.sub(r'<p>\s*</p>', '', content)
                content = re.sub(r'<div>\s*</div>', '', content)
                post["content"] = content

            if not post["content"]:
                post["content"] = "<p>Content currently being optimized.</p>"

            final_scraped.append(post)

        all_posts = manual_posts + final_scraped
        all_posts = all_posts[:6]

    with open('blog_posts.json', 'w') as f:
        json.dump(all_posts, f, indent=4)
    print(f"Saved {len(all_posts)} posts to blog_posts.json")

if __name__ == "__main__":
    main()
