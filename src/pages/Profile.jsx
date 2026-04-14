import { useState, useEffect, useMemo } from 'react'
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useUploadAvatarMutation } from '../store/apis/userSlice'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/common/ui/Button'
import Title from '~/components/common/Title'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { toDateInputFormat } from '~/utils/dateHelpers'
import { useDispatch } from 'react-redux'
import { setUser } from '~/store/slices/authSlice'

const DEFAULT_AVATAR = '/images/avatar-default.jpg'

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

    if (!formData.displayname.trim()) {
      newErrors.displayname = t('profile.errors.displayNameRequired')
    } else if (formData.displayname.length < 3) {
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
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-heritage' />
      </div>
    )
  }

  return (
    <div className='w-full lcn-container-x animate-fade-in pt-navbar-mobile sm:pt-navbar'>
      <div className='rounded-xl overflow-hidden'>
        {/* Header */}
        <div className='relative bg-gradient-to-r from-heritage-light to-accent p-6 sm:p-8 flex flex-col sm:flex-row justify-between'>
          <div>
            <Title title={t('profile.title')} />
            <p className='text-muted-foreground mt-2'>{t('profile.subtitle')}</p>
          </div>
          <div className='mt-4 sm:mt-0'>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>{t('profile.edit')}</Button>
            )}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 sm:p-8 space-y-8'>
          <div className='flex flex-col sm:flex-row items-center gap-6 pb-6 border-b'>
            <div className='relative group'>
              <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-sm'>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={formData.displayname || 'User'}
                    loading='lazy'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      if (e.target.src !== DEFAULT_AVATAR) {
                        e.target.src = DEFAULT_AVATAR
                      }
                    }}
                  />
                ) : (
                  <div className='w-full h-full bg-gray-300 flex items-center justify-center text-white text-2xl font-bold'>
                    {formData.displayname
                      ? formData.displayname
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0].toUpperCase())
                        .join('')
                      : 'NA'}
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
                <div className='absolute -top-2 -right-2 bg-heritage text-white rounded-full w-6 h-6 flex items-center justify-center'>
                  <Check size={14} />
                </div>
              )}
            </div>
            <h3 className='text-xl font-semibold'>{user.displayname || 'User'}</h3>
          </div>

          {/* Personal Info */}
          <div className='space-y-6'>
            <h3 className='text-lg font-medium text-heritage-dark'>{t('profile.personalInfo')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label htmlFor='displayname' className='block text-sm font-medium text-foreground'>
                  {t('profile.displayName')}
                </label>
                <input
                  type='text'
                  id='displayname'
                  name='displayname'
                  value={formData.displayname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-4 px-3 py-2 bg-background border ${errors.displayname ? 'border-destructive' : ''
                    } rounded-md disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
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
                <label htmlFor='gender' className='block text-sm font-medium text-foreground'>
                  {t('profile.gender')}
                </label>
                <select
                  id='gender'
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className='w-full px-3 py-2 bg-background border rounded-md disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring transition-colors'
                  aria-label='Select gender'
                >
                  <option value='other'>{t('profile.genderOptions.other')}</option>
                  <option value='men'>{t('profile.genderOptions.men')}</option>
                  <option value='woman'>{t('profile.genderOptions.woman')}</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label htmlFor='phone' className='block text-sm font-medium text-foreground'>
                  {t('profile.phone')}
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-4 px-3 py-2 bg-background border ${errors.phone ? 'border-destructive' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed transition-colors`}
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
                <label htmlFor='dateOfBirth' className='block text-sm font-medium text-foreground'>
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
                  className='w-full pl-4 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-70 disabled:cursor-not-allowed transition-colors'
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className='flex justify-end gap-4 pt-4 border-t border-border'>
              <Button type='button' onClick={handleCancel} variant='outline' className='flex items-center gap-2'>
                <X size={16} />
                <span>{t('profile.cancel')}</span>
              </Button>
              <Button
                type='submit'
                disabled={isUpdating || isUploadingAvatar}
                className='flex items-center gap-2'
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
  )
}

export default UserProfile