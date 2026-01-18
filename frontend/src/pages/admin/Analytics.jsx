import { useState, useEffect } from 'react'
import { analyticsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { format } from 'date-fns'
import { FiEye, FiUsers, FiTrendingUp, FiMonitor, FiSmartphone, FiTablet } from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [dailyData, setDailyData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, dailyRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getDailyAnalytics(30),
        ])
        setData(dashboardRes.data)
        setDailyData(dailyRes.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
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

  const deviceData = [
    { name: 'Desktop', value: data?.device_breakdown?.desktop || 0, color: '#3b82f6' },
    { name: 'Mobile', value: data?.device_breakdown?.mobile || 0, color: '#10b981' },
    { name: 'Tablet', value: data?.device_breakdown?.tablet || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Analytics</h1>
        <p className="text-secondary-600 mt-1">Platform performance and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Total Views</p>
              <p className="text-2xl font-bold">{data?.summary?.total_views?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">Views Today</p>
              <p className="text-2xl font-bold">{data?.views?.today || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">This Week</p>
              <p className="text-2xl font-bold">{data?.views?.this_week || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-500 text-sm">This Month</p>
              <p className="text-2xl font-bold">{data?.views?.this_month || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Views Trend */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Views Trend (Last 30 Days)</h2>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => format(new Date(v), 'MMM d')}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="total_views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Views" />
                <Line type="monotone" dataKey="unique_visitors" stroke="#10b981" strokeWidth={2} dot={false} name="Visitors" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-500">
              No data available
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Device Breakdown</h2>
          {deviceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {deviceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-secondary-600">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-secondary-500">
              No device data
            </div>
          )}
        </div>
      </div>

      {/* Top Blogs */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Top Performing Blogs</h2>
        {data?.top_blogs?.length > 0 ? (
          <div className="space-y-3">
            {data.top_blogs.map((blog, index) => (
              <div key={blog.id} className="flex items-center gap-4 p-3 bg-secondary-50 rounded-lg">
                <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary-900 truncate">{blog.title}</p>
                </div>
                <div className="flex items-center gap-1 text-secondary-600">
                  <FiEye className="w-4 h-4" />
                  <span>{blog.view_count?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary-500 text-center py-8">No blog data available</p>
        )}
      </div>
    </div>
  )
}

export default AdminAnalytics
