import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { analyticsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiGithub,
} from 'react-icons/fi'

const Contact = () => {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await analyticsAPI.submitContact(data)
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: FiMapPin,
      title: 'Address',
      details: ['123 Tech Street', 'Silicon Valley, CA 94025', 'United States'],
    },
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    },
    {
      icon: FiMail,
      title: 'Email',
      details: ['info@projectspd.com', 'support@projectspd.com'],
    },
    {
      icon: FiClock,
      title: 'Business Hours',
      details: ['Monday - Friday: 9AM - 6PM', 'Saturday: 10AM - 4PM', 'Sunday: Closed'],
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-primary-100">
              Have a question or want to work together? We'd love to hear from you.
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card p-6 md:p-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="form-group">
                      <label className="label">Full Name *</label>
                      <input
                        type="text"
                        {...register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters',
                          },
                        })}
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="error-message">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="label">Email Address *</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="error-message">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div className="form-group">
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Subject */}
                    <div className="form-group">
                      <label className="label">Subject *</label>
                      <input
                        type="text"
                        {...register('subject', {
                          required: 'Subject is required',
                        })}
                        className={`input ${errors.subject ? 'input-error' : ''}`}
                        placeholder="How can we help?"
                      />
                      {errors.subject && (
                        <p className="error-message">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="label">Message *</label>
                    <textarea
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters',
                        },
                      })}
                      rows={6}
                      className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                      placeholder="Tell us about your project or inquiry..."
                    />
                    {errors.message && (
                      <p className="error-message">{errors.message.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner w-5 h-5" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <div className="card p-6 mb-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900">{item.title}</h4>
                        {item.details.map((detail, i) => (
                          <p key={i} className="text-secondary-600 text-sm">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <FiFacebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 hover:bg-sky-200 transition-colors"
                  >
                    <FiTwitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-700 hover:bg-secondary-200 transition-colors"
                  >
                    <FiGithub className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="bg-secondary-100">
        <div className="container-custom px-4 py-8">
          <div className="bg-secondary-200 rounded-xl h-64 md:h-96 flex items-center justify-center">
            <div className="text-center">
              <FiMapPin className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
              <p className="text-secondary-500">Map placeholder - Integrate Google Maps here</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: 'What is your typical project timeline?',
                  a: 'Project timelines vary based on scope and complexity. A simple website might take 2-4 weeks, while a complex web application could take 3-6 months. We provide detailed timelines during the planning phase.',
                },
                {
                  q: 'Do you provide ongoing support?',
                  a: "Yes! We offer various support packages including bug fixes, updates, and maintenance. We believe in building long-term relationships with our clients.",
                },
                {
                  q: 'How do you handle project communication?',
                  a: 'We use agile methodology with regular sprint reviews and daily standups. You will have a dedicated project manager and access to our project management tools for real-time updates.',
                },
                {
                  q: 'What are your payment terms?',
                  a: 'We typically work with a milestone-based payment structure. A deposit is required to begin work, with remaining payments tied to project milestones.',
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group card p-4 cursor-pointer"
                >
                  <summary className="font-medium text-secondary-900 list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-primary-600 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-4 text-secondary-600 text-sm">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
