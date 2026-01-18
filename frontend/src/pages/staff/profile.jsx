import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FiUser, FiSave, FiCamera } from 'react-icons/fi'

const StaffProfile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getStaffProfile()
        setProfile(response.data)
        reset({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          phone: response.data.phone || '',
          position: response.data.position || '',
          bio: response.data.bio || '',
          website: response.data.profile?.website || '',
          linkedin: response.data.profile?.linkedin || '',
          twitter: response.data.profile?.twitter || '',
          github: response.data.profile?.github || '',
          department: response.data.profile?.department || '',
          public_email: response.data.profile?.public_email || false,
          public_phone: response.data.profile?.public_phone || false,
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [reset])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const response = await userAPI.updateStaffProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        position: data.position,
        bio: data.bio,
        profile: {
          website: data.website,
          linkedin: data.linkedin,
          twitter: data.twitter,
          github: data.github,
          department: data.department,
          public_email: data.public_email,
          public_phone: data.public_phone,
        },
      })
      
      setProfile(response.data)
      updateUser(response.data)
      toast.success('Profile updated successfully')
      reset(data)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">My Profile</h1>
        <p className="text-secondary-600 mt-1">Manage your personal information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-6">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="w-12 h-12 text-primary-300" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-secondary-900">{profile?.full_name}</h3>
              <p className="text-secondary-500">{profile?.email}</p>
              <button type="button" className="btn btn-secondary btn-sm mt-2 flex items-center gap-2">
                <FiCamera className="w-4 h-4" />
                Change Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label">First Name</label>
              <input
                type="text"
                {...register('first_name')}
                className="input"
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label className="label">Last Name</label>
              <input
                type="text"
                {...register('last_name')}
                className="input"
                placeholder="Doe"
              />
            </div>

            <div className="form-group">
              <label className="label">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="label">Position</label>
              <input
                type="text"
                {...register('position')}
                className="input"
                placeholder="Software Developer"
              />
            </div>

            <div className="form-group">
              <label className="label">Department</label>
              <input
                type="text"
                {...register('department')}
                className="input"
                placeholder="Engineering"
              />
            </div>
          </div>

          <div className="form-group mt-6">
            <label className="label">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="input resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label">Website</label>
              <input
                type="url"
                {...register('website')}
                className="input"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-group">
              <label className="label">LinkedIn</label>
              <input
                type="url"
                {...register('linkedin')}
                className="input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label className="label">Twitter</label>
              <input
                type="url"
                {...register('twitter')}
                className="input"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="form-group">
              <label className="label">GitHub</label>
              <input
                type="url"
                {...register('github')}
                className="input"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Privacy Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('public_email')}
                className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-secondary-700">Show email on public profile</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('public_phone')}
                className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-secondary-700">Show phone number on public profile</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="btn btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="spinner w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default StaffProfile
