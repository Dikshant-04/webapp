# 📘 Project SPD - Administrative Documentation & System Guide

**Last Updated:** January 22, 2026  
**Version:** 1.0  
**System Status:** Production Ready

---

## 📋 Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Data Storage & Database](#2-data-storage--database)
3. [User Authentication & Management](#3-user-authentication--management)
4. [Contact Form Submissions](#4-contact-form-submissions)
5. [Blog System](#5-blog-system)
6. [Password Reset Flow](#6-password-reset-flow)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Frontend Routes](#8-frontend-routes)
9. [Environment Configuration](#9-environment-configuration)
10. [Common Troubleshooting](#10-common-troubleshooting)
11. [Security Implementation](#11-security-implementation)
12. [Deployment Guide](#12-deployment-guide)

---

## 1. System Architecture Overview

### Technology Stack

**Backend:**
- Django 5.0.1 - Python web framework
- Django REST Framework 3.14.0 - API development
- SQLite / PostgreSQL - Database (configurable)
- JWT (Simple JWT) - Authentication
- Python 3.11+

**Frontend:**
- React 18 - UI library
- Vite - Build tool & dev server
- React Router 6 - Client-side routing
- Axios - HTTP client
- Tailwind CSS - Styling

### Directory Structure

```
webapp/
├── backend/                    # Django backend application
│   ├── apps/
│   │   ├── users/             # User management & authentication
│   │   ├── blogs/             # Blog management system
│   │   └── analytics/         # Analytics & contact submissions
│   ├── config/                # Django settings & URLs
│   ├── db.sqlite3             # SQLite database file
│   ├── manage.py              # Django management script
│   └── seed_data.py           # Database seeding script
│
└── frontend/                  # React frontend application
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Page components
    │   ├── services/          # API service layer
    │   └── context/           # React Context providers
    └── package.json
```

---

## 2. Data Storage & Database

### Database Location

**Primary Database:** `/backend/db.sqlite3`

- **Type:** SQLite3 (default for development)
- **Production Alternative:** PostgreSQL (configured via environment variables)
- **Access:** Direct file access or Django ORM

### Database Schema

#### Core Tables

1. **users_user** - Main user accounts
   - Fields: id, email, username, password (hashed), first_name, last_name, role, is_active, etc.
   - Indexes: email, username, role
   
2. **users_userprofile** - Extended user information
   - Fields: user_id, website, linkedin, twitter, github, skills, department, etc.
   
3. **blogs_blog** - Blog posts
   - Fields: id, title, slug, content, author_id, category_id, status, view_count, etc.
   - Indexes: slug, status, author, published_at
   
4. **blogs_category** - Blog categories
   - Fields: id, name, slug, description
   
5. **blogs_tag** - Blog tags
   - Fields: id, name, slug
   
6. **analytics_contactsubmission** - Contact form submissions
   - Fields: id, name, email, phone, subject, message, is_read, is_replied, created_at, etc.
   
7. **analytics_blogview** - Blog view tracking
   - Fields: id, blog_id, user_id, ip_address, device_type, viewed_at, etc.

### Direct Database Access

Using Python:
```python
cd backend
python manage.py dbshell
```

Using SQL directly:
```bash
sqlite3 backend/db.sqlite3
.tables                    # List all tables
.schema users_user         # Show table structure
SELECT * FROM users_user;  # Query users
```

### Database Backups

**Location:** Backup the `db.sqlite3` file regularly

```bash
# Create backup
cp backend/db.sqlite3 backend/db_backup_$(date +%Y%m%d).sqlite3

# Restore from backup
cp backend/db_backup_YYYYMMDD.sqlite3 backend/db.sqlite3
```

---

## 3. User Authentication & Management

### User Roles

The system supports three distinct user roles:

1. **Customer** (`customer`)
   - Default role for new registrations
   - Can view public content
   - Limited access

2. **Staff** (`staff`)
   - Content creators
   - Can manage their own blogs
   - Can view/edit their own profile

3. **Admin** (`admin`)
   - Full system access
   - User management
   - Content moderation
   - Analytics access

### Demo Accounts

| Role     | Email                   | Password  | Username  |
|----------|-------------------------|-----------|-----------|
| Admin    | admin@example.com       | demo1234  | admin     |
| Staff    | staff@example.com       | demo1234  | staff     |
| Staff    | jane@example.com        | demo1234  | jane      |
| Customer | customer@example.com    | demo1234  | customer  |

### Where User Data Lives

**Registered Users Storage:**
- **Database Table:** `users_user`
- **Location:** `backend/db.sqlite3`

**How to View All Registered Users:**

**Method 1: Django Admin Panel**
```
URL: http://localhost:8000/admin/
Login: admin@example.com / demo1234
Navigate to: Users → Users
```

**Method 2: API Endpoint (Admin Only)**
```
GET /api/users/admin/users/
Headers: Authorization: Bearer <admin_access_token>
```

**Method 3: Direct Database Query**
```python
cd backend
python manage.py shell

from apps.users.models import User
users = User.objects.all()
for user in users:
    print(f"{user.email} - {user.role} - Active: {user.is_active}")
```

**Method 4: SQL Query**
```sql
sqlite3 backend/db.sqlite3
SELECT id, email, username, role, is_active, date_joined FROM users_user;
```

### Login Records & Authentication

**Access Tokens:** JWT tokens stored in localStorage (frontend)
- **Location:** Browser localStorage
- **Keys:** `access_token`, `refresh_token`, `user`

**Last Login Tracking:**
- **Field:** `users_user.last_login`
- **Updated:** Automatically on each successful login

**Query Recent Logins:**
```sql
SELECT email, username, last_login 
FROM users_user 
WHERE last_login IS NOT NULL 
ORDER BY last_login DESC 
LIMIT 20;
```

### Password Security

**Hashing Algorithm:** PBKDF2-SHA256 (Django default)
- **Format:** `pbkdf2_sha256$<iterations>$<salt>$<hash>`
- **Storage:** `users_user.password` field
- **Validation:** Django's built-in password validators

**Password Requirements:**
- Minimum 8 characters
- Cannot be too similar to user information
- Cannot be a commonly used password
- Cannot be entirely numeric

---

## 4. Contact Form Submissions

### Where Contact Messages Are Stored

**Database Table:** `analytics_contactsubmission`
**Location:** `backend/db.sqlite3`

**Table Structure:**
```sql
CREATE TABLE analytics_contactsubmission (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(254),
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    is_replied BOOLEAN DEFAULT 0,
    replied_at DATETIME,
    replied_by_id INTEGER,
    ip_address VARCHAR(39),
    user_agent TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

### How to View Contact Messages

**Method 1: Admin Dashboard (Recommended)**
```
Frontend URL: http://localhost:3000/admin/contacts
Requirements: Admin account login
Features: 
- View all submissions
- Filter by read/unread
- Mark as replied
- Delete submissions
- View statistics
```

**Method 2: API Endpoint**
```http
GET /api/analytics/admin/contacts/
Headers: Authorization: Bearer <admin_access_token>

Query Parameters:
- ?is_read=false        # Filter unread
- ?is_replied=false     # Filter unreplied
- ?page=1               # Pagination
```

**Method 3: Direct Database Query**
```python
cd backend
python manage.py shell

from apps.analytics.models import ContactSubmission
contacts = ContactSubmission.objects.all().order_by('-created_at')
for contact in contacts:
    print(f"{contact.name} ({contact.email}): {contact.subject}")
    print(f"Message: {contact.message}")
    print(f"Read: {contact.is_read}, Replied: {contact.is_replied}")
    print("---")
```

**Method 4: SQL Query**
```sql
sqlite3 backend/db.sqlite3
SELECT name, email, subject, message, is_read, is_replied, created_at 
FROM analytics_contactsubmission 
ORDER BY created_at DESC;
```

### Contact Submission Workflow

1. **User submits form** → POST `/api/analytics/contact/`
2. **Data stored** → `analytics_contactsubmission` table
3. **Admin notification** → Email sent (if configured)
4. **Admin reviews** → Via `/admin/contacts` page
5. **Mark as read** → Automatic when viewing details
6. **Mark as replied** → Manual action by admin

### Contact Statistics

**Get Stats:**
```http
GET /api/analytics/admin/contacts/stats/
Response:
{
  "total": 45,
  "unread": 12,
  "unreplied": 8,
  "this_week": 5
}
```

---

## 5. Blog System

### Where Blog Data Lives

**Published Blogs Storage:**
- **Database Table:** `blogs_blog`
- **Location:** `backend/db.sqlite3`

**Blog Statuses:**
- `draft` - Work in progress, not visible to public
- `published` - Live and visible on blog page
- `archived` - Hidden from public view

### Why Blog Page Was Blank (FIXED)

**Root Cause:** Database had no seeded data initially

**Solution Implemented:**
1. Created `seed_data.py` script with sample blogs
2. Executed seeding: `python manage.py shell < seed_data.py`
3. Created 5 sample blogs (4 published, 1 draft)

**Verification:**
```python
cd backend
python manage.py shell
from apps.blogs.models import Blog
print(f"Total blogs: {Blog.objects.count()}")
print(f"Published: {Blog.objects.filter(status='published').count()}")
```

### How to View Blogs

**Public Blog Page:**
```
URL: http://localhost:3000/blogs
Shows: All published blogs
Features: Search, category filtering, pagination
```

**Staff Dashboard:**
```
URL: http://localhost:3000/dashboard/blogs
Access: Staff and Admin roles
Shows: User's own blogs (all statuses)
```

**Admin Panel:**
```
URL: http://localhost:3000/admin/blogs
Access: Admin role only
Shows: All blogs from all users
Features: Status moderation, featured flag, deletion
```

### Blog API Endpoints

**Public:**
- `GET /api/blogs/` - List published blogs
- `GET /api/blogs/:slug/` - Get single blog
- `GET /api/blogs/featured/` - Featured blogs

**Staff:**
- `GET /api/blogs/staff/` - My blogs
- `POST /api/blogs/staff/` - Create blog
- `PATCH /api/blogs/staff/:id/` - Update my blog
- `DELETE /api/blogs/staff/:id/` - Delete my blog

**Admin:**
- `GET /api/blogs/admin/` - All blogs
- `PATCH /api/blogs/admin/:id/status/` - Change status
- `DELETE /api/blogs/admin/:id/` - Delete any blog

### Creating New Blog Content

**Via Frontend (Recommended):**
1. Login as Staff or Admin
2. Navigate to Dashboard → Blogs → New Blog
3. Fill form and select status
4. Submit

**Via API:**
```http
POST /api/blogs/staff/
Headers: 
  Authorization: Bearer <access_token>
  Content-Type: application/json
Body:
{
  "title": "My New Blog Post",
  "content": "<p>Blog content here</p>",
  "excerpt": "Short summary",
  "category": 1,
  "status": "published"
}
```

---

## 6. Password Reset Flow

### System Overview

**Implementation:** Token-based password reset
**Token Storage:** In-memory dictionary (for production, use Redis or database)
**Token Expiry:** 1 hour

### Frontend Routes

1. **Forgot Password Page:** `/forgot-password`
   - User enters email
   - System sends reset link
   - File: `frontend/src/pages/auth/ForgotPassword.jsx`

2. **Reset Password Page:** `/reset-password?token=<token>`
   - Validates token
   - User sets new password
   - File: `frontend/src/pages/auth/ResetPassword.jsx`

### Backend Endpoints

**1. Request Password Reset**
```http
POST /api/auth/password-reset/request/
Body: { "email": "user@example.com" }
Response: {
  "message": "If your email is registered, you will receive a password reset link.",
  "token": "abc123..." (in debug mode only),
  "reset_url": "http://localhost:3000/reset-password?token=abc123" (in debug mode)
}
```

**2. Validate Token**
```http
POST /api/auth/password-reset/validate-token/
Body: { "token": "abc123..." }
Response: { "valid": true }
```

**3. Confirm Password Reset**
```http
POST /api/auth/password-reset/confirm/
Body: {
  "token": "abc123...",
  "new_password": "newpassword",
  "new_password_confirm": "newpassword"
}
Response: {
  "message": "Password has been reset successfully."
}
```

### Complete User Journey

1. **User clicks "Forgot Password"** on login page
2. **Navigate to:** `/forgot-password`
3. **Enter email** and submit
4. **System generates token** (stored server-side for 1 hour)
5. **Email sent** with reset URL (in production)
6. **Debug mode:** Token displayed in response
7. **User clicks link** → Opens `/reset-password?token=abc123`
8. **Token validated** automatically
9. **User enters new password** (twice for confirmation)
10. **Password updated** in database
11. **Token invalidated** (deleted)
12. **User redirected** to login page

### Email Configuration (Production)

**Current:** Console backend (prints to terminal)
**Production:** Configure SMTP in `.env`

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@projectspd.com
```

### Security Features

- **Token expiry:** 1 hour timeout
- **Single use:** Token deleted after successful reset
- **Email enumeration prevention:** Same message for existing/non-existing emails
- **Password validation:** Min 8 chars, complexity requirements
- **Secure hashing:** PBKDF2-SHA256

---

## 7. API Endpoints Reference

### Authentication

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register/` | POST | No | User registration |
| `/api/auth/login/` | POST | No | User login |
| `/api/auth/refresh/` | POST | No | Refresh access token |
| `/api/auth/logout/` | POST | Yes | Blacklist refresh token |
| `/api/auth/password-reset/request/` | POST | No | Request password reset |
| `/api/auth/password-reset/validate-token/` | POST | No | Validate reset token |
| `/api/auth/password-reset/confirm/` | POST | No | Confirm password reset |

### Users

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|---------------|------|-------------|
| `/api/users/me/` | GET/PATCH | Yes | Any | Current user profile |
| `/api/users/change-password/` | POST | Yes | Any | Change password |
| `/api/users/profiles/` | GET | No | - | Public staff profiles |
| `/api/users/profile/?username=xxx` | GET | No | - | Single public profile |
| `/api/users/admin/users/` | GET/POST | Yes | Admin | List/create users |
| `/api/users/admin/users/:id/` | GET/PATCH/DELETE | Yes | Admin | User details |
| `/api/users/admin/users/:id/role/` | PATCH | Yes | Admin | Update user role |
| `/api/users/admin/stats/` | GET | Yes | Admin | User statistics |

### Blogs

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|---------------|------|-------------|
| `/api/blogs/` | GET | No | - | Published blogs |
| `/api/blogs/:slug/` | GET | No | - | Blog details |
| `/api/blogs/featured/` | GET | No | - | Featured blogs |
| `/api/blogs/categories/` | GET | No | - | Categories list |
| `/api/blogs/staff/` | GET/POST | Yes | Staff/Admin | Own blogs |
| `/api/blogs/staff/:id/` | GET/PATCH/DELETE | Yes | Staff/Admin | Own blog details |
| `/api/blogs/admin/` | GET | Yes | Admin | All blogs |
| `/api/blogs/admin/:id/status/` | PATCH | Yes | Admin | Update status |

### Analytics & Contacts

| Endpoint | Method | Auth Required | Role | Description |
|----------|--------|---------------|------|-------------|
| `/api/analytics/contact/` | POST | No | - | Submit contact form |
| `/api/analytics/dashboard/` | GET | Yes | Admin | Dashboard data |
| `/api/analytics/daily/` | GET | Yes | Admin | Daily analytics |
| `/api/analytics/admin/contacts/` | GET | Yes | Admin | Contact submissions |
| `/api/analytics/admin/contacts/:id/` | GET/PATCH/DELETE | Yes | Admin | Contact details |
| `/api/analytics/admin/contacts/:id/reply/` | POST | Yes | Admin | Mark as replied |
| `/api/analytics/admin/contacts/stats/` | GET | Yes | Admin | Contact statistics |

---

## 8. Frontend Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page |
| `/blogs` | Blogs | Blog listing with search |
| `/blogs/:slug` | BlogDetail | Individual blog post |
| `/services` | Services | Services page |
| `/contact` | Contact | Contact form |
| `/profiles` | PublicProfile | Staff profiles |
| `/login` | Login | Login page |
| `/register` | Register | Registration page |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset confirmation |

### Staff Dashboard Routes (Staff/Admin Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | StaffDashboard | Dashboard overview |
| `/dashboard/profile` | StaffProfile | Edit profile |
| `/dashboard/blogs` | StaffBlogs | My blogs list |
| `/dashboard/blogs/new` | StaffBlogCreate | Create new blog |
| `/dashboard/blogs/:id/edit` | StaffBlogEdit | Edit my blog |

### Admin Routes (Admin Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | AdminDashboard | Admin dashboard |
| `/admin/users` | AdminUsers | User management |
| `/admin/users/:id/edit` | AdminUserEdit | Edit user |
| `/admin/blogs` | AdminBlogs | All blogs management |
| `/admin/blogs/:id/edit` | AdminBlogEdit | Edit any blog |
| `/admin/categories` | AdminCategories | Category management |
| `/admin/analytics` | AdminAnalytics | System analytics |
| `/admin/contacts` | AdminContacts | Contact submissions |

### Route Protection

**ProtectedRoute:** Requires authentication (any role)
**AdminRoute:** Requires admin role specifically

```jsx
<Route element={<ProtectedRoute />}>
  {/* Staff/Admin routes */}
</Route>

<Route element={<AdminRoute />}>
  {/* Admin-only routes */}
</Route>
```

---

## 9. Environment Configuration

### Backend Environment Variables

**File Location:** `backend/.env`

```env
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite - Development)
USE_SQLITE=True

# Database (PostgreSQL - Production)
USE_SQLITE=False
DB_NAME=project_spd
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Cache (Local - Development)
USE_LOCAL_CACHE=True

# Cache (Redis - Production)
USE_LOCAL_CACHE=False
REDIS_URL=redis://localhost:6379/0

# CORS Origins (Frontend URLs)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Console - Development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Email (SMTP - Production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@projectspd.com
```

### Frontend Environment Variables

**File Location:** `frontend/.env`

```env
# API Base URL
VITE_API_URL=http://localhost:8000/api

# Production
# VITE_API_URL=https://api.yourprojectspd.com/api
```

---

## 10. Common Troubleshooting

### Issue: "No active account found with the given credentials"

**Cause:** Demo account doesn't exist or password is incorrect

**Solution:**
```bash
cd backend
python manage.py shell < seed_data.py
```

This creates/resets all demo accounts with password: `demo1234`

### Issue: Blog Page Is Blank

**Cause:** No blogs in database

**Solution:**
```bash
cd backend
python manage.py shell < seed_data.py
```

Verify:
```python
python manage.py shell
from apps.blogs.models import Blog
print(Blog.objects.filter(status='published').count())
```

Should return 4 or more.

### Issue: Forgot Password 404 Error

**Status:** ✅ **FIXED**

**What Was Done:**
1. Created password reset backend endpoints
2. Created frontend pages (ForgotPassword, ResetPassword)
3. Updated API service with password reset methods
4. Added routes to App.jsx

**Verify:**
- Navigate to `/forgot-password` - Should load form
- Navigate to `/reset-password?token=test` - Should load reset form

### Issue: Contact Messages Not Visible

**Where to Check:**
1. **Admin Dashboard:** Login as admin → Navigate to `/admin/contacts`
2. **Database:** `SELECT * FROM analytics_contactsubmission;`
3. **API:** `GET /api/analytics/admin/contacts/` with admin token

**Common Causes:**
- Not logged in as admin
- No submissions yet (test by submitting via `/contact` page)

### Issue: Users Cannot Login

**Checklist:**
1. Verify user exists: `SELECT email FROM users_user WHERE email='test@example.com';`
2. Check is_active: `SELECT is_active FROM users_user WHERE email='test@example.com';`
3. Verify password (reset it):
   ```python
   python manage.py shell
   from apps.users.models import User
   user = User.objects.get(email='test@example.com')
   user.set_password('newpassword')
   user.save()
   ```

### Issue: CORS Errors

**Symptom:** Browser console shows "CORS policy" errors

**Solution:**
1. Check `backend/.env`:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
2. Ensure frontend is running on allowed origin
3. Restart backend after changing .env

### Issue: Database Locked

**Cause:** Multiple processes accessing SQLite

**Solution:**
```bash
# Stop all Django processes
pkill -f "python manage.py runserver"

# Or restart backend
cd backend
python manage.py runserver
```

---

## 11. Security Implementation

### Authentication Flow

**JWT Token-Based Authentication:**
1. User logs in → Receives `access_token` (1 hour) and `refresh_token` (7 days)
2. Access token stored in localStorage
3. Every API request includes: `Authorization: Bearer <access_token>`
4. Token expires → Frontend automatically refreshes using refresh_token
5. Refresh fails → User redirected to login

### Password Security

**Hashing:**
- Algorithm: PBKDF2-SHA256
- Iterations: 390,000 (Django 5.0 default)
- Salt: Unique per password
- Format: `pbkdf2_sha256$390000$<salt>$<hash>`

**Password Validation:**
- Minimum 8 characters
- Cannot be too similar to username/email
- Cannot be common password (e.g., "password123")
- Cannot be entirely numeric

**Code Reference:**
```python
# backend/config/settings.py
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

### Input Sanitization

**Blog Content:**
```python
# backend/apps/blogs/models.py
import bleach
self.content = bleach.clean(content, tags=[...], attributes={...})
```

Allows safe HTML tags, strips dangerous scripts.

### CORS Configuration

**Whitelist Origins:**
```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
]
CORS_ALLOW_CREDENTIALS = True
```

### Rate Limiting

**API Throttling:**
```python
# backend/config/settings.py
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',      # Unauthenticated users
    'user': '1000/hour',     # Authenticated users
}
```

### SQL Injection Prevention

**Django ORM:** Automatic parameterization
- Never use raw SQL with user input
- ORM queries are safe by default

### XSS Prevention

**Backend:**
- Content sanitization with `bleach`
- Safe template rendering

**Frontend:**
- React escapes output by default
- Dangerous HTML requires explicit `dangerouslySetInnerHTML`

---

## 12. Deployment Guide

### Backend Deployment Checklist

**1. Environment Setup**
```bash
# Production .env
DEBUG=False
SECRET_KEY=<generate-strong-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
USE_SQLITE=False
DB_NAME=production_db
DB_USER=production_user
DB_PASSWORD=<strong-password>
USE_LOCAL_CACHE=False
REDIS_URL=redis://production-redis:6379/0
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

**2. Database Migration**
```bash
python manage.py migrate
python manage.py createsuperuser
```

**3. Static Files**
```bash
python manage.py collectstatic --noinput
```

**4. Run with Gunicorn**
```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

**5. Setup Celery (Optional)**
```bash
celery -A config worker -l info
celery -A config beat -l info
```

### Frontend Deployment Checklist

**1. Environment Setup**
```bash
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com/api
```

**2. Build**
```bash
npm run build
```

**3. Deploy dist/ folder**
- Upload to static hosting (Netlify, Vercel, AWS S3)
- Configure SPA routing (redirect all to index.html)

### Nginx Configuration (Example)

**Backend Proxy:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
}
```

**Frontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Health Checks

**Backend:**
```bash
curl http://localhost:8000/api/health/
```

**Database Connection:**
```python
python manage.py dbshell
```

---

## 📊 Quick Reference

### Essential File Locations

| What | Where |
|------|-------|
| **Database** | `backend/db.sqlite3` |
| **User Data** | Table: `users_user` |
| **Contact Messages** | Table: `analytics_contactsubmission` |
| **Blog Posts** | Table: `blogs_blog` |
| **Backend Settings** | `backend/config/settings.py` |
| **API Routes** | `backend/config/urls.py` |
| **Frontend Routes** | `frontend/src/App.jsx` |
| **API Service** | `frontend/src/services/api.js` |

### Essential Commands

**Start Backend:**
```bash
cd backend
python manage.py runserver
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Seed Database:**
```bash
cd backend
python manage.py shell < seed_data.py
```

**Create Admin User:**
```bash
cd backend
python manage.py createsuperuser
```

**Access Database:**
```bash
sqlite3 backend/db.sqlite3
```

### Common Queries

**View All Users:**
```sql
SELECT id, email, username, role, is_active, date_joined 
FROM users_user 
ORDER BY date_joined DESC;
```

**View Contact Messages:**
```sql
SELECT name, email, subject, message, is_read, created_at 
FROM analytics_contactsubmission 
ORDER BY created_at DESC;
```

**View Published Blogs:**
```sql
SELECT id, title, slug, status, view_count, published_at 
FROM blogs_blog 
WHERE status='published' 
ORDER BY published_at DESC;
```

---

## 🎯 Summary of Fixes Applied

### ✅ 1. Contact Page Message Visibility
- **Status:** WORKING
- **Location:** Admin panel → `/admin/contacts`
- **Database:** `analytics_contactsubmission` table
- **API:** `/api/analytics/admin/contacts/`

### ✅ 2. Blog Page Was Blank
- **Status:** FIXED
- **Solution:** Seeded database with 4 published blogs
- **Command:** `python manage.py shell < seed_data.py`
- **Verification:** `/blogs` page now displays content

### ✅ 3. Registered Users & Login Records
- **Status:** ACCESSIBLE
- **Methods:** Admin panel, API, database queries, Django shell
- **Location:** `users_user` table in `db.sqlite3`

### ✅ 4. Demo Account Login Error
- **Status:** FIXED
- **Solution:** Created all demo accounts via seed script
- **Accounts:** admin, staff, jane, customer (all with password: demo1234)

### ✅ 5. Forgot Password 404 Error
- **Status:** FIXED
- **Implementation:** 
  - Backend endpoints created
  - Frontend pages created (ForgotPassword, ResetPassword)
  - Routes added to App.jsx
  - API methods added to services
- **Routes:** `/forgot-password`, `/reset-password`

---

## 📞 Support & Maintenance

### For Developers

**Accessing System Data:**
1. **Django Admin:** http://localhost:8000/admin/ (admin@example.com / demo1234)
2. **API Documentation:** http://localhost:8000/api/docs/
3. **Database:** `sqlite3 backend/db.sqlite3`

**Common Tasks:**
- Reset password: Use `/forgot-password` flow
- Add new blog: Login → Dashboard → Blogs → New
- View contacts: Admin → Contacts
- Manage users: Admin → Users

### For System Administrators

**Regular Maintenance:**
- Backup database: `cp backend/db.sqlite3 backups/db_$(date +%Y%m%d).sqlite3`
- Monitor disk space: Database grows with content
- Review logs: `backend/logs/django.log`

**Security Updates:**
- Update dependencies: `pip install -r requirements.txt --upgrade`
- Rotate SECRET_KEY annually
- Review user access permissions quarterly

---

**Document Last Updated:** January 22, 2026  
**All Systems:** ✅ Operational  
**Demo Accounts:** ✅ Working  
**Password Reset:** ✅ Implemented  
**Blog System:** ✅ Populated  
**Contact Form:** ✅ Functional  

For additional support, refer to the Django and React documentation or contact the development team.
