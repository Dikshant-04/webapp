import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiMail,
  FiTag,
  FiMenu,
  FiX,
  FiLogOut,
  FiArrowLeft,
  FiGrid,
} from 'react-icons/fi'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const navItems = [
    { to: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/blogs', icon: FiFileText, label: 'Blogs' },
    { to: '/admin/categories', icon: FiTag, label: 'Categories' },
    { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/admin/contacts', icon: FiMail, label: 'Contacts' },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-secondary-900 text-white sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary-800"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <span className="font-heading font-bold text-lg">Admin Panel</span>

          <Link to="/" className="p-2 rounded-lg hover:bg-secondary-800">
            <FiArrowLeft className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-secondary-900 text-secondary-300
            transform transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-800">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-heading font-bold text-lg text-white">Admin</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-secondary-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">{user?.full_name}</p>
                  <span className="text-xs text-secondary-400">Administrator</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-secondary-800 space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary-400 hover:bg-secondary-800 hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <FiGrid className="w-5 h-5" />
                Staff Dashboard
              </Link>
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-secondary-400 hover:bg-secondary-800 hover:text-white transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Site
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
