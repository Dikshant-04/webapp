import { useState, useEffect } from 'react'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit, FiTrash2, FiTag, FiX } from 'react-icons/fi'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(null) // 'category' | 'tag' | null
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, tagRes] = await Promise.all([
        blogAPI.adminGetCategories(),
        blogAPI.adminGetTags(),
      ])
      setCategories(catRes.data)
      setTags(tagRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openModal = (type, item = null) => {
    setShowModal(type)
    setEditItem(item)
    setFormData(item ? { name: item.name, description: item.description || '' } : { name: '', description: '' })
  }

  const closeModal = () => {
    setShowModal(null)
    setEditItem(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return toast.error('Name is required')

    try {
      if (showModal === 'category') {
        if (editItem) {
          const res = await blogAPI.adminUpdateCategory(editItem.id, formData)
          setCategories(categories.map((c) => (c.id === editItem.id ? res.data : c)))
          toast.success('Category updated')
        } else {
          const res = await blogAPI.adminCreateCategory(formData)
          setCategories([...categories, res.data])
          toast.success('Category created')
        }
      } else {
        if (editItem) {
          const res = await blogAPI.adminUpdateTag(editItem.id, { name: formData.name })
          setTags(tags.map((t) => (t.id === editItem.id ? res.data : t)))
          toast.success('Tag updated')
        } else {
          const res = await blogAPI.adminCreateTag({ name: formData.name })
          setTags([...tags, res.data])
          toast.success('Tag created')
        }
      }
      closeModal()
    } catch (error) {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return
    try {
      if (type === 'category') {
        await blogAPI.adminDeleteCategory(id)
        setCategories(categories.filter((c) => c.id !== id))
      } else {
        await blogAPI.adminDeleteTag(id)
        setTags(tags.filter((t) => t.id !== id))
      }
      toast.success(`${type} deleted`)
    } catch (error) {
      toast.error('Failed to delete')
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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Categories & Tags</h1>
        <p className="text-secondary-600 mt-1">Manage blog categorization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="card">
          <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
            <h2 className="font-semibold text-secondary-900">Categories</h2>
            <button
              onClick={() => openModal('category')}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add
            </button>
          </div>
          {categories.length > 0 ? (
            <div className="divide-y divide-secondary-200">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-secondary-900">{cat.name}</p>
                    {cat.description && (
                      <p className="text-sm text-secondary-500">{cat.description}</p>
                    )}
                    <p className="text-xs text-secondary-400 mt-1">
                      {cat.blog_count || 0} blogs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('category', cat)}
                      className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-secondary-100 rounded"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete('category', cat.id)}
                      className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-secondary-500">No categories yet</div>
          )}
        </div>

        {/* Tags */}
        <div className="card">
          <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
            <h2 className="font-semibold text-secondary-900">Tags</h2>
            <button
              onClick={() => openModal('tag')}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add
            </button>
          </div>
          {tags.length > 0 ? (
            <div className="p-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 bg-secondary-100 px-3 py-2 rounded-lg group"
                >
                  <FiTag className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-700">{tag.name}</span>
                  <button
                    onClick={() => openModal('tag', tag)}
                    className="p-1 text-secondary-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete('tag', tag.id)}
                    className="p-1 text-secondary-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-secondary-500">No tags yet</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md animate-slide-up">
            <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
              <h3 className="font-semibold text-secondary-900">
                {editItem ? 'Edit' : 'Add'} {showModal === 'category' ? 'Category' : 'Tag'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-secondary-100 rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="form-group">
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder={`${showModal === 'category' ? 'Category' : 'Tag'} name`}
                  autoFocus
                />
              </div>
              {showModal === 'category' && (
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input resize-none"
                    rows={3}
                    placeholder="Optional description"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories
