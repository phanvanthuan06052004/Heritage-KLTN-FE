import { useState, useEffect, useMemo } from 'react'
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useUploadAvatarMutation } from '../store/apis/userSlice'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/common/ui/Button'
import { Camera, Check, Loader2, UserRound, X, Stamp, Key } from 'lucide-react'
import { toDateInputFormat } from '~/utils/dateHelpers'
import { useDispatch } from 'react-redux'
import { setUser } from '~/store/slices/authSlice'
import PassportCollection from './HeritagePassport/PassportCollection'
import McpTokenManager from './McpTokenManager'

const DEFAULT_AVATAR = '/images/avatar-default.jpg'
const fieldBaseClass =
  'w-full rounded-xl border border-museum-gold/20 bg-museum-black/45 px-4 py-3 text-sm text-museum-ivory transition-colors placeholder:text-museum-muted/70 focus:border-museum-gold-light focus:outline-none focus:ring-2 focus:ring-museum-gold/25 disabled:cursor-not-allowed disabled:opacity-70'

const UserProfile = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { data: user } = useGetUserProfileQuery()

  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation()
  const initialFormData = useMemo(
    () => ({
      displayname: user?.displayname || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? toDateInputFormat(user?.dateOfBirth) : '',
      avatar: user?.avatar || DEFAULT_AVATAR,
    }),
    [user]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [profileTab, setProfileTab] = useState('info')
  const userId = user?._id || user?.id
  const [formData, setFormData] = useState(initialFormData)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || DEFAULT_AVATAR)
  const [isAvatarChanged, setIsAvatarChanged] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [errors, setErrors] = useState({})

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error(t('profile.messages.imageSizeExceeded'))
        return
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        toast.error(t('profile.messages.imageTypeInvalid'))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result
        setAvatarPreview(dataUrl)
        setAvatarFile(file)
        setIsAvatarChanged(true)
        toast.info(t('profile.messages.avatarUpdateInfo'), {
          position: 'top-right',
        })
      }
      reader.onerror = () => {
        toast.error(t('profile.messages.unableToReadImage'))
      }
      reader.readAsDataURL(file)
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors = {}

    if (formData.displayname.trim() && formData.displayname.length < 3) {
      newErrors.displayname = t('profile.errors.displayNameMinLength')
    }

    if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = t('profile.errors.phoneInvalid')
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) errorElement.focus()
      toast.error(t('profile.errors.checkInfo'))
    }

    return Object.keys(newErrors).length === 0
  }

  // Handle form submission with avatar upload
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      let avatarUrl = formData.avatar
      // Upload new avatar if changed
      if (isAvatarChanged && avatarFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', avatarFile)
        const avatar = await uploadAvatar(formDataUpload).unwrap()
        avatarUrl = avatar?.imageUrl
      }
      // Update user profile
      const updateData = {
        ...formData,
        avatar: avatarUrl,
        dateOfBirth: formData.dateOfBirth === '' ? null : formData.dateOfBirth,
      }
      // Unwrap to get data from API
      const updatedUser = await updateUserProfile(updateData).unwrap()

      // Dispatch action to update Redux store
      dispatch(setUser(updatedUser))
      setIsEditing(false)
      setIsAvatarChanged(false)
      setAvatarFile(null)
      setAvatarPreview(avatarUrl || DEFAULT_AVATAR)

      toast.success(t('profile.messages.updateSuccess'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } catch (err) {
      toast.error(`${t('profile.messages.updateFailed')}: ${err?.data?.message || err.message || t('common.error')}`)
    }
  }

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    setFormData(initialFormData)
    setAvatarPreview(user?.avatar || DEFAULT_AVATAR)
    setIsAvatarChanged(false)
    setAvatarFile(null)
    setErrors({})
  }

  // Update form data when user changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData(initialFormData)
      setAvatarPreview(user.avatar || DEFAULT_AVATAR)
    }
  }, [user, initialFormData, isEditing])

  if (!user) {
    return (
      <section className='museum-shell flex min-h-screen items-center justify-center pt-navbar-mobile sm:pt-navbar'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-museum-gold-light' />
          <p className='text-sm text-museum-muted'>Loading your profile...</p>
        </div>
      </section>
    )
  }

  return (
    <section className='museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar '>
      <div className='lcn-container-x relative animate-fade-in pb-14 mt-10'>
        <div className='pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent' />
        <div className='overflow-hidden rounded-3xl border border-museum-gold/20 bg-museum-ivory/5 shadow-museum-card backdrop-blur-xl'>
          {/* Header */}
          <div className='relative flex flex-col justify-between gap-5 border-b border-museum-gold/15 bg-museum-black/35 p-6 sm:flex-row sm:p-8'>
            <div>
              <span className='mb-4 inline-flex items-center gap-2 rounded-full border border-museum-gold/30 bg-museum-gold/10 px-4 py-1.5 text-xs font-semibold uppercase text-museum-gold-light'>
                <span className='h-1.5 w-1.5 rounded-full bg-museum-gold-light' />
                {t('nav.profile')}
              </span>
              <h1 className='font-display text-3xl font-semibold leading-tight text-museum-ivory sm:text-4xl'>
                {t('profile.title')}
              </h1>
              <p className='mt-3 text-sm leading-7 text-museum-muted sm:text-base'>{t('profile.subtitle')}</p>
            </div>
            <div className='sm:self-start'>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className='rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'
                >
                  {t('profile.edit')}
                </Button>
              )}
            </div>
          </div>

        {/* Tabs */}
        <div className='flex gap-1 border-b border-museum-gold/15 px-6 sm:px-8'>
          <button
            type='button'
            onClick={() => setProfileTab('info')}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              profileTab === 'info'
                ? 'border-museum-gold text-museum-gold-light'
                : 'border-transparent text-museum-muted hover:text-museum-parchment'
            }`}
          >
            <UserRound className='h-4 w-4' /> {t('profile.personalInfo')}
          </button>
          <button
            type='button'
            onClick={() => setProfileTab('passport')}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              profileTab === 'passport'
                ? 'border-museum-gold text-museum-gold-light'
                : 'border-transparent text-museum-muted hover:text-museum-parchment'
            }`}
          >
            <Stamp className='h-4 w-4' /> Hộ chiếu di sản
          </button>
          <button
            type='button'
            onClick={() => setProfileTab('mcp')}
            className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              profileTab === 'mcp'
                ? 'border-museum-gold text-museum-gold-light'
                : 'border-transparent text-museum-muted hover:text-museum-parchment'
            }`}
          >
            <Key className='h-4 w-4' /> {t('profile.mcp.tabTitle')}
          </button>
        </div>

        {profileTab === 'passport' && (
          <div className='p-6 sm:p-8'>
            <PassportCollection userId={userId} />
          </div>
        )}

        {profileTab === 'mcp' && (
          <div className='p-6 sm:p-8'>
            <McpTokenManager />
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className={`space-y-8 p-6 text-museum-ivory sm:p-8 ${profileTab === 'info' ? '' : 'hidden'}`}>
          <div className='flex flex-col items-center gap-6 border-b border-museum-gold/15 pb-7 sm:flex-row'>
            <div className='relative group'>
              <div className='h-24 w-24 overflow-hidden rounded-full border-4 border-museum-gold/35 bg-museum-black/40 shadow-museum-gold sm:h-32 sm:w-32'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.displayname || user.email || 'User'}
                    loading='lazy'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      if (e.target.src !== DEFAULT_AVATAR) {
                        e.target.src = DEFAULT_AVATAR
                      }
                    }}
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-museum-gold/10 text-2xl font-bold text-museum-gold-light'>
                    {formData.displayname
                      ? formData.displayname
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0].toUpperCase())
                        .join('')
                      : <UserRound className='h-10 w-10' />}
                  </div>
                )}
              </div>
              {isEditing && (
                <label
                  htmlFor='avatar-upload'
                  className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                >
                  <Camera size={32} className='text-white' />
                  <input
                    id='avatar-upload'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleAvatarChange}
                    aria-label='Upload avatar'
                  />
                </label>
              )}
              {isAvatarChanged && isEditing && (
                <div className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-museum-gold text-museum-black'>
                  <Check size={14} />
                </div>
              )}
            </div>
            <h3 className='font-display text-2xl font-semibold text-museum-ivory'>
              {user.displayname || user.email || 'User'}
            </h3>
          </div>

          {/* Personal Info */}
          <div className='space-y-6'>
            <h3 className='font-display text-2xl font-semibold text-museum-gold-light'>{t('profile.personalInfo')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label htmlFor='displayname' className='block text-sm font-medium text-museum-gold-light'>
                  {t('profile.displayName')}
                </label>
                <input
                  type='text'
                  id='displayname'
                  name='displayname'
                  value={formData.displayname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`${fieldBaseClass} ${errors.displayname ? 'border-museum-seal' : ''}`}
                  placeholder={t('profile.placeholders.displayName')}
                  aria-required='true'
                  aria-invalid={!!errors.displayname}
                  aria-describedby={errors.displayname ? 'displayname-error' : undefined}
                />
                {errors.displayname && (
                  <p id='displayname-error' className='text-sm text-destructive'>
                    {errors.displayname}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <label htmlFor='gender' className='block text-sm font-medium text-museum-gold-light'>
                  {t('profile.gender')}
                </label>
                <select
                  id='gender'
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={fieldBaseClass}
                  aria-label='Select gender'
                >
                  <option value='other'>{t('profile.genderOptions.other')}</option>
                  <option value='men'>{t('profile.genderOptions.men')}</option>
                  <option value='woman'>{t('profile.genderOptions.woman')}</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label htmlFor='phone' className='block text-sm font-medium text-museum-gold-light'>
                  {t('profile.phone')}
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`${fieldBaseClass} ${errors.phone ? 'border-museum-seal' : ''}`}
                  placeholder={t('profile.placeholders.phone')}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p id='phone-error' className='text-sm text-destructive'>
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <label htmlFor='dateOfBirth' className='block text-sm font-medium text-museum-gold-light'>
                  {t('profile.dateOfBirth')}
                </label>
                <input
                  type='date'
                  id='dateOfBirth'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  aria-label='Select date of birth'
                  className={fieldBaseClass}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className='flex justify-end gap-4 border-t border-museum-gold/15 pt-4'>
              <Button
                type='button'
                onClick={handleCancel}
                variant='outline'
                className='flex items-center gap-2 rounded-full border-museum-gold/35 bg-museum-ivory/8 text-museum-ivory hover:bg-museum-ivory/15'
              >
                <X size={16} />
                <span>{t('profile.cancel')}</span>
              </Button>
              <Button
                type='submit'
                disabled={isUpdating || isUploadingAvatar}
                className='flex items-center gap-2 rounded-full bg-museum-gold text-museum-black hover:bg-museum-gold-light'
              >
                {(isUpdating || isUploadingAvatar) ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>{t('profile.saving')}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{t('profile.save')}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
        </div>
      </div>
    </section>
  )
}

export default UserProfile
