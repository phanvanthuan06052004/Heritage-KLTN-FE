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


    if (isLoading) return <div className="text-center">Loading...</div>
    if (isError)
        return (
            <div className="text-center text-red-500">
                Lỗi: {error?.data?.message || 'Không thể tải danh sách di tích'}
            </div>
        )

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Heritage Site Management</h2>
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Input
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex space-x-4">
                    <select
                        className="p-2 border rounded"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All</option>
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
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {heritages.map((heritage) => (
                        <TableRow key={heritage._id}>
                            <TableCell maxWidth='250px'>{heritage.name}</TableCell>
                            <TableCell>{heritage.location}</TableCell>
                            <TableCell>{heritage.status === 'ACTIVE' ? 'Active' : 'Inactive'}</TableCell>
                            <TableCell>
                                {new Date(heritage.createdAt).toLocaleDateString('en-US')}
                            </TableCell>
                            <TableCell className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/heritages/${heritage._id}`)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(heritage._id)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <p>Total: {totalItems} heritage sites</p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    {totalPages > 0 && (
                        <span>Page {currentPage} / {totalPages}</span>
                    )}
                    <Button
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
