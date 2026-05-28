import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/common/ui/Button'
import { Input } from '~/components/common/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/common/ui/Table'
import { Search, Trash2, Edit } from 'lucide-react'
import { toast } from 'react-toastify'
import { useDeleteKnowledgeTestMutation, useGetKnowledgeTestsQuery } from '~/store/apis/knowledgeTestApi'

const KnowledgeTestManagement = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [page, setPage] = useState(1)

    const { data, isLoading, isError, error } = useGetKnowledgeTestsQuery({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
    })

    const [deleteKnowledgeTest] = useDeleteKnowledgeTestMutation()

    const tests = data?.results || []
    const pagination = data?.pagination || {}
    const totalItems = pagination.totalItems || 0
    const currentPage = pagination.currentPage || page
    const totalPages = pagination.totalPages || 1

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this knowledge test?')) {
            try {
                await deleteKnowledgeTest(id).unwrap()
                toast.success('Knowledge test deleted successfully!')
            } catch (err) {
                console.error('Error deleting knowledge test:', err)
                toast.error(`Failed to delete knowledge test: ${err?.data?.message || 'Unknown error'}`)
            }
        }
    }

    if (isLoading) return <div className="text-center text-muted-foreground">Loading...</div>
    if (isError)
        return (
            <div className="text-center text-destructive">
                Error: {error?.data?.message || 'Unable to load knowledge test list'}
            </div>
        )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="admin-page-title">Knowledge Test Management</h2>
                    <p className="admin-subtle">Create and manage tests linked to heritage sites.</p>
                </div>
                <span className="admin-badge-neutral">{totalItems} tests</span>
            </div>

            <div className="admin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search by title"
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
                    <Button onClick={() => navigate('/admin/knowledge-tests/new')}>
                        Add Knowledge Test
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Heritage ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created at</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.length === 0 && (
                        <TableRow hoverable={false}>
                            <TableCell className="text-center text-muted-foreground py-10" colSpan={5}>
                                No knowledge tests found.
                            </TableCell>
                        </TableRow>
                    )}
                    {tests.map((test) => (
                        <TableRow key={test._id}>
                            <TableCell maxWidth="250px">
                                <span className="font-medium text-foreground">{test.title}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{test.heritageId}</TableCell>
                            <TableCell>
                                <span className={test.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-neutral'}>
                                    {test.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(`/admin/knowledge-tests/${test._id}`)}
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(test._id)}
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
                <p className="admin-subtle">Total: {totalItems} knowledge tests</p>
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

export default KnowledgeTestManagement
