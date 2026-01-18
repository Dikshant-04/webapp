import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { userAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiSave, FiArrowLeft, FiUser } from 'react-icons/fi'

const AdminUserEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userAPI.adminGetUser(id)
        reset(response.data)
      } catch (error) {
        toast.error('Failed to load user')
        navigate('/admin/users')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, reset, navigate])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await userAPI.adminUpdateUser(id, data)
      toast.success('User updated successfully')
      navigate('/admin/users')
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary-100">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Edit User</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="label">First Name</label>
            <input {...register('first_name')} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Last Name</label>
            <input {...register('last_name')} className="input" />
          </div>
        </div>

        <div className="form-group">
          <label className="label">Email</label>
          <input {...register('email')} type="email" className="input" disabled />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="label">Role</label>
            <select {...register('role')} className="input">
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select {...register('is_active')} className="input">
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
            {saving ? <span className="spinner w-4 h-4" /> : <FiSave className="w-4 h-4" />}
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminUserEdit
