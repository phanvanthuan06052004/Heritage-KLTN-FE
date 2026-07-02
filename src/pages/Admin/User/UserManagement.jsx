import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Input } from '~/components/common/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/common/ui/Table'
import { Search, Trash2, Edit, UserCog } from 'lucide-react'
import { useGetAllQuery, useDeleteUserMutation } from '~/store/apis/userSlice'
import { toast } from 'react-toastify'

const UserManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, error } = useGetAllQuery({
    page,
    limit,
    search: searchTerm,
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
  })

  const [deleteUser] = useDeleteUserMutation()

  const users = data?.users || []
  const pagination = data?.pagination || {}
  const totalItems = pagination.totalItems || 0
  const currentPage = pagination.currentPage || page
  const totalPages = pagination.totalPages || 1

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap()
        toast.success('User deleted successfully!')
      } catch (err) {
        console.error('Error deleting user:', err)
        toast.error('Failed to delete user!')
      }
    }
  }

  if (isLoading) return <div className="text-center text-muted-foreground">Loading...</div>
  if (isError) return <div className="text-center text-destructive">Error: {error?.data?.message || 'Unable to load user list'}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-lg bg-heritage/10 text-heritage">
            <UserCog className="w-5 h-5" />
          </span>
          <div>
            <h2 className="admin-page-title">User Management</h2>
            <p className="admin-subtle">Manage users, roles, and account status.</p>
          </div>
        </div>
        <span className="admin-badge-neutral">{totalItems} users</span>
      </div>

      <div className="admin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="admin-select md:w-40"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow hoverable={false}>
                <TableCell className="text-center text-muted-foreground py-10" colSpan={7}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-border"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium ring-1 ring-border">
                        {user.displayname?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <span className="font-medium text-foreground">{user.displayname || '—'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.account?.email || user.email || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{user.phone || '—'}</TableCell>
                <TableCell>
                  <span className={user.role === 'admin' ? 'admin-badge-info' : 'admin-badge-neutral'}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={user.account?.isActive ? 'admin-badge-success' : 'admin-badge-danger'}>
                    {user.account?.isActive ? 'Active' : 'Locked'}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user._id)}
                      title="Delete"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="admin-subtle">Total: {totalItems} users</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          {totalPages > 0 && (
            <span className="admin-subtle">Page {currentPage} / {totalPages}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
