import json
from bs4 import BeautifulSoup

def main():
    with open('blog_posts.json', 'r') as f:
        posts = json.load(f)

    with open('index.html', 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    blog_grid = soup.find('div', class_='blog-grid')
    if not blog_grid:
        print("Error: .blog-grid not found in index.html")
        return

    blog_grid.clear()

    for post in posts:
        card = soup.new_tag('div', attrs={'class': 'blog-card glass-panel reveal'})

        # Image part
        img_container = soup.new_tag('div', attrs={'class': 'blog-card-image'})
        img = soup.new_tag('img', src=post['image'], alt=post['title'], loading="lazy")
        badge = soup.new_tag('span', attrs={'class': 'blog-card-badge'})
        badge.string = post['category']
        img_container.append(img)
        img_container.append(badge)

        # Content part
        content = soup.new_tag('div', attrs={'class': 'blog-card-content'})
        date = soup.new_tag('div', attrs={'class': 'blog-card-date'})
        date.string = post['date']
        title = soup.new_tag('h3', attrs={'class': 'blog-card-title'})
        title.string = post['title']
        excerpt = soup.new_tag('p', attrs={'class': 'blog-card-excerpt'})
        excerpt.string = post['excerpt']
        link = soup.new_tag('a', attrs={'class': 'blog-card-link', 'href': f"blog.{post['id']}.html"})
        link.string = "Read More "
        icon = soup.new_tag('i', attrs={'class': 'bi bi-arrow-right'})
        link.append(icon)

        content.append(date)
        content.append(title)
        content.append(excerpt)
        content.append(link)

        card.append(img_container)
        card.append(content)
        blog_grid.append(card)

    with open('index.html', 'w') as f:
        f.write(soup.prettify())
    print("Updated index.html with correct blog links.")

if __name__ == "__main__":
    main()
