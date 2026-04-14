import json
import os
import shutil

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

    for i, post in enumerate(posts):
        slug = post['id']
        directory = slug

        # Create directory for Clean URL (Option B)
        if not os.path.exists(directory):
            os.makedirs(directory)

        filename = os.path.join(directory, "index.html")

        # Calculate related posts (exclude current)
        # We use relative links: ../slug/
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

        # Handle SEO and Schema
        schema_html = ""
        if 'schema_markup' in post:
            schema_html = f'<script type="application/ld+json">{json.dumps(post["schema_markup"])}</script>'

        faq_html = ""
        if 'faq_markup' in post:
            faq_html = f'<script type="application/ld+json">{json.dumps(post["faq_markup"])}</script>'

        content = template

        content = content.replace('{{title}}', post['title'])
        content = content.replace('{{description}}', post.get('meta_description', post['excerpt'][:160]))
        content = content.replace('{{excerpt}}', post['excerpt'])

        # Adjust post image path if it's local
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

        # Fix navigation and assets in the header/body
        content = content.replace('href="index.html#', 'href="../#')
        content = content.replace('href="index.html"', 'href="../"')
        content = content.replace('href="blog.html"', 'href="../blog.html"')
        content = content.replace('href="private-policy.html"', 'href="../private-policy.html"')
        content = content.replace('href="nav_styles.css"', 'href="../nav_styles.css"')
        content = content.replace('href="index.css"', 'href="../index.css"')
        content = content.replace('src="js/', 'src="../js/')
        content = content.replace('href="css/', 'href="../css/')
        content = content.replace('href="favicon.svg"', 'href="../favicon.svg"')
        content = content.replace('href="images/icon-192.png"', 'href="../images/icon-192.png"')

        # Fix Author icon path
        content = content.replace('src="favicon.svg"', 'src="../favicon.svg"')

        # Also fix any internal links that might use blog.slug.html
        for p in posts:
            content = content.replace(f'href="blog.{p["id"]}.html"', f'href="../{p["id"]}/"')

        with open(filename, 'w') as f:
            f.write(content)

        print(f"Generated {filename}")

if __name__ == "__main__":
    main()
