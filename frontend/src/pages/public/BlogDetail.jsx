import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import BlogCard from '../../components/common/BlogCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { format } from 'date-fns'
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiUser,
  FiTag,
  FiArrowLeft,
  FiShare2,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
} from 'react-icons/fi'

const BlogDetail = () => {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await blogAPI.getBlog(slug)
        setBlog(response.data)
      } catch (error) {
        console.error('Error fetching blog:', error)
        setError('Blog not found')
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  const shareUrl = window.location.href

  const handleShare = (platform) => {
    const title = encodeURIComponent(blog?.title || '')
    const url = encodeURIComponent(shareUrl)

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-4">Blog Not Found</h1>
          <p className="text-secondary-600 mb-6">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blogs" className="btn btn-primary">
            Back to Blogs
          </Link>
        </div>
      </div>
    )
  }

  const { author, category, tags, related_blogs } = blog

  return (
    <div className="bg-secondary-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container-custom px-4 py-8">
          {/* Back Link */}
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          {/* Category */}
          {category && (
            <span className="badge badge-primary mb-4">{category.name}</span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-6">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-secondary-600 mb-6">
            {blog.published_at && (
              <span className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                {format(new Date(blog.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              {blog.reading_time} min read
            </span>
            <span className="flex items-center gap-2">
              <FiEye className="w-4 h-4" />
              {blog.view_count} views
            </span>
          </div>

          {/* Author */}
          {author && (
            <Link
              to={`/profiles?username=${author.username}`}
              className="inline-flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-primary-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-secondary-900">
                  {author.full_name || author.username}
                </p>
                {author.position && (
                  <p className="text-sm text-secondary-500">{author.position}</p>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-custom px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full rounded-xl mb-8 shadow-lg"
              />
            )}

            {/* Blog Content */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-secondary-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <FiTag className="w-5 h-5 text-secondary-500" />
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/blogs?tag=${tag.slug}`}
                      className="badge badge-secondary hover:bg-secondary-200"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-secondary-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-secondary-600">
                  <FiShare2 className="w-5 h-5" />
                  Share:
                </span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                >
                  <FiFacebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200"
                >
                  <FiTwitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <FiLinkedin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Card */}
            {author && (
              <div className="card p-6 mb-6">
                <h3 className="font-semibold text-secondary-900 mb-4">About the Author</h3>
                <Link
                  to={`/profiles?username=${author.username}`}
                  className="flex items-center gap-3 mb-4"
                >
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-secondary-900">
                      {author.full_name || author.username}
                    </p>
                    {author.position && (
                      <p className="text-sm text-secondary-500">{author.position}</p>
                    )}
                  </div>
                </Link>
                <Link
                  to={`/profiles?username=${author.username}`}
                  className="btn btn-secondary w-full"
                >
                  View Profile
                </Link>
              </div>
            )}

            {/* Related Blogs */}
            {related_blogs && related_blogs.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {related_blogs.map((relatedBlog) => (
                    <Link
                      key={relatedBlog.id}
                      to={`/blogs/${relatedBlog.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {relatedBlog.featured_image ? (
                          <img
                            src={relatedBlog.featured_image}
                            alt={relatedBlog.title}
                            className="w-20 h-16 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-16 rounded bg-secondary-100 flex-shrink-0" />
                        )}
                        <div>
                          <h4 className="font-medium text-secondary-900 group-hover:text-primary-600 line-clamp-2 text-sm">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-xs text-secondary-500 mt-1">
                            {relatedBlog.reading_time} min read
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
