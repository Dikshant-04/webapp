import { Routes, Route } from 'react-router-dom'

// Layouts
import PublicLayout from './components/layouts/PublicLayout'
import DashboardLayout from './components/layouts/DashboardLayout'
import AdminLayout from './components/layouts/AdminLayout'

// Public Pages
import Home from './pages/public/Home'
import Blogs from './pages/public/Blogs'
import BlogDetail from './pages/public/BlogDetail'
import Services from './pages/public/Services'
import Contact from './pages/public/Contact'
import PublicProfile from './pages/public/PublicProfile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Staff Dashboard Pages
import StaffDashboard from './pages/staff/Dashboard'
import StaffProfile from './pages/staff/Profile'
import StaffBlogs from './pages/staff/Blogs'
import StaffBlogCreate from './pages/staff/BlogCreate'
import StaffBlogEdit from './pages/staff/BlogEdit'

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminUserEdit from './pages/admin/UserEdit'
import AdminBlogs from './pages/admin/Blogs'
import AdminBlogEdit from './pages/admin/BlogEdit'
import AdminAnalytics from './pages/admin/Analytics'
import AdminContacts from './pages/admin/Contacts'
import AdminCategories from './pages/admin/Categories'

// Protected Routes
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Not Found
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profiles" element={<PublicProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Staff Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<StaffDashboard />} />
          <Route path="/dashboard/profile" element={<StaffProfile />} />
          <Route path="/dashboard/blogs" element={<StaffBlogs />} />
          <Route path="/dashboard/blogs/new" element={<StaffBlogCreate />} />
          <Route path="/dashboard/blogs/:id/edit" element={<StaffBlogEdit />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/blogs/:id/edit" element={<AdminBlogEdit />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
