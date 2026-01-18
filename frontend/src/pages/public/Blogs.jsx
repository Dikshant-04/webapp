import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import BlogCard from '../../components/common/BlogCard'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    count: 0,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Get search params
  const searchQuery = searchParams.get('q') || ''
  const categoryFilter = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch blogs
        const params = { page }
        if (searchQuery) params.search = searchQuery
        if (categoryFilter) params.category__slug = categoryFilter

        const response = await blogAPI.getBlogs(params)
        setBlogs(response.data.results || response.data)
        setPagination({
          currentPage: page,
          totalPages: Math.ceil((response.data.count || response.data.length) / 10),
          count: response.data.count || response.data.length,
        })

        // Fetch categories
        const catResponse = await blogAPI.getCategories()
        setCategories(catResponse.data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchQuery, categoryFilter, page])

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get('search')
    
    const newParams = new URLSearchParams(searchParams)
    if (query) {
      newParams.set('q', query)
    } else {
      newParams.delete('q')
    }
    newParams.delete('page')
    setSearchParams(newParams)
  }

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams)
    if (slug) {
      newParams.set('category', slug)
    } else {
      newParams.delete('category')
    }
    newParams.delete('page')
    setSearchParams(newParams)
    setShowFilters(false)
  }

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = searchQuery || categoryFilter

  return (
    <div className="section bg-secondary-50 min-h-screen">
      <div className="container-custom px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="page-title">Our Blog</h1>
          <p className="page-subtitle max-w-2xl mx-auto">
            Discover insights, tutorials, and updates from our team
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Search blogs..."
                  className="input pl-10"
                />
              </div>
            </form>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn btn-secondary flex items-center justify-center gap-2"
            >
              <FiFilter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input w-auto"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.blog_count})
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-secondary-200">
              <label className="label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.blog_count})
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full mt-4"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 text-secondary-600">
            <span>
              {pagination.count} {pagination.count === 1 ? 'result' : 'results'} found
            </span>
            {searchQuery && (
              <span className="badge badge-primary">Search: {searchQuery}</span>
            )}
            {categoryFilter && (
              <span className="badge badge-secondary">
                Category: {categories.find(c => c.slug === categoryFilter)?.name}
              </span>
            )}
          </div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No blogs found
            </h3>
            <p className="text-secondary-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Check back later for new content'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Blogs
