"""
Seed data script for Project SPD.
Run with: python manage.py shell < seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User, UserRole
from apps.blogs.models import Blog, Category, Tag, BlogStatus

print("Creating seed data...")

# Create Admin User
admin, created = User.objects.get_or_create(
    email='admin@example.com',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': UserRole.ADMIN,
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
        'is_verified': True,
        'position': 'System Administrator',
        'bio': 'Platform administrator with full access.',
    }
)
if created:
    admin.set_password('demo1234')
    admin.save()
    print(f"Created admin user: {admin.email}")
else:
    print(f"Admin user already exists: {admin.email}")

# Create Staff User
staff, created = User.objects.get_or_create(
    email='staff@example.com',
    defaults={
        'username': 'staff',
        'first_name': 'John',
        'last_name': 'Developer',
        'role': UserRole.STAFF,
        'is_staff': False,
        'is_active': True,
        'is_verified': True,
        'position': 'Senior Developer',
        'bio': 'Full-stack developer with 10+ years of experience.',
    }
)
if created:
    staff.set_password('demo1234')
    staff.save()
    print(f"Created staff user: {staff.email}")
else:
    print(f"Staff user already exists: {staff.email}")

# Create another Staff User
staff2, created = User.objects.get_or_create(
    email='jane@example.com',
    defaults={
        'username': 'jane',
        'first_name': 'Jane',
        'last_name': 'Designer',
        'role': UserRole.STAFF,
        'is_staff': False,
        'is_active': True,
        'is_verified': True,
        'position': 'UI/UX Designer',
        'bio': 'Creative designer passionate about user experience.',
    }
)
if created:
    staff2.set_password('demo1234')
    staff2.save()
    print(f"Created staff user: {staff2.email}")

# Create Customer User
customer, created = User.objects.get_or_create(
    email='customer@example.com',
    defaults={
        'username': 'customer',
        'first_name': 'Demo',
        'last_name': 'Customer',
        'role': UserRole.CUSTOMER,
        'is_active': True,
    }
)
if created:
    customer.set_password('demo1234')
    customer.save()
    print(f"Created customer user: {customer.email}")

# Create Categories
categories_data = [
    {'name': 'Technology', 'description': 'Latest tech news and tutorials'},
    {'name': 'Development', 'description': 'Software development articles'},
    {'name': 'Design', 'description': 'UI/UX and graphic design content'},
    {'name': 'Business', 'description': 'Business and entrepreneurship'},
    {'name': 'Tutorial', 'description': 'Step-by-step guides'},
]

categories = []
for cat_data in categories_data:
    cat, created = Category.objects.get_or_create(
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )
    categories.append(cat)
    if created:
        print(f"Created category: {cat.name}")

# Create Tags
tags_data = ['Python', 'Django', 'React', 'JavaScript', 'CSS', 'API', 'Database', 'DevOps', 'Security', 'Performance']
tags = []
for tag_name in tags_data:
    tag, created = Tag.objects.get_or_create(name=tag_name)
    tags.append(tag)
    if created:
        print(f"Created tag: {tag.name}")

# Create Blogs
blogs_data = [
    {
        'title': 'Getting Started with Django REST Framework',
        'excerpt': 'Learn how to build powerful APIs with Django REST Framework in this comprehensive guide.',
        'content': '''
<h2>Introduction</h2>
<p>Django REST Framework (DRF) is a powerful toolkit for building Web APIs in Django. It provides a flexible, easy-to-use way to create RESTful APIs.</p>

<h2>Setting Up</h2>
<p>First, install DRF using pip:</p>
<pre><code>pip install djangorestframework</code></pre>

<h2>Creating Your First API</h2>
<p>Let's create a simple API endpoint. First, create a serializer:</p>
<pre><code>from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'</code></pre>

<h2>Conclusion</h2>
<p>DRF makes it easy to build robust APIs. Start experimenting and build something amazing!</p>
        ''',
        'author': staff,
        'category': categories[1],  # Development
        'status': BlogStatus.PUBLISHED,
        'is_featured': True,
    },
    {
        'title': 'React Best Practices in 2024',
        'excerpt': 'Discover the latest React patterns and best practices for building modern web applications.',
        'content': '''
<h2>Modern React Development</h2>
<p>React continues to evolve, and staying up-to-date with best practices is crucial for building maintainable applications.</p>

<h2>Use Functional Components</h2>
<p>Functional components with hooks are now the standard. They're simpler, more testable, and easier to understand.</p>

<h2>State Management</h2>
<p>For small to medium apps, React's built-in useState and useContext are often sufficient. For larger apps, consider Redux Toolkit or Zustand.</p>

<h2>Performance Tips</h2>
<ul>
<li>Use React.memo for expensive components</li>
<li>Implement code splitting with React.lazy</li>
<li>Avoid inline functions in render</li>
</ul>
        ''',
        'author': staff,
        'category': categories[1],  # Development
        'status': BlogStatus.PUBLISHED,
        'is_featured': True,
    },
    {
        'title': 'Designing for User Experience',
        'excerpt': 'Essential principles for creating intuitive and delightful user experiences.',
        'content': '''
<h2>UX Design Fundamentals</h2>
<p>Great UX design is about understanding your users and creating experiences that feel natural and effortless.</p>

<h2>Key Principles</h2>
<h3>1. User-Centered Design</h3>
<p>Always start with user research. Understand their needs, pain points, and goals.</p>

<h3>2. Simplicity</h3>
<p>Keep interfaces clean and focused. Remove unnecessary elements.</p>

<h3>3. Consistency</h3>
<p>Maintain consistent patterns throughout your application.</p>

<h2>Testing Your Designs</h2>
<p>Always test with real users. Usability testing reveals issues you might never find on your own.</p>
        ''',
        'author': staff2,
        'category': categories[2],  # Design
        'status': BlogStatus.PUBLISHED,
        'is_featured': False,
    },
    {
        'title': 'Cloud Computing Fundamentals',
        'excerpt': 'Understanding cloud computing concepts and how to leverage them for your business.',
        'content': '''
<h2>What is Cloud Computing?</h2>
<p>Cloud computing provides on-demand computing resources over the internet. It includes services like servers, storage, databases, and software.</p>

<h2>Types of Cloud Services</h2>
<ul>
<li><strong>IaaS</strong> - Infrastructure as a Service</li>
<li><strong>PaaS</strong> - Platform as a Service</li>
<li><strong>SaaS</strong> - Software as a Service</li>
</ul>

<h2>Benefits</h2>
<p>Cloud computing offers scalability, cost savings, and flexibility. You only pay for what you use.</p>
        ''',
        'author': staff,
        'category': categories[0],  # Technology
        'status': BlogStatus.PUBLISHED,
        'is_featured': False,
    },
    {
        'title': 'Introduction to API Security',
        'excerpt': 'Learn how to secure your APIs against common vulnerabilities and attacks.',
        'content': '''
<h2>Why API Security Matters</h2>
<p>APIs are the backbone of modern applications. Securing them is critical to protect sensitive data.</p>

<h2>Common Vulnerabilities</h2>
<ul>
<li>Broken Authentication</li>
<li>Injection Attacks</li>
<li>Excessive Data Exposure</li>
<li>Rate Limiting Issues</li>
</ul>

<h2>Best Practices</h2>
<p>Implement proper authentication, validate all inputs, and use HTTPS for all communications.</p>
        ''',
        'author': staff,
        'category': categories[1],  # Development
        'status': BlogStatus.DRAFT,
        'is_featured': False,
    },
]

for blog_data in blogs_data:
    blog, created = Blog.objects.get_or_create(
        title=blog_data['title'],
        defaults={
            'excerpt': blog_data['excerpt'],
            'content': blog_data['content'],
            'author': blog_data['author'],
            'category': blog_data['category'],
            'status': blog_data['status'],
            'is_featured': blog_data['is_featured'],
            'view_count': 100 if blog_data['is_featured'] else 50,
        }
    )
    if created:
        # Add some tags
        blog.tags.add(tags[0], tags[1], tags[2])
        print(f"Created blog: {blog.title}")

print("\nSeed data created successfully!")
print("\nDemo Accounts:")
print("Admin: admin@example.com / demo1234")
print("Staff: staff@example.com / demo1234")
print("Staff: jane@example.com / demo1234")
print("Customer: customer@example.com / demo1234")
