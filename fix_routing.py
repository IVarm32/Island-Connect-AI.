import json
import re
import os

# Create public directory if not exists
if not os.path.exists('public'):
    os.makedirs('public')

# Read the blog posts
with open('public/blog_posts.json', 'r') as f:
    posts = json.load(f)

# Use original blog.html as template
with open('blog.html', 'r') as f:
    orig_template = f.read()

for post in posts:
    post_id = post['id']
    filename = f'public/blog.{post_id}.html'

    template = orig_template

    # Pre-render the content for better SEO and to fix routing issues
    embedded_data = f'<script>window.POST_DATA = {json.dumps(post)};</script>'

    # Update script logic to use window.POST_DATA
    # Note: Use double braces for f-string or just concat to avoid bash/python interpolation issues
    script_content = """
    <script type="module">
        async function loadPost() {
            const post = window.POST_DATA;
            if (!post) {
                console.error("No post data found in window.POST_DATA");
                return;
            }

            document.title = post.title + " - Island Connect AI";
            document.getElementById('post-category').textContent = post.category;
            document.getElementById('post-title').textContent = post.title;
            document.getElementById('post-date').innerHTML = '<i class="bi bi-calendar3"></i> ' + post.date;
            document.getElementById('post-image').src = post.image;
            document.getElementById('post-image').alt = post.title;
            document.getElementById('post-content').innerHTML = post.content;

            const contentImages = document.querySelectorAll('#post-content img');
            contentImages.forEach(img => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '10px';
                img.style.margin = '20px 0';
            });
        }

        window.addEventListener('DOMContentLoaded', loadPost);
    </script>
"""

    # Find the old script and replace it
    # Find and replace the specific loadPost function in script
    template = re.sub(r'<script type="module">\s*async function loadPost.*?DOMContentLoaded.*?</script>', script_content, template, flags=re.DOTALL)

    # Insert embedded data
    template = template.replace('<head>', f'<head>\n    {embedded_data}')

    # Fix back button to use relative path for local testing and absolute for production
    template = template.replace('href="index.html#blog"', 'href="/index.html#blog"')

    with open(filename, 'w') as f:
        f.write(template)

# Also update index.html to use these new links
with open('index.html', 'r') as f:
    index_html = f.read()

for post in posts:
    index_html = index_html.replace(f'href="blog.html?post={post["id"]}"', f'href="/blog.{post["id"]}"')

with open('index.html', 'w') as f:
    f.write(index_html)
