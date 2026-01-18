import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiHome,
  FiUser,
  FiFileText,
  FiMenu,
  FiX,
  FiLogOut,
  FiArrowLeft,
  FiSettings,
} from 'react-icons/fi'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard', exact: true },
    { to: '/dashboard/profile', icon: FiUser, label: 'My Profile' },
    { to: '/dashboard/blogs', icon: FiFileText, label: 'My Blogs' },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-secondary-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary-100"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <span className="font-heading font-bold text-lg">Staff Dashboard</span>

          <Link to="/" className="p-2 rounded-lg hover:bg-secondary-100">
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
            w-64 bg-white border-r border-secondary-200
            transform transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-heading font-bold text-lg">Project SPD</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-secondary-200">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-secondary-900">{user?.full_name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 capitalize">
                    {user?.role}
                  </span>
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
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}

              {isAdmin() && (
                <>
                  <div className="border-t border-secondary-200 my-4" />
                  <Link
                    to="/admin"
                    className="sidebar-link text-primary-600"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiSettings className="w-5 h-5" />
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-secondary-200">
              <Link
                to="/"
                className="sidebar-link mb-2"
              >
                <FiArrowLeft className="w-5 h-5" />
                Back to Site
              </Link>
              <button
                onClick={logout}
                className="sidebar-link text-red-600 hover:bg-red-50 w-full"
              >
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
