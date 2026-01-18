import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI, userAPI, blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { format } from 'date-fns'
import {
  FiUsers,
  FiFileText,
  FiEye,
  FiMessageSquare,
  FiTrendingUp,
  FiArrowRight,
  FiUserPlus,
} from 'react-icons/fi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsAPI.getDashboard()
        setData(response.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
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

  const stats = [
    {
      title: 'Total Users',
      value: data?.summary?.total_users || 0,
      icon: FiUsers,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/users',
    },
    {
      title: 'Total Blogs',
      value: data?.summary?.total_blogs || 0,
      icon: FiFileText,
      color: 'bg-green-100 text-green-600',
      link: '/admin/blogs',
    },
    {
      title: 'Total Views',
      value: data?.summary?.total_views || 0,
      icon: FiEye,
      color: 'bg-purple-100 text-purple-600',
      link: '/admin/analytics',
    },
    {
      title: 'Comments',
      value: data?.summary?.total_comments || 0,
      icon: FiMessageSquare,
      color: 'bg-orange-100 text-orange-600',
      link: '/admin/blogs',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-1">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Growth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FiTrendingUp className="w-5 h-5" />
            <span className="font-semibold">Views Today</span>
          </div>
          <p className="text-3xl font-bold text-secondary-900">{data?.views?.today || 0}</p>
          <p className="text-sm text-secondary-500 mt-1">
            {data?.views?.this_week || 0} this week
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <FiUserPlus className="w-5 h-5" />
            <span className="font-semibold">New Users Today</span>
          </div>
          <p className="text-3xl font-bold text-secondary-900">{data?.new_users?.today || 0}</p>
          <p className="text-sm text-secondary-500 mt-1">
            {data?.new_users?.this_month || 0} this month
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <FiEye className="w-5 h-5" />
            <span className="font-semibold">Monthly Views</span>
          </div>
          <p className="text-3xl font-bold text-secondary-900">{data?.views?.this_month || 0}</p>
          <p className="text-sm text-secondary-500 mt-1">Last 30 days</p>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Views Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Views Trend</h2>
          {data?.daily_views && data.daily_views.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.daily_views}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total_views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-secondary-500">
              No data available
            </div>
          )}
        </div>

        {/* Top Blogs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">Top Blogs</h2>
            <Link to="/admin/blogs" className="text-primary-600 text-sm flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {data?.top_blogs && data.top_blogs.length > 0 ? (
            <div className="space-y-3">
              {data.top_blogs.slice(0, 5).map((blog, index) => (
                <div key={blog.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center text-sm font-medium text-secondary-600">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{blog.title}</p>
                  </div>
                  <span className="text-sm text-secondary-500 flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    {blog.view_count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-8">No blogs yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <div className="card">
          <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
            <h2 className="font-semibold text-secondary-900">Recent Blogs</h2>
            <Link to="/admin/blogs" className="text-primary-600 text-sm">
              View All
            </Link>
          </div>
          <div className="divide-y divide-secondary-200">
            {data?.recent_activity?.blogs?.slice(0, 5).map((blog) => (
              <div key={blog.id} className="p-4 hover:bg-secondary-50">
                <p className="font-medium text-secondary-900 truncate">{blog.title}</p>
                <p className="text-sm text-secondary-500">
                  by {blog.author__username} &middot;{' '}
                  {format(new Date(blog.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            )) || (
              <p className="p-4 text-secondary-500 text-center">No recent blogs</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
            <h2 className="font-semibold text-secondary-900">Recent Users</h2>
            <Link to="/admin/users" className="text-primary-600 text-sm">
              View All
            </Link>
          </div>
          <div className="divide-y divide-secondary-200">
            {data?.recent_activity?.users?.slice(0, 5).map((user) => (
              <div key={user.id} className="p-4 hover:bg-secondary-50">
                <p className="font-medium text-secondary-900">{user.username}</p>
                <p className="text-sm text-secondary-500">
                  {user.email} &middot;{' '}
                  {format(new Date(user.date_joined), 'MMM d, yyyy')}
                </p>
              </div>
            )) || (
              <p className="p-4 text-secondary-500 text-center">No recent users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
