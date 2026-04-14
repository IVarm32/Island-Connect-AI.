import json
import os
import re

def main():
    if not os.path.exists('blog_posts.json'):
        print("Error: blog_posts.json not found")
        return

    with open('blog_posts.json', 'r') as f:
        posts = json.load(f)

    if not os.path.exists('index.html'):
        print("Error: index.html not found")
        return

    with open('index.html', 'r') as f:
        content = f.read()

    # Generate the grid HTML
    grid_html = ""
    for post in posts:
        # Use clean URL structure: slug/
        grid_html += f"""
        <div class="blog-card glass-panel reveal">
          <div class="blog-card-image">
            <img src="{post['image']}" alt="{post['title']}" loading="lazy">
            <span class="blog-card-badge">{post['category']}</span>
          </div>
          <div class="blog-card-content">
            <div class="blog-card-date">{post['date']}</div>
            <h3 class="blog-card-title">{post['title']}</h3>
            <p class="blog-card-excerpt">{post['excerpt']}</p>
            <a href="{post['id']}/" class="blog-card-link">
              Read More <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>"""

    # Replace the existing blog-grid content
    regex = r'(<div class="blog-grid">)(.*?)(?=\s*</div>\s*</div>\s*</section>)'
    new_content = re.sub(regex, r'\1' + grid_html, content, flags=re.DOTALL)

    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Updated index.html with new blog posts")

if __name__ == "__main__":
    main()
