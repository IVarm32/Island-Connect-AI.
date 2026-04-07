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
            <a href="blog.{post['id']}.html" class="blog-card-link">
              Read More <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>"""

    # Replace the existing blog-grid content
    # Look for the grid container specifically
    start_marker = '<div class="blog-grid">'
    end_marker = '</div>' # First closing div after the grid

    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Could not find blog-grid start")
        return

    # Find the matching closing div for blog-grid
    # We'll look for the end of the section instead as it's more reliable in this structure
    section_end_marker = '</section>'
    grid_end_idx = content.find(section_end_marker, start_idx)

    # We want to keep the closing container div of the section
    # Let's find the second to last </div> before the section ends
    # Or just replace everything between <div class="blog-grid"> and the container close

    # A safer way: replace content of <div class="blog-grid">...</div>
    # Using regex with non-greedy match across lines
    pattern = r'(<div class="blog-grid">).*?(</div>\s*</div>\s*</section>)'
    # We need to make sure we don't catch too much or too little.

    # Let's try to find the end of the blog-grid div specifically.
    # It usually ends right before </div> </div> </section>

    # Simpler approach: find <div class="blog-grid"> and the next </div> that matches it.
    # Given the known structure from the grep:
    # <div class="blog-grid">
    #   ...
    # </div> <!-- this is the one we want to close -->
    # </div> <!-- container -->
    # </section>

    # We will use a regex that looks for the blog-grid and captures until the closing div
    # that is followed by the container closing div and the section close.

    # Based on:
    #    <div class="blog-grid">
    #     ...
    #    </div>
    #   </div>
    #  </section>

    regex = r'(<div class="blog-grid">)(.*?)(?=\s*</div>\s*</div>\s*</section>)'
    new_content = re.sub(regex, r'\1' + grid_html, content, flags=re.DOTALL)

    with open('index.html', 'w') as f:
        f.write(new_content)
    print("Updated index.html with new blog posts")

if __name__ == "__main__":
    main()
