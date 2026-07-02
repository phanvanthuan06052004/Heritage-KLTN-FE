import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Label } from '~/components/common/ui/Label'
import { Input } from '~/components/common/ui/Input'
import {
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useUploadAvatarMutation,
} from '~/store/apis/userSlice'
import { toast } from 'react-toastify'
import { Camera } from 'lucide-react'
import { toDateInputFormat } from '~/utils/dateHelpers'

const DEFAULT_AVATAR = '/images/avatar-default.jpg'

const UserDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: user, isLoading, isError, error } = useGetUserByIdQuery(id)
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation()
    const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation()

    const [formData, setFormData] = useState({
        displayname: '',
        role: 'user',
        phone: '',
        gender: 'other',
        dateOfBirth: '',
        walletAddress: '',
        avatar: '',
        isActive: false,
    })
    const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR)
    const [avatarFile, setAvatarFile] = useState(null)

    useEffect(() => {
        if (user) {
            setFormData({
                displayname: user.displayname || '',
                role: user.role || 'user',
                phone: user.phone || '',
                gender: user.gender || 'other',
                dateOfBirth: user.dateOfBirth ? toDateInputFormat(user.dateOfBirth) : '',
                walletAddress: user.walletAddress || '',
                avatar: user.avatar || '',
                isActive: user.account?.isActive ?? user.isActive ?? false,
            })
            setAvatarPreview(user.avatar || DEFAULT_AVATAR)
            setAvatarFile(null)
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleStatusChange = (e) => {
        setFormData({ ...formData, isActive: e.target.checked })
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 1024 * 1024) {
            toast.error('Image must be 1MB or smaller')
            return
        }
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowed.includes(file.type)) {
            toast.error('Invalid image type')
            return
        }
        const reader = new FileReader()
        reader.onload = () => {
            setAvatarPreview(reader.result)
            setAvatarFile(file)
        }
        reader.readAsDataURL(file)
    }

    const handleUpdate = async () => {
        try {
            let avatarUrl = formData.avatar
            if (avatarFile) {
                const fd = new FormData()
                fd.append('image', avatarFile)
                const uploaded = await uploadAvatar(fd).unwrap()
                avatarUrl = uploaded?.imageUrl || avatarUrl
            }

            const payload = {
                displayname: formData.displayname,
                role: formData.role,
                phone: formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth || null,
                walletAddress: formData.walletAddress || undefined,
                avatar: avatarUrl || null,
                account: { isActive: formData.isActive },
            }

            await updateUser({ id, ...payload }).unwrap()
            toast.success('Update successful!')
            navigate('/admin/users')
        } catch (err) {
            console.error('Update error:', err)
            toast.error(`Update failed: ${err?.data?.message || 'Unknown error'}`)
        }
    }

    if (isLoading) return <div className="text-center text-muted-foreground">Loading...</div>
    if (isError) return <div className="text-center text-destructive">Error loading data: {error?.data?.message || error.error}</div>
    if (!user) return <div className="text-center text-muted-foreground">User not found.</div>

    const submitting = isUpdating || isUploadingAvatar

    return (
        <div className="space-y-6">
            <div>
                <h2 className="admin-page-title">User Details</h2>
                <p className="admin-subtle">Edit profile, role, and account status.</p>
            </div>
            <div className="admin-card-body">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-muted">
                            <img
                                src={avatarPreview || DEFAULT_AVATAR}
                                alt={formData.displayname || 'User avatar'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    if (e.target.src !== DEFAULT_AVATAR) e.target.src = DEFAULT_AVATAR
                                }}
                            />
                        </div>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="w-6 h-6 text-white" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{formData.displayname || user?.account?.email}</p>
                        <p className="text-sm text-muted-foreground">{user?.account?.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="displayname">Display Name</Label>
                        <Input
                            type="text"
                            id="displayname"
                            name="displayname"
                            value={formData.displayname}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" value={user?.account?.email || ''} disabled />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            name="role"
                            className="admin-select"
                            value={formData.role}
                            onChange={handleInputChange}
                        >
                            <option value="user">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                            id="gender"
                            name="gender"
                            className="admin-select"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="men">Men</option>
                            <option value="woman">Woman</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="walletAddress">Wallet Address</Label>
                        <Input
                            type="text"
                            id="walletAddress"
                            name="walletAddress"
                            value={formData.walletAddress}
                            placeholder="0x..."
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="col-span-2">
                        <Label htmlFor="accountStatus">Account Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="accountStatus"
                                checked={formData.isActive}
                                onChange={handleStatusChange}
                                className="admin-checkbox"
                            />
                            <span className={formData.isActive ? 'admin-badge-success' : 'admin-badge-danger'}>
                                {formData.isActive ? 'Active' : 'Locked'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formData.isActive
                                ? 'Account is active and can login'
                                : 'Account is locked and cannot login'}
                        </p>
                    </div>

                    <div className="col-span-2">
                        <Label>Verification Status</Label>
                        <div className="mt-2">
                            <span className={user?.account?.isVerified ? 'admin-badge-info' : 'admin-badge-warning'}>
                                {user?.account?.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-2 pt-4 admin-divider">
                        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                            <p>Created at: {user?.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '—'}</p>
                            <p>Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString('vi-VN') : '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-3">
                    <Button onClick={handleUpdate} disabled={submitting}>
                        {submitting ? 'Updating...' : 'Update'}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/admin/users')}>
                        Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UserDetail
