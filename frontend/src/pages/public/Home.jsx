import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../services/api'
import BlogCard from '../../components/common/BlogCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  FiCode,
  FiSmartphone,
  FiCloud,
  FiLayout,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi'

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await blogAPI.getFeatured()
        setFeaturedBlogs(response.data)
      } catch (error) {
        console.error('Error fetching featured blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedBlogs()
  }, [])

  const services = [
    {
      icon: FiCode,
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies and best practices.',
    },
    {
      icon: FiSmartphone,
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications for iOS and Android.',
    },
    {
      icon: FiCloud,
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure and DevOps services.',
    },
    {
      icon: FiLayout,
      title: 'UI/UX Design',
      description: 'User-centered design that creates engaging digital experiences.',
    },
  ]

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '500+', label: 'Projects Completed' },
    { value: '100+', label: 'Happy Clients' },
    { value: '50+', label: 'Team Members' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 lg:py-32">
        <div className="container-custom px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Building Digital Solutions for Tomorrow
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8">
              We help businesses transform their ideas into powerful software solutions. 
              From web applications to mobile apps, we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3">
                Our Services
              </Link>
              <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-secondary-200">
        <div className="container-custom px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-secondary-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section bg-secondary-50">
        <div className="container-custom px-4">
          <div className="text-center mb-12">
            <h2 className="page-title">What We Do</h2>
            <p className="page-subtitle max-w-2xl mx-auto">
              We offer comprehensive software development services to help your business grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-secondary-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/services" className="btn btn-primary inline-flex items-center gap-2">
              View All Services
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="text-center mb-12">
            <h2 className="page-title">Featured Blogs</h2>
            <p className="page-subtitle max-w-2xl mx-auto">
              Insights, tutorials, and updates from our team
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogs.slice(0, 3).map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary-500 py-12">
              No featured blogs available.
            </p>
          )}

          <div className="text-center mt-8">
            <Link to="/blogs" className="btn btn-outline inline-flex items-center gap-2">
              View All Blogs
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-secondary-900 text-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Project SPD?
              </h2>
              <p className="text-secondary-300 mb-8">
                We combine technical expertise with business understanding to deliver 
                solutions that drive real results for your organization.
              </p>
              <ul className="space-y-4">
                {[
                  'Expert team with diverse skill sets',
                  'Agile development methodology',
                  'Transparent communication',
                  '24/7 support and maintenance',
                  'Competitive pricing',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0" />
                    <span className="text-secondary-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-secondary-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Ready to Start?</h3>
              <p className="text-secondary-300 mb-6">
                Let's discuss your project and see how we can help transform your ideas into reality.
              </p>
              <Link to="/contact" className="btn btn-primary w-full">
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear about it. Drop us a line and let's 
            start the conversation.
          </p>
          <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
