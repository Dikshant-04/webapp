import { useState, useEffect } from 'react'
import { analyticsAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { FiMail, FiCheck, FiTrash2, FiEye, FiX, FiInbox, FiCheckCircle } from 'react-icons/fi'

const AdminContacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [filter, setFilter] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'unread') params.is_read = 'false'
      if (filter === 'unreplied') params.is_replied = 'false'

      const [contactsRes, statsRes] = await Promise.all([
        analyticsAPI.getContacts(params),
        analyticsAPI.getContactStats(),
      ])
      setContacts(contactsRes.data.results || contactsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const handleMarkReplied = async (id) => {
    try {
      await analyticsAPI.markContactReplied(id)
      setContacts(contacts.map((c) => (c.id === id ? { ...c, is_replied: true } : c)))
      if (selectedContact?.id === id) {
        setSelectedContact({ ...selectedContact, is_replied: true })
      }
      toast.success('Marked as replied')
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await analyticsAPI.deleteContact(id)
      setContacts(contacts.filter((c) => c.id !== id))
      if (selectedContact?.id === id) setSelectedContact(null)
      toast.success('Contact deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const viewContact = async (contact) => {
    setSelectedContact(contact)
    if (!contact.is_read) {
      try {
        await analyticsAPI.getContact(contact.id)
        setContacts(contacts.map((c) => (c.id === contact.id ? { ...c, is_read: true } : c)))
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">Contact Submissions</h1>
        <p className="text-secondary-600 mt-1">Manage contact form submissions</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiMail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-secondary-500">Total</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiInbox className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unread}</p>
                <p className="text-sm text-secondary-500">Unread</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FiX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreplied}</p>
                <p className="text-sm text-secondary-500">Unreplied</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.this_week}</p>
                <p className="text-sm text-secondary-500">This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          {['', 'unread', 'unreplied'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {f === '' ? 'All' : f === 'unread' ? 'Unread' : 'Unreplied'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact List */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : contacts.length > 0 ? (
            <div className="divide-y divide-secondary-200 max-h-[600px] overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => viewContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-secondary-50 ${
                    selectedContact?.id === contact.id ? 'bg-primary-50' : ''
                  } ${!contact.is_read ? 'border-l-4 border-primary-600' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-medium truncate ${!contact.is_read ? 'text-secondary-900' : 'text-secondary-700'}`}>
                        {contact.name}
                      </p>
                      <p className="text-sm text-secondary-500 truncate">{contact.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {contact.is_replied && (
                        <span className="badge badge-success text-xs">Replied</span>
                      )}
                      <span className="text-xs text-secondary-400">
                        {format(new Date(contact.created_at), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FiMail className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">No contacts</h3>
              <p className="text-secondary-600">No contact submissions found</p>
            </div>
          )}
        </div>

        {/* Contact Detail */}
        <div className="card p-6">
          {selectedContact ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">{selectedContact.name}</h2>
                  <p className="text-secondary-500">{selectedContact.email}</p>
                  {selectedContact.phone && (
                    <p className="text-secondary-500">{selectedContact.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!selectedContact.is_replied && (
                    <button
                      onClick={() => handleMarkReplied(selectedContact.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Mark as replied"
                    >
                      <FiCheck className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-secondary-500 mb-1">Subject</p>
                <p className="font-medium text-secondary-900">{selectedContact.subject}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-secondary-500 mb-1">Message</p>
                <p className="text-secondary-700 whitespace-pre-wrap bg-secondary-50 p-4 rounded-lg">
                  {selectedContact.message}
                </p>
              </div>

              <div className="text-sm text-secondary-500">
                Received: {format(new Date(selectedContact.created_at), 'MMM d, yyyy h:mm a')}
              </div>

              {!selectedContact.is_replied && (
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="btn btn-primary mt-6 w-full"
                >
                  Reply via Email
                </a>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-secondary-500">
              <div className="text-center">
                <FiEye className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                <p>Select a contact to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminContacts
