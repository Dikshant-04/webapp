import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { blogAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiSave, FiArrowLeft, FiImage } from 'react-icons/fi'

const BlogCreate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      status: 'draft',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catResponse, tagResponse] = await Promise.all([
          blogAPI.getCategories(),
          blogAPI.getTags(),
        ])
        setCategories(catResponse.data)
        setTags(tagResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await blogAPI.staffCreateBlog({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category_id: data.category_id || null,
        tag_ids: selectedTags,
        status: data.status,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      })
      toast.success('Blog created successfully!')
      navigate('/dashboard/blogs')
    } catch (error) {
      console.error('Error creating blog:', error)
      toast.error('Failed to create blog')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-secondary-100"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Create New Blog</h1>
          <p className="text-secondary-600 mt-1">Share your thoughts with the world</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Main Content */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Content</h2>

          <div className="form-group">
            <label className="label">Title *</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Enter blog title"
            />
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Excerpt</label>
            <textarea
              {...register('excerpt')}
              rows={2}
              className="input resize-none"
              placeholder="Brief summary of your blog (shown in previews)"
            />
          </div>

          <div className="form-group">
            <label className="label">Content *</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              rows={15}
              className={`input resize-none font-mono text-sm ${errors.content ? 'input-error' : ''}`}
              placeholder="Write your blog content here... (HTML is supported)"
            />
            {errors.content && <p className="error-message">{errors.content.message}</p>}
          </div>
        </div>

        {/* Categorization */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Categorization</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-secondary-500 text-sm">No tags available</p>
              )}
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">SEO Settings</h2>

          <div className="form-group">
            <label className="label">Meta Title</label>
            <input
              type="text"
              {...register('meta_title')}
              className="input"
              placeholder="SEO title (max 70 characters)"
              maxLength={70}
            />
          </div>

          <div className="form-group">
            <label className="label">Meta Description</label>
            <textarea
              {...register('meta_description')}
              rows={2}
              className="input resize-none"
              placeholder="SEO description (max 160 characters)"
              maxLength={160}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner w-4 h-4" />
                Creating...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Create Blog
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogCreate
