# Project SPD - Full-Stack Role-Based Web Application

A complete, production-ready role-based web application built with Django REST Framework (backend) and React/Vite (frontend).

## 🎯 Project Overview

Project SPD is a software company website with:
- **Public Pages**: Home, Blogs, Services, Contact, Public Profiles
- **Staff Dashboard**: Profile management, personal blog management
- **Admin Dashboard**: Full system control, user management, analytics

## 🏗 Tech Stack

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **JWT Authentication** - Token-based auth
- **PostgreSQL** - Primary database
- **Redis** - Caching & Celery broker
- **Celery** - Background tasks

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router 6** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Charts & analytics

## 📁 Project Structure

```
webapp/
├── backend/
│   ├── apps/
│   │   ├── users/          # User management & auth
│   │   ├── blogs/          # Blog management
│   │   └── analytics/      # Analytics & contacts
│   ├── config/             # Django settings
│   ├── requirements.txt
│   ├── manage.py
│   └── seed_data.py
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── hooks/          # Custom hooks
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Customer** | View public pages, blogs, profiles |
| **Staff** | All customer permissions + own profile & blog management |
| **Admin** | Full system access: users, all blogs, analytics, moderation |

## 🌐 Application Pages

### Public Pages
- **Home** (`/`) - Company intro, featured blogs, services overview
- **Blogs** (`/blogs`) - Blog listing with search & filters
- **Blog Detail** (`/blogs/:slug`) - Individual blog with view tracking
- **Services** (`/services`) - Company services
- **Contact** (`/contact`) - Contact form with email integration
- **Profiles** (`/profiles?username=xxx`) - Public employee profiles

### Staff Dashboard
- **Dashboard** (`/dashboard`) - Overview & stats
- **Profile** (`/dashboard/profile`) - Edit own profile
- **Blogs** (`/dashboard/blogs`) - Manage own blogs
- **Blog Create** (`/dashboard/blogs/new`) - Create new blog
- **Blog Edit** (`/dashboard/blogs/:id/edit`) - Edit blog

### Admin Dashboard
- **Dashboard** (`/admin`) - System overview & analytics
- **Users** (`/admin/users`) - User management & role assignment
- **Blogs** (`/admin/blogs`) - All blog management
- **Categories** (`/admin/categories`) - Category & tag management
- **Analytics** (`/admin/analytics`) - Detailed analytics
- **Contacts** (`/admin/contacts`) - Contact form submissions

## 🔌 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | User registration |
| `/api/auth/login/` | POST | Login (get tokens) |
| `/api/auth/refresh/` | POST | Refresh access token |
| `/api/auth/logout/` | POST | Logout (blacklist token) |

### Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/me/` | GET/PATCH | Current user profile |
| `/api/users/profiles/` | GET | Public profiles list |
| `/api/users/profile/?username=xxx` | GET | Public profile by username |
| `/api/users/admin/users/` | GET/POST | Admin: List/create users |
| `/api/users/admin/users/:id/` | GET/PATCH/DELETE | Admin: User detail |
| `/api/users/admin/users/:id/role/` | PATCH | Admin: Update user role |

### Blogs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blogs/` | GET | Public blog list |
| `/api/blogs/:slug/` | GET | Public blog detail |
| `/api/blogs/featured/` | GET | Featured blogs |
| `/api/blogs/user/:username/` | GET | Blogs by user |
| `/api/blogs/categories/` | GET | Category list |
| `/api/blogs/staff/` | GET/POST | Staff: Own blogs |
| `/api/blogs/staff/:id/` | GET/PATCH/DELETE | Staff: Blog detail |
| `/api/blogs/admin/` | GET | Admin: All blogs |
| `/api/blogs/admin/:id/status/` | PATCH | Admin: Update status |

### Analytics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/contact/` | POST | Submit contact form |
| `/api/analytics/dashboard/` | GET | Admin: Dashboard data |
| `/api/analytics/daily/` | GET | Admin: Daily analytics |
| `/api/analytics/admin/contacts/` | GET | Admin: Contact list |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for development)
- Redis (optional, for Celery)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# For development with SQLite, update .env:
# USE_SQLITE=True
# USE_LOCAL_CACHE=True

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data (optional)
python manage.py shell < seed_data.py

# Run server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/docs/

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | demo1234 |
| Staff | staff@example.com | demo1234 |
| Staff | jane@example.com | demo1234 |
| Customer | customer@example.com | demo1234 |

## 📊 Database Schema

### Users
- `User` - Custom user model with roles (customer/staff/admin)
- `UserProfile` - Extended profile with social links

### Blogs
- `Blog` - Blog posts with status (draft/published/archived)
- `Category` - Blog categories
- `Tag` - Blog tags
- `BlogComment` - Comments with nested replies

### Analytics
- `BlogView` - Individual view tracking
- `DailyAnalytics` - Aggregated daily stats
- `MonthlyAnalytics` - Monthly reports
- `ContactSubmission` - Contact form submissions

## 🔧 Environment Variables

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=project_spd
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# SQLite (development)
USE_SQLITE=True

# Redis
REDIS_URL=redis://localhost:6379/0
USE_LOCAL_CACHE=True  # For development without Redis

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

## 🚢 Deployment

### Backend (Himalayan Hosting / Any Server)
1. Set up PostgreSQL and Redis
2. Configure environment variables
3. Run migrations
4. Collect static files: `python manage.py collectstatic`
5. Use Gunicorn: `gunicorn config.wsgi:application`
6. Set up Celery worker and beat

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Configure API URL in environment

### Celery (Background Tasks)
```bash
# Worker
celery -A config worker -l info

# Beat (scheduled tasks)
celery -A config beat -l info
```

## 🧪 Testing

```bash
# Backend tests
python manage.py test

# Frontend tests
npm test
```

## 📝 API Documentation

- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`

## 🔒 Security Features

- JWT authentication with token blacklisting
- Role-based access control (RBAC)
- CORS configuration
- CSRF protection
- Input validation & sanitization
- Secure password hashing
- Rate limiting

## 📈 Features Implemented

### ✅ Completed
- [x] User authentication (JWT)
- [x] Role-based permissions
- [x] Public blog viewing
- [x] Blog search & filtering
- [x] Staff blog management
- [x] Admin user management
- [x] Admin blog moderation
- [x] Analytics dashboard
- [x] Contact form
- [x] Public profiles
- [x] Blog view tracking
- [x] Celery background tasks

### 🔜 Future Enhancements
- [ ] Email verification
- [ ] Password reset
- [ ] Image upload for blogs
- [ ] Newsletter subscription
- [ ] Social authentication
- [ ] Advanced analytics charts
- [ ] Export reports

## 📄 License

MIT License - feel free to use for your projects!

---

Built with ❤️ by Project SPD Team
