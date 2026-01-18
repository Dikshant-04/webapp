import { Link } from 'react-router-dom'
import {
  FiCode,
  FiSmartphone,
  FiCloud,
  FiLayout,
  FiDatabase,
  FiShield,
  FiTrendingUp,
  FiHeadphones,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi'

const Services = () => {
  const services = [
    {
      icon: FiCode,
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies like React, Vue, Django, and Node.js. We deliver responsive, scalable, and performant solutions.',
      features: [
        'Single Page Applications (SPA)',
        'Progressive Web Apps (PWA)',
        'E-commerce Solutions',
        'Content Management Systems',
        'API Development',
      ],
    },
    {
      icon: FiSmartphone,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile applications for iOS and Android using React Native, Flutter, and native technologies.',
      features: [
        'iOS App Development',
        'Android App Development',
        'Cross-Platform Solutions',
        'App Store Optimization',
        'Mobile UI/UX Design',
      ],
    },
    {
      icon: FiCloud,
      title: 'Cloud Solutions',
      description: 'Scalable cloud infrastructure and services on AWS, Google Cloud, and Azure. We help you leverage the power of cloud computing.',
      features: [
        'Cloud Architecture Design',
        'Migration Services',
        'DevOps & CI/CD',
        'Serverless Solutions',
        'Cost Optimization',
      ],
    },
    {
      icon: FiLayout,
      title: 'UI/UX Design',
      description: 'User-centered design that creates engaging digital experiences. We focus on usability, accessibility, and visual appeal.',
      features: [
        'User Research',
        'Wireframing & Prototyping',
        'Visual Design',
        'Design Systems',
        'Usability Testing',
      ],
    },
    {
      icon: FiDatabase,
      title: 'Database Solutions',
      description: 'Robust database design and management for your applications. We work with SQL and NoSQL databases.',
      features: [
        'Database Design',
        'Performance Optimization',
        'Data Migration',
        'Backup & Recovery',
        'Real-time Databases',
      ],
    },
    {
      icon: FiShield,
      title: 'Security Services',
      description: 'Comprehensive security solutions to protect your applications and data from threats.',
      features: [
        'Security Audits',
        'Penetration Testing',
        'Compliance Implementation',
        'Identity Management',
        'Encryption Solutions',
      ],
    },
  ]

  const processSteps = [
    {
      step: '01',
      title: 'Discovery',
      description: 'We learn about your business, goals, and requirements through detailed discussions.',
    },
    {
      step: '02',
      title: 'Planning',
      description: 'We create a comprehensive project plan with timelines, milestones, and deliverables.',
    },
    {
      step: '03',
      title: 'Development',
      description: 'Our team builds your solution using agile methodology with regular updates.',
    },
    {
      step: '04',
      title: 'Testing',
      description: 'Rigorous testing ensures quality, performance, and security before launch.',
    },
    {
      step: '05',
      title: 'Deployment',
      description: 'We deploy your solution with zero downtime and proper documentation.',
    },
    {
      step: '06',
      title: 'Support',
      description: 'Ongoing maintenance and support to keep your solution running smoothly.',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary-900 to-secondary-800 text-white py-20">
        <div className="container-custom px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-lg text-secondary-300">
              Comprehensive software development services to help your business thrive in the digital age.
              We combine technical expertise with business understanding.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                      <FiCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-secondary-50">
        <div className="container-custom px-4">
          <div className="text-center mb-12">
            <h2 className="page-title">Our Process</h2>
            <p className="page-subtitle max-w-2xl mx-auto">
              A proven approach to delivering successful projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((item, index) => (
              <div key={index} className="card p-6">
                <span className="text-4xl font-bold text-primary-200">{item.step}</span>
                <h3 className="text-lg font-semibold text-secondary-900 mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-secondary-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="text-center mb-12">
            <h2 className="page-title">Technologies We Use</h2>
            <p className="page-subtitle max-w-2xl mx-auto">
              Modern tech stack for modern solutions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Python',
              'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS',
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-secondary-50 rounded-lg p-4 text-center font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600 text-white">
        <div className="container-custom px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Let's discuss your requirements and create a custom solution that fits your needs.
          </p>
          <Link
            to="/contact"
            className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 inline-flex items-center gap-2"
          >
            Get in Touch
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Support Section */}
      <section className="section bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <FiHeadphones className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                24/7 Support
              </h2>
              <p className="text-secondary-600 mb-6">
                We provide round-the-clock support to ensure your systems run smoothly.
                Our dedicated team is always ready to help you with any technical issues.
              </p>
              <ul className="space-y-3">
                {[
                  'Technical Support',
                  'Bug Fixes & Updates',
                  'Performance Monitoring',
                  'Security Patches',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-secondary-700">
                    <FiCheckCircle className="w-5 h-5 text-primary-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-secondary-50 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <FiTrendingUp className="w-12 h-12 text-primary-600" />
                <div>
                  <h3 className="text-2xl font-bold text-secondary-900">99.9%</h3>
                  <p className="text-secondary-600">Uptime Guarantee</p>
                </div>
              </div>
              <p className="text-secondary-600 mb-6">
                We guarantee high availability for all our hosted solutions with
                proactive monitoring and rapid response times.
              </p>
              <Link to="/contact" className="btn btn-primary w-full">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
