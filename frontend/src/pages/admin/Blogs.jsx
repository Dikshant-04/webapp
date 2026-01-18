import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FiSearch, FiEdit, FiTrash2, FiEye, FiStar, FiExternalLink } from 'react-icons/fi'

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })

  const fetchBlogs = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const response = await blogAPI.adminGetBlogs(params)
      setBlogs(response.data.results || response.data)
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((response.data.count || response.data.length) / 10),
      })
    } catch (error) {
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [search, statusFilter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return
    try {
      await blogAPI.adminDeleteBlog(id)
      setBlogs(blogs.filter((b) => b.id !== id))
      toast.success('Blog deleted')
    } catch (error) {
      toast.error('Failed to delete blog')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await blogAPI.adminUpdateStatus(id, status)
      setBlogs(blogs.map((b) => (b.id === id ? { ...b, status } : b)))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleToggleFeatured = async (id) => {
    try {
      const response = await blogAPI.adminToggleFeatured(id)
      setBlogs(blogs.map((b) => (b.id === id ? { ...b, is_featured: response.data.is_featured } : b)))
      toast.success('Featured status updated')
    } catch (error) {
      toast.error('Failed to update')
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Blog Management</h1>
          <p className="text-secondary-600 mt-1">Manage all blogs across the platform</p>
        </div>
      </div>

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
            className="input w-full md:w-40"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

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
                    <th>Blog</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Featured</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <div className="max-w-xs">
                          <p className="font-medium text-secondary-900 truncate">{blog.title}</p>
                          {blog.category && (
                            <p className="text-xs text-secondary-500">{blog.category.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-secondary-600">{blog.author?.username}</td>
                      <td>
                        <select
                          value={blog.status}
                          onChange={(e) => handleStatusChange(blog.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusBadge(blog.status)}`}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-secondary-600">
                          <FiEye className="w-4 h-4" />
                          {blog.view_count}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleFeatured(blog.id)}
                          className={`p-1 rounded ${blog.is_featured ? 'text-yellow-500' : 'text-secondary-300'}`}
                        >
                          <FiStar className={`w-5 h-5 ${blog.is_featured ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="text-secondary-600 text-sm">
                        {format(new Date(blog.created_at), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {blog.status === 'published' && (
                            <Link
                              to={`/blogs/${blog.slug}`}
                              target="_blank"
                              className="p-2 text-secondary-500 hover:text-primary-600 rounded"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/blogs/${blog.id}/edit`}
                            className="p-2 text-secondary-500 hover:text-primary-600 rounded"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 text-secondary-500 hover:text-red-600 rounded"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No blogs found</h3>
          <p className="text-secondary-600">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default AdminBlogs
