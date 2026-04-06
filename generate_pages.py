import json
import os

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
        filename = f"blog.{post['id']}.html"

        # Calculate related posts (exclude current)
        related = [p for p in posts if p['id'] != post['id']][:3]
        related_html = ""
        for r in related:
            related_html += f"""
            <a href="blog.{r['id']}.html" class="related-card">
                <img src="{r['image']}" alt="{r['title']}" class="related-img">
                <div class="related-body">
                    <h4>{r['title']}</h4>
                </div>
            </a>
            """

        content = template
        content = content.replace('{{title}}', post['title'])
        content = content.replace('{{description}}', post['excerpt'][:160])
        content = content.replace('{{excerpt}}', post['excerpt'])
        content = content.replace('{{image}}', post['image'])
        content = content.replace('{{category}}', post['category'])
        content = content.replace('{{date}}', post['date'])
        content = content.replace('{{{content}}}', post['content'])
        content = content.replace('{{related_posts}}', related_html)

        with open(filename, 'w') as f:
            f.write(content)

        print(f"Generated {filename}")

if __name__ == "__main__":
    main()
