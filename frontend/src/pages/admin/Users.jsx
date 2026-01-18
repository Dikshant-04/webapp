import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiUser,
  FiShield,
  FiUsers,
} from 'react-icons/fi'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
  const [stats, setStats] = useState(null)

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const [usersResponse, statsResponse] = await Promise.all([
        userAPI.adminGetUsers(params),
        userAPI.adminGetStats(),
      ])

      setUsers(usersResponse.data.results || usersResponse.data)
      setPagination({
        currentPage: page,
        totalPages: Math.ceil((usersResponse.data.count || usersResponse.data.length) / 10),
      })
      setStats(statsResponse.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await userAPI.adminDeleteUser(id)
      setUsers(users.filter((u) => u.id !== id))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.adminUpdateUserRole(userId, newRole)
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success('User role updated')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error.response?.data?.error || 'Failed to update role')
    }
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-700',
      staff: 'bg-blue-100 text-blue-700',
      customer: 'bg-secondary-100 text-secondary-700',
    }
    return badges[role] || 'badge-secondary'
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">User Management</h1>
          <p className="text-secondary-600 mt-1">Manage all users and their roles</p>
        </div>
        <Link to="/admin/users/new" className="btn btn-primary flex items-center gap-2 w-fit">
          <FiUserPlus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stats.total_users}</p>
                <p className="text-sm text-secondary-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.users_by_role?.admin || 0}
                </p>
                <p className="text-sm text-secondary-500">Admins</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiUser className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats.users_by_role?.staff || 0}
                </p>
                <p className="text-sm text-secondary-500">Staff</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiUserPlus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary-900">{stats.new_users_this_month}</p>
                <p className="text-sm text-secondary-500">New This Month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="input pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-full md:w-40"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Blogs</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
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
                            <p className="font-medium text-secondary-900">{user.full_name}</p>
                            <p className="text-sm text-secondary-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm font-medium border-0 cursor-pointer ${getRoleBadge(user.role)}`}
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-secondary-600">{user.blog_count || 0}</td>
                      <td className="text-secondary-600">
                        {format(new Date(user.date_joined), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 rounded"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded"
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
                onPageChange={(page) => fetchUsers(page)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <FiUsers className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No users found</h3>
          <p className="text-secondary-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
