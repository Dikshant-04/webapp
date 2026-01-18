import { Link } from 'react-router-dom'
import { FiCalendar, FiClock, FiEye, FiUser } from 'react-icons/fi'
import { format } from 'date-fns'

const BlogCard = ({ blog, showAuthor = true }) => {
  const {
    title,
    slug,
    excerpt,
    featured_image,
    author,
    category_name,
    tags,
    view_count,
    reading_time,
    published_at,
  } = blog

  return (
    <article className="card card-hover group">
      {/* Featured Image */}
      <Link to={`/blogs/${slug}`} className="block overflow-hidden">
        <div className="aspect-video bg-secondary-100 relative overflow-hidden">
          {featured_image ? (
            <img
              src={featured_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-4xl font-bold text-primary-400">
                {title.charAt(0)}
              </span>
            </div>
          )}
          {category_name && (
            <span className="absolute top-4 left-4 badge badge-primary">
              {category_name}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-secondary-500 mb-3">
          {published_at && (
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {format(new Date(published_at), 'MMM d, yyyy')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {reading_time} min read
          </span>
          <span className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            {view_count}
          </span>
        </div>

        {/* Title */}
        <Link to={`/blogs/${slug}`}>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-secondary-600 mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
          {/* Author */}
          {showAuthor && author && (
            <Link
              to={`/profiles?username=${author.username}`}
              className="flex items-center gap-2 hover:text-primary-600 transition-colors"
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <span className="text-sm font-medium text-secondary-700">
                {author.full_name || author.username}
              </span>
            </Link>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex gap-2">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default BlogCard
