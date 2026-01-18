import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FiFileText, FiEye, FiEdit, FiPlus, FiTrendingUp } from 'react-icons/fi'
import { format } from 'date-fns'

const StaffDashboard = () => {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await blogAPI.staffGetBlogs({})
        const blogData = response.data.results || response.data
        setBlogs(blogData)

        // Calculate stats
        const published = blogData.filter(b => b.status === 'published')
        const drafts = blogData.filter(b => b.status === 'draft')
        const views = blogData.reduce((sum, b) => sum + (b.view_count || 0), 0)

        setStats({
          totalBlogs: blogData.length,
          publishedBlogs: published.length,
          draftBlogs: drafts.length,
          totalViews: views,
        })
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-secondary-600 mt-1">
          Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Total Blogs</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.publishedBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draftBlogs}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FiEdit className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/blogs/new" className="btn btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Create New Blog
          </Link>
          <Link to="/dashboard/blogs" className="btn btn-secondary flex items-center gap-2">
            <FiFileText className="w-4 h-4" />
            Manage Blogs
          </Link>
          <Link to="/dashboard/profile" className="btn btn-secondary flex items-center gap-2">
            <FiEdit className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Blogs</h2>
            <Link to="/dashboard/blogs" className="text-primary-600 hover:text-primary-700 text-sm">
              View All
            </Link>
          </div>
        </div>

        {blogs.length > 0 ? (
          <div className="divide-y divide-secondary-200">
            {blogs.slice(0, 5).map((blog) => (
              <div key={blog.id} className="p-4 hover:bg-secondary-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/dashboard/blogs/${blog.id}/edit`}
                      className="font-medium text-secondary-900 hover:text-primary-600 line-clamp-1"
                    >
                      {blog.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500">
                      <span className={`badge ${
                        blog.status === 'published' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {blog.status}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        {blog.view_count} views
                      </span>
                      {blog.published_at && (
                        <span>
                          {format(new Date(blog.published_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/blogs/${blog.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FiFileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No blogs yet</h3>
            <p className="text-secondary-600 mb-4">Create your first blog post to get started.</p>
            <Link to="/dashboard/blogs/new" className="btn btn-primary">
              Create Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard
