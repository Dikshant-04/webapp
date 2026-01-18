import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { userAPI, blogAPI } from '../../services/api'
import BlogCard from '../../components/common/BlogCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiFileText,
} from 'react-icons/fi'

const PublicProfile = () => {
  const [searchParams] = useSearchParams()
  const username = searchParams.get('username')

  const [profile, setProfile] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAllBlogs, setShowAllBlogs] = useState(false)

  const INITIAL_BLOG_COUNT = 6

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) {
        setError('No username provided')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch profile
        const profileResponse = await userAPI.getPublicProfile(username)
        setProfile(profileResponse.data)

        // Fetch user's blogs
        const blogsResponse = await blogAPI.getBlogsByUser(username)
        setBlogs(blogsResponse.data.results || blogsResponse.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (error.response?.status === 404) {
          setError('Profile not found')
        } else {
          setError('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-10 h-10 text-secondary-400" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {error || 'Profile Not Found'}
          </h1>
          <p className="text-secondary-600 mb-6">
            {username
              ? `We couldn't find a profile for "${username}"`
              : 'Please provide a username to view a profile'}
          </p>
          <Link to="/blogs" className="btn btn-primary">
            Browse Blogs
          </Link>
        </div>
      </div>
    )
  }

  const displayedBlogs = showAllBlogs ? blogs : blogs.slice(0, INITIAL_BLOG_COUNT)
  const hasMoreBlogs = blogs.length > INITIAL_BLOG_COUNT

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 py-16">
        <div className="container-custom px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Avatar */}
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.full_name}
                className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FiUser className="w-16 h-16 text-primary-300" />
              </div>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {profile.full_name || profile.username}
            </h1>

            {/* Position */}
            {profile.position && (
              <p className="text-lg text-primary-100 mb-4 flex items-center justify-center gap-2">
                <FiBriefcase className="w-5 h-5" />
                {profile.position}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.blog_count || 0}</div>
                <div className="text-primary-200 text-sm">Articles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container-custom px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">About</h2>

              {/* Bio */}
              {profile.bio && (
                <p className="text-secondary-600 mb-6">{profile.bio}</p>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3 text-secondary-600">
                    <FiMail className="w-5 h-5 text-secondary-400" />
                    <a href={`mailto:${profile.email}`} className="hover:text-primary-600">
                      {profile.email}
                    </a>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-3 text-secondary-600">
                    <FiPhone className="w-5 h-5 text-secondary-400" />
                    <a href={`tel:${profile.phone}`} className="hover:text-primary-600">
                      {profile.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {profile.profile && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-900 mb-3">Connect</h3>
                  <div className="flex gap-3">
                    {profile.profile.website && (
                      <a
                        href={profile.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600 hover:bg-secondary-200"
                      >
                        <FiGlobe className="w-5 h-5" />
                      </a>
                    )}
                    {profile.profile.linkedin && (
                      <a
                        href={profile.profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 hover:bg-blue-200"
                      >
                        <FiLinkedin className="w-5 h-5" />
                      </a>
                    )}
                    {profile.profile.twitter && (
                      <a
                        href={profile.profile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 hover:bg-sky-200"
                      >
                        <FiTwitter className="w-5 h-5" />
                      </a>
                    )}
                    {profile.profile.github && (
                      <a
                        href={profile.profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-700 hover:bg-secondary-200"
                      >
                        <FiGithub className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {profile.profile?.skills && profile.profile.skills.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary-200">
                  <h3 className="text-sm font-medium text-secondary-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Blogs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900 flex items-center gap-2">
                <FiFileText className="w-5 h-5" />
                Articles by {profile.first_name || profile.username}
              </h2>
              <span className="text-secondary-500">{blogs.length} articles</span>
            </div>

            {blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} showAuthor={false} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreBlogs && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAllBlogs(!showAllBlogs)}
                      className="btn btn-outline"
                    >
                      {showAllBlogs
                        ? 'Show Less'
                        : `Load More (${blogs.length - INITIAL_BLOG_COUNT} more)`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFileText className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  No Articles Yet
                </h3>
                <p className="text-secondary-600">
                  {profile.first_name || profile.username} hasn't published any articles yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfile
