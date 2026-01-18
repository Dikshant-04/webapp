import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiSave, FiArrowLeft } from 'react-icons/fi'

const AdminBlogEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, catRes] = await Promise.all([
          blogAPI.adminGetBlog(id),
          blogAPI.getCategories(),
        ])
        setCategories(catRes.data)
        reset({
          ...blogRes.data,
          category_id: blogRes.data.category?.id || '',
        })
      } catch (error) {
        toast.error('Failed to load blog')
        navigate('/admin/blogs')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, reset, navigate])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await blogAPI.adminUpdateBlog(id, {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category_id: data.category_id || null,
        status: data.status,
        is_featured: data.is_featured,
      })
      toast.success('Blog updated successfully')
      navigate('/admin/blogs')
    } catch (error) {
      toast.error('Failed to update blog')
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
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary-100">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Edit Blog</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card p-6 mb-6">
          <div className="form-group">
            <label className="label">Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className={`input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Excerpt</label>
            <textarea {...register('excerpt')} rows={2} className="input resize-none" />
          </div>

          <div className="form-group">
            <label className="label">Content *</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={15}
              className={`input resize-none font-mono text-sm ${errors.content ? 'input-error' : ''}`}
            />
          </div>
        </div>

        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Featured</label>
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" {...register('is_featured')} className="w-4 h-4" />
                <span>Mark as featured</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
            {saving ? <span className="spinner w-4 h-4" /> : <FiSave className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminBlogEdit
