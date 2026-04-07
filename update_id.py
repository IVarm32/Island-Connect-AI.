import json

with open('manual_posts.json', 'r') as f:
    posts = json.load(f)

for post in posts:
    if "Jamaican Tourism Recovery" in post['title']:
        post['id'] = "jamaican-tourism-recovery"
        # Also update button text to match the image exactly
        post['content'] = post['content'].replace("Book Your Consultation Today", "Book a Consultation Now")

with open('manual_posts.json', 'w') as f:
    json.dump(posts, f, indent=4)
