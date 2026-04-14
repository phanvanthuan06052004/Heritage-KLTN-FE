import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Label } from '~/components/common/ui/Label'
import { Input } from '~/components/common/ui/Input'
import { useGetUserByIdQuery, useUpdateUserMutation } from '~/store/apis/userSlice'
import { toast } from 'react-toastify'

const UserDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: user, isLoading, isError, error } = useGetUserByIdQuery(id)
    const [updateUser, { isLoading: isUpdating, isSuccess: updateSuccess, isError: updateError, error: updateErrorMessage }] = useUpdateUserMutation()
    const [formData, setFormData] = useState({
        displayname: '',
        role: '',
        phone: '',
        gender: '',
        isActive: false,
    })

    useEffect(() => {
        if (user) {
            setFormData({
                displayname: user.displayname || '',
                role: user.role || 'user',
                phone: user.phone || '',
                gender: user.gender || 'other',
                isActive: user.account?.isActive || false, // Initialize isActive
            })
        }
    }, [user])

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Update successful!')
            navigate('/admin/users')
        }
        if (updateError) {
            console.error('Update error:', updateErrorMessage)
            toast.error(`Update failed: ${updateErrorMessage?.data?.message || 'Unknown error'}`)
        }
    }, [updateSuccess, updateError, updateErrorMessage, navigate])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleStatusChange = (e) => {
        setFormData({ ...formData, isActive: e.target.checked })
    }

    const handleUpdate = () => {
        // Restructure data to match database schema
        const updateData = {
            ...formData,
            account: {
                isActive: formData.isActive // Move isActive into account object
            }
        }

        console.log(updateData);

        // Remove isActive from root level
        delete updateData.isActive

        updateUser({ id, ...updateData })
    }

    if (isLoading) return <div className="text-center">Loading...</div>
    if (isError) return <div className="text-center text-red-500">Error loading data: {error?.data?.message || error.error}</div>
    if (!user) return <div className="text-center">User not found.</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">User Details</h2>
            <div className="bg-white p-6 rounded-md shadow-md">
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
                            className="w-full p-2 border rounded"
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
                            className="w-full p-2 border rounded"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="men">Nam</option>
                            <option value="woman">Woman</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Add Account Status field */}
                    <div className="col-span-2">
                        <Label htmlFor="accountStatus">Account Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="accountStatus"
                                checked={formData.isActive}
                                onChange={handleStatusChange}
                                className="w-4 h-4 text-heritage border-gray-300 rounded focus:ring-heritage"
                            />
                            <span className={`px-2 py-1 rounded-full text-xs ${formData.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {formData.isActive ? 'Active' : 'Locked'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.isActive
                                ? 'Account is active and can login'
                                : 'Account is locked and cannot login'
                            }
                        </p>
                    </div>

                    {/* Verification Status - Read Only */}
                    <div className="col-span-2">
                        <Label>Verification Status</Label>
                        <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${user?.account?.isVerified
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {user?.account?.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>

                    {/* Creation and Update Info */}
                    <div className="col-span-2 pt-4 border-t">
                        <div className="flex flex-col space-y-2 text-sm text-gray-500">
                            <p>Created at: {new Date(user?.createAt).toLocaleString('vi-VN')}</p>
                            <p>Last updated: {new Date(user?.updatedAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex space-x-4">
                    <Button onClick={handleUpdate} disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update'}
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
