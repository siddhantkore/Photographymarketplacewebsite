import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Mail, Trash2, Eye } from 'lucide-react';
import { getToken } from '../../lib/auth';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: string;
  createdAt: string;
}

export function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      const url = statusFilter === 'all'
        ? `${import.meta.env.VITE_API_URL}/contact`
        : `${import.meta.env.VITE_API_URL}/contact?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);

    // Mark as read if it's new
    if (inquiry.status === 'NEW') {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/contact/${inquiry.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: 'READ' }),
        });
        fetchInquiries();
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status updated');
        fetchInquiries();
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Inquiry deleted');
        fetchInquiries();
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast.error('Failed to delete inquiry');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW': return 'default';
      case 'READ': return 'secondary';
      case 'RESPONDED': return 'default';
      case 'CLOSED': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage contact form submissions</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id} className={inquiry.status === 'NEW' ? 'bg-blue-50' : ''}>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell>{inquiry.subject}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {inquiry.inquiryType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                    {inquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(inquiry)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(inquiry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedInquiry.email}</p>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedInquiry.phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <p className="text-gray-900">{selectedInquiry.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg mt-1">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <Badge variant="outline" className="capitalize mt-1">
                    {selectedInquiry.inquiryType}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Update Status</label>
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(v) => handleUpdateStatus(selectedInquiry.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="RESPONDED">Responded</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
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
