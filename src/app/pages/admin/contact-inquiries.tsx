import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Mail, Trash2, Eye } from 'lucide-react';
import { contactApi } from '../../services/api';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  inquiryType: string;
  status: string;
  adminTag?: string | null;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ['NEW', 'READ', 'RESPONDED', 'CLOSED', 'PENDING', 'ONGOING', 'COMPLETED', 'NA'];

const badgeVariant = (status: string) => {
  if (status === 'NEW') return 'default';
  if (status === 'CLOSED' || status === 'NA') return 'secondary';
  if (status === 'COMPLETED' || status === 'RESPONDED') return 'outline';
  if (status === 'ONGOING' || status === 'PENDING') return 'secondary';
  return 'default';
};

export function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response: any = await contactApi.getAll({
        status: statusFilter,
        adminTag: tagFilter,
        search,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      });

      if (response?.success) {
        setInquiries(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setInquiries([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load inquiries');
      setInquiries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response: any = await contactApi.getStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load inquiry stats', error);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, tagFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchInquiries();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    inquiries.forEach((item) => {
      if (item.adminTag) tags.add(item.adminTag);
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [inquiries]);

  const handleView = async (inquiry: Inquiry) => {
    setIsDialogOpen(true);
    try {
      const response: any = await contactApi.getById(inquiry.id);
      if (response?.success && response?.data) {
        setSelectedInquiry(response.data);
      } else {
        setSelectedInquiry(inquiry);
      }
      await fetchInquiries();
      await fetchStats();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load inquiry details');
      setSelectedInquiry(inquiry);
    }
  };

  const handleUpdate = async (id: string, payload: { status?: string; adminTag?: string }) => {
    try {
      setSaving(true);
      const response: any = await contactApi.updateStatus(id, payload);
      if (response?.success) {
        toast.success('Inquiry updated');
        await fetchInquiries();
        await fetchStats();
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) =>
            prev
              ? {
                  ...prev,
                  status: payload.status || prev.status,
                  adminTag: payload.adminTag !== undefined ? payload.adminTag || null : prev.adminTag,
                }
              : prev
          );
        }
      } else {
        toast.error(response?.message || 'Failed to update inquiry');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      const response: any = await contactApi.delete(id);
      if (response?.success) {
        toast.success('Inquiry deleted');
        await fetchInquiries();
        await fetchStats();
        setIsDialogOpen(false);
      } else {
        toast.error(response?.message || 'Failed to delete inquiry');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete inquiry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-gray-600 mt-1">Track new inquiries with tags, filters, and status workflows</p>
        </div>
        <div className="text-sm text-gray-600">
          New: <span className="font-semibold">{stats?.byStatus?.new ?? 0}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, subject, or message"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Status filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagFilter} onValueChange={(value) => { setTagFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Tag filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {uniqueTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="updatedAt">Updated date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Loading inquiries...
                </TableCell>
              </TableRow>
            ) : inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className={inquiry.isNew ? 'bg-blue-50/50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {inquiry.isNew && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                      <span>{inquiry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{inquiry.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {inquiry.inquiryType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(inquiry.status) as any}>{inquiry.status}</Badge>
                  </TableCell>
                  <TableCell>{inquiry.adminTag || '-'}</TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(inquiry)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(inquiry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No inquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-gray-900">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-900">{selectedInquiry.email}</p>
                </div>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <Label>Phone</Label>
                  <p className="text-gray-900">{selectedInquiry.phone}</p>
                </div>
              )}
              <div>
                <Label>Subject</Label>
                <p className="text-gray-900">{selectedInquiry.subject}</p>
              </div>
              <div>
                <Label>Message</Label>
                <div className="bg-gray-50 p-4 rounded-lg mt-1">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(value) => handleUpdate(selectedInquiry.id, { status: value })}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inquiry-tag">Admin Tag (one word)</Label>
                  <Input
                    id="inquiry-tag"
                    value={selectedInquiry.adminTag || ''}
                    onChange={(e) =>
                      setSelectedInquiry((prev) =>
                        prev ? { ...prev, adminTag: e.target.value.replace(/\s+/g, '') } : prev
                      )
                    }
                    onBlur={() =>
                      handleUpdate(selectedInquiry.id, {
                        adminTag: (selectedInquiry.adminTag || '').trim() || '',
                      })
                    }
                    placeholder="pending, completed, ongoing, NA"
                    maxLength={32}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
