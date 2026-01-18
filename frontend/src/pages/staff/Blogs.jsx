import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiSearch,
  FiFilter,
  FiExternalLink,
} from 'react-icons/fi'

const StaffBlogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  })

  const fetchBlogs = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const response = await blogAPI.staffGetBlogs(params)
      setBlogs(response.data.results || response.data)
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((response.data.count || response.data.length) / 10),
      })
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [search, statusFilter])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    setDeleting(id)
    try {
      await blogAPI.staffDeleteBlog(id)
      setBlogs(blogs.filter((b) => b.id !== id))
      toast.success('Blog deleted successfully')
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Failed to delete blog')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      published: 'badge-success',
      draft: 'badge-warning',
      archived: 'badge-secondary',
    }
    return badges[status] || 'badge-secondary'
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">My Blogs</h1>
          <p className="text-secondary-600 mt-1">Manage your blog posts</p>
        </div>
        <Link to="/dashboard/blogs/new" className="btn btn-primary flex items-center gap-2 w-fit">
          <FiPlus className="w-4 h-4" />
          Create New Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs..."
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {blog.featured_image ? (
                            <img
                              src={blog.featured_image}
                              alt={blog.title}
                              className="w-12 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded bg-secondary-100" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-secondary-900 truncate max-w-xs">
                              {blog.title}
                            </p>
                            {blog.category && (
                              <p className="text-xs text-secondary-500">{blog.category.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-secondary-600">
                          <FiEye className="w-4 h-4" />
                          {blog.view_count}
                        </span>
                      </td>
                      <td className="text-secondary-600">
                        {blog.published_at
                          ? format(new Date(blog.published_at), 'MMM d, yyyy')
                          : format(new Date(blog.created_at), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {blog.status === 'published' && (
                            <Link
                              to={`/blogs/${blog.slug}`}
                              target="_blank"
                              className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 rounded"
                              title="View"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/dashboard/blogs/${blog.id}/edit`}
                            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 rounded"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            disabled={deleting === blog.id}
                            className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === blog.id ? (
                              <span className="spinner w-4 h-4" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => fetchBlogs(page)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFilter className="w-8 h-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            {search || statusFilter ? 'No blogs found' : 'No blogs yet'}
          </h3>
          <p className="text-secondary-600 mb-4">
            {search || statusFilter
              ? 'Try adjusting your filters'
              : 'Create your first blog post to get started'}
          </p>
          {!search && !statusFilter && (
            <Link to="/dashboard/blogs/new" className="btn btn-primary">
              Create Blog
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default StaffBlogs
