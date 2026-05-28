import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Input } from '~/components/common/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/common/ui/Table'
import { Search, Trash2, Edit } from 'lucide-react'
import { useDeleteHeritageMutation, useGetHeritagesQuery } from '~/store/apis/heritageApi'
import { toast } from 'react-toastify'

const HeritageManagement = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [page, setPage] = useState(1)

    const { data, isLoading, isError, error } = useGetHeritagesQuery({
        page,
        limit: 10,
        name: searchTerm,
        status: statusFilter,
    })

    const [deleteHeritage] = useDeleteHeritageMutation()

    const heritages = data?.heritages || []
    const pagination = data?.pagination || {}
    const totalItems = pagination.totalItems || 0
    const currentPage = pagination.currentPage || page
    const totalPages = pagination.totalPages || 1

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this heritage site?')) {
            try {
                await deleteHeritage(id).unwrap()
                toast.success('Heritage site deleted successfully!')
            } catch (err) {
                console.error('Error deleting heritage site:', err)
                toast.error(`Failed to delete heritage site: ${err?.data?.message || 'Unknown error'}`)
            }
        }
    }


    if (isLoading) return <div className="text-center text-muted-foreground">Loading...</div>
    if (isError)
        return (
            <div className="text-center text-destructive">
                Error: {error?.data?.message || 'Unable to load heritage sites'}
            </div>
        )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="admin-page-title">Heritage Site Management</h2>
                    <p className="admin-subtle">Manage heritage sites and their metadata.</p>
                </div>
                <span className="admin-badge-neutral">{totalItems} sites</span>
            </div>

            <div className="admin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="admin-select md:w-40"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                    <Button onClick={() => navigate('/admin/heritages/new')}>
                        Add Heritage
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Heritage Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created at</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {heritages.length === 0 && (
                        <TableRow hoverable={false}>
                            <TableCell className="text-center text-muted-foreground py-10" colSpan={5}>
                                No heritage sites found.
                            </TableCell>
                        </TableRow>
                    )}
                    {heritages.map((heritage) => (
                        <TableRow key={heritage._id}>
                            <TableCell maxWidth='250px'>
                                <span className="font-medium text-foreground">{heritage.name}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{heritage.location}</TableCell>
                            <TableCell>
                                <span className={heritage.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-neutral'}>
                                    {heritage.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(heritage.createdAt).toLocaleDateString('en-US')}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(`/admin/heritages/${heritage._id}`)}
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(heritage._id)}
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
                <p className="admin-subtle">Total: {totalItems} heritage sites</p>
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

export default HeritageManagement
