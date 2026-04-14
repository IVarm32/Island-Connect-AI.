import json
import os
import re

def main():
    if not os.path.exists('blog_posts.json'):
        print("Error: blog_posts.json not found.")
        return

    with open('blog_posts.json', 'r') as f:
        posts = json.load(f)

    if not os.path.exists('blog.html'):
        print("Error: blog.html template not found.")
        return

    with open('blog.html', 'r') as f:
        template = f.read()

    for post in posts:
        slug = post['id']
        directory = slug

        if not os.path.exists(directory):
            os.makedirs(directory)

        filename = os.path.join(directory, "index.html")

        # Related posts
        related = [p for p in posts if p['id'] != post['id']][:3]
        related_html = ""
        for r in related:
            img_path = r['image']
            if not img_path.startswith('http'):
                img_path = '../' + img_path
            related_html += f"""
            <a href="../{r['id']}/" class="related-card">
                <img src="{img_path}" alt="{r['title']}" class="related-img">
                <div class="related-body">
                    <h4>{r['title']}</h4>
                </div>
            </a>
            """

        # Markup
        schema_html = f'<script type="application/ld+json">{json.dumps(post.get("schema_markup", {}))}</script>'
        faq_html = f'<script type="application/ld+json">{json.dumps(post.get("faq_markup", {}))}</script>'

        content = template

        content = content.replace('{{title}}', post['title'])
        content = content.replace('{{description}}', post.get('meta_description', post['excerpt'][:160]))
        content = content.replace('{{excerpt}}', post['excerpt'])

        # Image
        post_image = post['image']
        if not post_image.startswith('http'):
            post_image = '../' + post_image
        content = content.replace('{{image}}', post_image)

        content = content.replace('{{category}}', post['category'])
        content = content.replace('{{date}}', post['date'])
        content = content.replace('{{{content}}}', post['content'])
        content = content.replace('{{related_posts}}', related_html)
        content = content.replace('{{{schema_markup}}}', schema_html)
        content = content.replace('{{{faq_markup}}}', faq_html)

        # Universal relative path fixes
        # Look for src="..." and href="..." and inject ../ if it doesn't have http, /, or already have ../
        def fix_path(match):
            attr = match.group(1)
            path = match.group(2)
            if path.startswith(('http', '/', '#', 'mailto:', 'tel:', '../')):
                return f'{attr}="{path}"'
            return f'{attr}="../{path}"'

        content = re.sub(r'(href|src)="([^"]*)"', fix_path, content)

        # Specialized fixes for anchor links to index.html sections
        content = content.replace('href="../index.html#', 'href="../#')
        content = content.replace('href="../index.html"', 'href="../"')

        with open(filename, 'w') as f:
            f.write(content)

        print(f"Generated {filename}")

if __name__ == "__main__":
    main()
