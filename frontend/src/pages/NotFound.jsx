import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mt-4">
          Page Not Found
        </h2>
        <p className="text-secondary-600 mt-2 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/" className="btn btn-primary flex items-center justify-center gap-2">
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
