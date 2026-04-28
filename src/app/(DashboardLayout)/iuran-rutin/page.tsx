'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconSearch,
  IconRefresh,
  IconFilter,
  IconCheck,
  IconX,
  IconReceipt,
  IconUsers,
  IconCoins,
  IconCalendarPlus,
  IconUpload,
} from '@tabler/icons-react';
import {
  contributorsAPI,
  contributorBillsAPI,
  Contributor,
  ContributorBill,
  BillsSummary,
} from '@/services/api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const contributorTypes = [
  { value: 'RT', label: 'RT' },
  { value: 'RUKO', label: 'Ruko' },
  { value: 'LAINNYA', label: 'Lainnya' },
];

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i + 1);

export default function IuranRutinPage() {
  const { showError, showSuccess } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);

  // Bills state
  const [bills, setBills] = useState<ContributorBill[]>([]);
  const [billsMeta, setBillsMeta] = useState<PaginationMeta | null>(null);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billsPage, setBillsPage] = useState(0);
  const [billsRowsPerPage, setBillsRowsPerPage] = useState(10);

  // Bills filter
  const [filterStatus, setFilterStatus] = useState<'' | 'PAID' | 'UNPAID'>('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterContributorId, setFilterContributorId] = useState<number | ''>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Summary state
  const [summary, setSummary] = useState<BillsSummary | null>(null);

  // Contributors state
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [allContributors, setAllContributors] = useState<Contributor[]>([]);
  const [contributorsMeta, setContributorsMeta] = useState<PaginationMeta | null>(null);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  const [contributorsPage, setContributorsPage] = useState(0);
  const [contributorsRowsPerPage, setContributorsRowsPerPage] = useState(10);
  const [contributorSearch, setContributorSearch] = useState('');

  // Contributor dialog state
  const [openContributorDialog, setOpenContributorDialog] = useState(false);
  const [editingContributorId, setEditingContributorId] = useState<number | null>(null);
  const [isSubmittingContributor, setIsSubmittingContributor] = useState(false);
  const [contributorForm, setContributorForm] = useState({
    code: '',
    name: '',
    type: 'RT' as 'RT' | 'RUKO' | 'LAINNYA',
    amount: '',
    is_active: true,
    start_month: new Date().getMonth() + 1,
    start_year: new Date().getFullYear(),
    notes: '',
  });

  // Delete contributor dialog
  const [openDeleteContributorDialog, setOpenDeleteContributorDialog] = useState(false);
  const [deletingContributorId, setDeletingContributorId] = useState<number | null>(null);
  const [isDeletingContributor, setIsDeletingContributor] = useState(false);

  // Generate bills dialog
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);

  // Pay bill dialog
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [payingBillId, setPayingBillId] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [payDate, setPayDate] = useState<Dayjs | null>(dayjs());
  const [payNotes, setPayNotes] = useState('');
  const [payAttachment, setPayAttachment] = useState<File | null>(null);
  const [payAttachmentPreview, setPayAttachmentPreview] = useState<string | null>(null);

  // Action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuBillId, setMenuBillId] = useState<number | null>(null);
  const [contributorAnchorEl, setContributorAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContributorId, setMenuContributorId] = useState<number | null>(null);

  // Unpay loading state
  const [isUnpaying, setIsUnpaying] = useState(false);

  useEffect(() => {
    fetchAllContributors();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchBills();
    } else {
      fetchContributors();
    }
  }, [tabValue, billsPage, billsRowsPerPage, filterStatus, filterYear, filterMonth, filterContributorId, contributorsPage, contributorsRowsPerPage, contributorSearch]);

  useEffect(() => {
    fetchSummary();
  }, [filterYear]);

  const fetchAllContributors = async () => {
    try {
      const response = await contributorsAPI.getAll({ all: true, is_active: true });
      setAllContributors(response.data.data || []);
    } catch (err) {
      console.error('Error fetching all contributors:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await contributorBillsAPI.getSummary({ year: filterYear });
      setSummary(response.data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchBills = async () => {
    setBillsLoading(true);
    try {
      const params: any = {
        page: billsPage + 1,
        per_page: billsRowsPerPage,
      };
      if (filterStatus) params.status = filterStatus;
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;
      if (filterContributorId) params.contributor_id = filterContributorId;

      const response = await contributorBillsAPI.getAll(params);
      setBills(response.data.data || []);
      if (response.data.meta) {
        setBillsMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data tagihan');
    } finally {
      setBillsLoading(false);
    }
  };

  const fetchContributors = async () => {
    setContributorsLoading(true);
    try {
      const params: any = {
        page: contributorsPage + 1,
        per_page: contributorsRowsPerPage,
      };
      if (contributorSearch) params.search = contributorSearch;

      const response = await contributorsAPI.getAll(params);
      setContributors(response.data.data || []);
      if (response.data.meta) {
        setContributorsMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data contributor');
    } finally {
      setContributorsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (tabValue === 0) {
      fetchBills();
      fetchSummary();
    } else {
      fetchContributors();
      fetchAllContributors();
    }
  };

  // Contributor handlers
  const handleOpenContributorDialog = (contributor?: Contributor) => {
    if (contributor) {
      setEditingContributorId(contributor.id);
      setContributorForm({
        code: contributor.code,
        name: contributor.name,
        type: contributor.type,
        amount: contributor.amount.replace('.00', ''),
        is_active: contributor.is_active,
        start_month: contributor.start_month || new Date().getMonth() + 1,
        start_year: contributor.start_year || new Date().getFullYear(),
        notes: contributor.notes || '',
      });
    } else {
      setEditingContributorId(null);
      setContributorForm({
        code: '',
        name: '',
        type: 'RT',
        amount: '',
        is_active: true,
        start_month: new Date().getMonth() + 1,
        start_year: new Date().getFullYear(),
        notes: '',
      });
    }
    setOpenContributorDialog(true);
  };

  const handleCloseContributorDialog = () => {
    setOpenContributorDialog(false);
    setEditingContributorId(null);
  };

  const handleSubmitContributor = async () => {
    if (!contributorForm.code || !contributorForm.name || !contributorForm.amount) {
      showError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSubmittingContributor(true);
    try {
      const data = {
        code: contributorForm.code,
        name: contributorForm.name,
        type: contributorForm.type,
        amount: parseFloat(contributorForm.amount.replace(/\./g, '')),
        is_active: contributorForm.is_active,
        start_month: contributorForm.start_month,
        start_year: contributorForm.start_year,
        notes: contributorForm.notes || undefined,
      };

      if (editingContributorId) {
        await contributorsAPI.update(editingContributorId, data);
        showSuccess('Contributor berhasil diperbarui');
      } else {
        await contributorsAPI.create(data);
        showSuccess('Contributor berhasil ditambahkan');
      }
      handleCloseContributorDialog();
      fetchContributors();
      fetchAllContributors();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan contributor');
    } finally {
      setIsSubmittingContributor(false);
    }
  };

  const handleDeleteContributor = async () => {
    if (!deletingContributorId) return;
    setIsDeletingContributor(true);
    try {
      await contributorsAPI.delete(deletingContributorId);
      showSuccess('Contributor berhasil dihapus');
      setOpenDeleteContributorDialog(false);
      setDeletingContributorId(null);
      fetchContributors();
      fetchAllContributors();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus contributor');
    } finally {
      setIsDeletingContributor(false);
    }
  };

  // Generate bills handler
  const handleGenerateBills = async () => {
    setIsGenerating(true);
    try {
      const response = await contributorBillsAPI.generate({
        year: generateYear,
        month: generateMonth,
      });
      showSuccess(response.data.message);
      setOpenGenerateDialog(false);
      fetchBills();
      fetchSummary();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal generate tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Pay bill handler
  const handleOpenPayDialog = (billId: number) => {
    setPayingBillId(billId);
    setPayDate(dayjs());
    setPayNotes('');
    setPayAttachment(null);
    setPayAttachmentPreview(null);
    setOpenPayDialog(true);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showError('Format file harus JPG, JPEG, PNG, atau PDF');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Ukuran file maksimal 5MB');
        return;
      }
      setPayAttachment(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPayAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPayAttachmentPreview(null);
      }
    }
  };

  const handlePayBill = async () => {
    if (!payingBillId) return;
    setIsPaying(true);
    try {
      const formData = new FormData();
      if (payDate) {
        formData.append('paid_at', payDate.format('YYYY-MM-DD'));
      }
      if (payNotes) {
        formData.append('notes', payNotes);
      }
      if (payAttachment) {
        formData.append('attachment', payAttachment);
      }
      await contributorBillsAPI.pay(payingBillId, formData);
      showSuccess('Pembayaran berhasil dicatat');
      setOpenPayDialog(false);
      setPayingBillId(null);
      setPayAttachment(null);
      setPayAttachmentPreview(null);
      fetchBills();
      fetchSummary();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal mencatat pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  // Unpay bill handler
  const handleUnpayBill = async (billId: number) => {
    setIsUnpaying(true);
    try {
      await contributorBillsAPI.unpay(billId);
      showSuccess('Pembayaran berhasil dibatalkan');
      fetchBills();
      fetchSummary();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal membatalkan pembayaran');
    } finally {
      setIsUnpaying(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatThousand = (value: string) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
  };

  const parseThousand = (value: string) => {
    return value.replace(/\./g, '');
  };

  // Calculate current month totals from summary
  const currentMonthSummary = summary?.months.find(m => m.month === (filterMonth || new Date().getMonth() + 1));
  const yearTotals = summary?.totals;

  return (
    <PageContainer title="Iuran Rutin" description="Kelola iuran rutin dan tagihan">
      <Box mt={3}>
        {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconReceipt size={32} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Tagihan {filterYear}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {yearTotals ? formatCurrency(yearTotals.total_amount) : '-'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {yearTotals?.total_bills || 0} tagihan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconCheck size={32} color="green" />
                  <Box>
                    <Typography variant="body2" color="success.dark">
                      Sudah Bayar {filterYear}
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="success.dark">
                      {yearTotals ? formatCurrency(yearTotals.paid_amount) : '-'}
                    </Typography>
                    <Typography variant="caption" color="success.dark">
                      {yearTotals?.paid_count || 0} tagihan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconX size={32} color="red" />
                  <Box>
                    <Typography variant="body2" color="error.dark">
                      Belum Bayar {filterYear}
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="error.dark">
                      {yearTotals ? formatCurrency(yearTotals.unpaid_amount) : '-'}
                    </Typography>
                    <Typography variant="caption" color="error.dark">
                      {yearTotals?.unpaid_count || 0} tagihan
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'info.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconUsers size={32} color="blue" />
                  <Box>
                    <Typography variant="body2" color="info.dark">
                      Total Contributor
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="info.dark">
                      {allContributors.length}
                    </Typography>
                    <Typography variant="caption" color="info.dark">
                      Contributor aktif
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Daftar Tagihan" icon={<IconReceipt size={18} />} iconPosition="start" />
              <Tab label="Daftar Contributor" icon={<IconUsers size={18} />} iconPosition="start" />
            </Tabs>

            {/* Bills Tab */}
            {tabValue === 0 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                  <Typography variant="h5" fontWeight={600}>
                    Daftar Tagihan
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<IconCalendarPlus size={18} />}
                      onClick={() => setOpenGenerateDialog(true)}
                    >
                      Generate Tagihan
                    </Button>
                  </Box>
                </Box>

                {/* Filter Section */}
                <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<IconFilter size={18} />}
                    onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  >
                    Filter
                  </Button>
                  <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                    slotProps={{ paper: { sx: { p: 2, minWidth: 300 } } }}
                  >
                    <Box display="flex" flexDirection="column" gap={2}>
                      <CustomSelect
                        value={filterStatus}
                        onChange={(e: any) => {
                          setFilterStatus(e.target.value);
                          setBillsPage(0);
                        }}
                        fullWidth
                      >
                        <MenuItem value="">Semua Status</MenuItem>
                        <MenuItem value="PAID">Sudah Bayar</MenuItem>
                        <MenuItem value="UNPAID">Belum Bayar</MenuItem>
                      </CustomSelect>
                      <Box display="flex" gap={1}>
                        <CustomSelect
                          value={filterMonth}
                          onChange={(e: any) => {
                            setFilterMonth(e.target.value);
                            setBillsPage(0);
                          }}
                          sx={{ flex: 1 }}
                        >
                          <MenuItem value="">Semua Bulan</MenuItem>
                          {months.map((m) => (
                            <MenuItem key={m.value} value={m.value}>
                              {m.label}
                            </MenuItem>
                          ))}
                        </CustomSelect>
                        <CustomSelect
                          value={filterYear}
                          onChange={(e: any) => {
                            setFilterYear(e.target.value);
                            setBillsPage(0);
                          }}
                          sx={{ flex: 1 }}
                        >
                          {years.map((y) => (
                            <MenuItem key={y} value={y}>
                              {y}
                            </MenuItem>
                          ))}
                        </CustomSelect>
                      </Box>
                      <CustomSelect
                        value={filterContributorId}
                        onChange={(e: any) => {
                          setFilterContributorId(e.target.value);
                          setBillsPage(0);
                        }}
                        fullWidth
                      >
                        <MenuItem value="">Semua Contributor</MenuItem>
                        {allContributors.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </MenuItem>
                        ))}
                      </CustomSelect>
                    </Box>
                  </Menu>

                  {/* Active filters */}
                  {(filterStatus || filterMonth || filterContributorId) && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {filterStatus && (
                        <Chip
                          label={filterStatus === 'PAID' ? 'Sudah Bayar' : 'Belum Bayar'}
                          size="small"
                          onDelete={() => setFilterStatus('')}
                        />
                      )}
                      {filterMonth && (
                        <Chip
                          label={months.find(m => m.value === filterMonth)?.label}
                          size="small"
                          onDelete={() => setFilterMonth('')}
                        />
                      )}
                      {filterContributorId && (
                        <Chip
                          label={allContributors.find(c => c.id === filterContributorId)?.name}
                          size="small"
                          onDelete={() => setFilterContributorId('')}
                        />
                      )}
                    </Box>
                  )}

                  <Box flexGrow={1} />
                  <Button
                    variant="outlined"
                    startIcon={<IconRefresh size={18} />}
                    onClick={handleRefresh}
                  >
                    Refresh
                  </Button>
                </Box>

                {/* Bills Table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contributor</TableCell>
                        <TableCell>Periode</TableCell>
                        <TableCell align="right">Nominal</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Tanggal Bayar</TableCell>
                        <TableCell align="center" sx={{ width: 80 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billsLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(6)].map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : bills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Belum ada data tagihan
                          </TableCell>
                        </TableRow>
                      ) : (
                        bills.map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {bill.contributor?.code}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {bill.contributor?.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {months.find(m => m.value === bill.month_bill)?.label} {bill.year_bill}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(bill.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={bill.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                                color={bill.status === 'PAID' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {bill.paid_at ? dayjs(bill.paid_at).format('DD MMM YYYY') : '-'}
                            </TableCell>
                            <TableCell align="center">
                              {bill.status === 'UNPAID' ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenPayDialog(bill.id)}
                                >
                                  Bayar
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => handleUnpayBill(bill.id)}
                                  disabled={isUnpaying}
                                >
                                  Batal
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={billsMeta?.total || 0}
                  page={billsPage}
                  onPageChange={(_, newPage) => setBillsPage(newPage)}
                  rowsPerPage={billsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setBillsRowsPerPage(parseInt(e.target.value, 10));
                    setBillsPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Baris per halaman:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
                  }
                />
              </>
            )}

            {/* Contributors Tab */}
            {tabValue === 1 && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight={600}>
                    Daftar Contributor
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={18} />}
                    onClick={() => handleOpenContributorDialog()}
                  >
                    Tambah Contributor
                  </Button>
                </Box>

                <Box display="flex" gap={2} mb={3} alignItems="center">
                  <CustomTextField
                    placeholder="Cari contributor..."
                    value={contributorSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setContributorSearch(e.target.value);
                      setContributorsPage(0);
                    }}
                    sx={{ maxWidth: 300 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box flexGrow={1} />
                  <Button
                    variant="outlined"
                    startIcon={<IconRefresh size={18} />}
                    onClick={handleRefresh}
                  >
                    Refresh
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Kode</TableCell>
                        <TableCell>Nama</TableCell>
                        <TableCell>Tipe</TableCell>
                        <TableCell align="right">Iuran/Bulan</TableCell>
                        <TableCell>Mulai Berlaku</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contributorsLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(7)].map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : contributors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            Belum ada data contributor
                          </TableCell>
                        </TableRow>
                      ) : (
                        contributors.map((contributor) => (
                          <TableRow key={contributor.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {contributor.code}
                              </Typography>
                            </TableCell>
                            <TableCell>{contributor.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={contributor.type}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(contributor.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {contributor.start_month && contributor.start_year
                                ? `${months.find(m => m.value === contributor.start_month)?.label} ${contributor.start_year}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={contributor.is_active ? 'Aktif' : 'Nonaktif'}
                                color={contributor.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={(e) => {
                                  setContributorAnchorEl(e.currentTarget);
                                  setMenuContributorId(contributor.id);
                                }}
                              >
                                <IconDotsVertical size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={contributorsMeta?.total || 0}
                  page={contributorsPage}
                  onPageChange={(_, newPage) => setContributorsPage(newPage)}
                  rowsPerPage={contributorsRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setContributorsRowsPerPage(parseInt(e.target.value, 10));
                    setContributorsPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Baris per halaman:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
                  }
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Contributor Menu */}
        <Menu
          anchorEl={contributorAnchorEl}
          open={Boolean(contributorAnchorEl)}
          onClose={() => {
            setContributorAnchorEl(null);
            setMenuContributorId(null);
          }}
        >
          <MenuItem
            onClick={() => {
              const contributor = contributors.find(c => c.id === menuContributorId);
              if (contributor) handleOpenContributorDialog(contributor);
              setContributorAnchorEl(null);
            }}
          >
            <IconEdit size={18} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeletingContributorId(menuContributorId);
              setOpenDeleteContributorDialog(true);
              setContributorAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Hapus
          </MenuItem>
        </Menu>

        {/* Contributor Dialog */}
        <Dialog
          open={openContributorDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              handleCloseContributorDialog();
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingContributorId ? 'Edit Contributor' : 'Tambah Contributor'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel>Kode *</CustomFormLabel>
              <CustomTextField
                placeholder="Contoh: RT-01, RUKO-A1"
                fullWidth
                value={contributorForm.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContributorForm({ ...contributorForm, code: e.target.value })
                }
              />

              <CustomFormLabel>Nama *</CustomFormLabel>
              <CustomTextField
                placeholder="Nama contributor"
                fullWidth
                value={contributorForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContributorForm({ ...contributorForm, name: e.target.value })
                }
              />

              <CustomFormLabel>Tipe *</CustomFormLabel>
              <CustomSelect
                value={contributorForm.type}
                onChange={(e: any) => setContributorForm({ ...contributorForm, type: e.target.value })}
                fullWidth
              >
                {contributorTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </CustomSelect>

              <CustomFormLabel>Iuran per Bulan *</CustomFormLabel>
              <CustomTextField
                placeholder="Nominal iuran"
                fullWidth
                value={formatThousand(contributorForm.amount)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContributorForm({ ...contributorForm, amount: parseThousand(e.target.value) })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
              />

              <CustomFormLabel>Mulai Berlaku</CustomFormLabel>
              <Box display="flex" gap={2}>
                <CustomSelect
                  value={contributorForm.start_month}
                  onChange={(e: any) => setContributorForm({ ...contributorForm, start_month: e.target.value })}
                  sx={{ flex: 1 }}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </CustomSelect>
                <CustomSelect
                  value={contributorForm.start_year}
                  onChange={(e: any) => setContributorForm({ ...contributorForm, start_year: e.target.value })}
                  sx={{ flex: 1 }}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>

              <CustomFormLabel>Catatan</CustomFormLabel>
              <CustomTextField
                placeholder="Catatan (opsional)"
                fullWidth
                multiline
                rows={2}
                value={contributorForm.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContributorForm({ ...contributorForm, notes: e.target.value })
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={contributorForm.is_active}
                    onChange={(e) => setContributorForm({ ...contributorForm, is_active: e.target.checked })}
                  />
                }
                label="Status Aktif"
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContributorDialog} disabled={isSubmittingContributor}>
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitContributor}
              disabled={isSubmittingContributor}
              startIcon={isSubmittingContributor ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmittingContributor ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Contributor Dialog */}
        <Dialog
          open={openDeleteContributorDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isDeletingContributor) {
              setOpenDeleteContributorDialog(false);
            }
          }}
        >
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus contributor ini? Tagihan yang belum dibayar akan ikut terhapus.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteContributorDialog(false)} disabled={isDeletingContributor}>
              Batal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteContributor}
              disabled={isDeletingContributor}
              startIcon={isDeletingContributor ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isDeletingContributor ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Generate Bills Dialog */}
        <Dialog
          open={openGenerateDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isGenerating) {
              setOpenGenerateDialog(false);
            }
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Generate Tagihan</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Generate tagihan untuk semua contributor aktif yang memenuhi syarat.
              </Typography>
              <CustomFormLabel>Periode</CustomFormLabel>
              <Box display="flex" gap={2}>
                <CustomSelect
                  value={generateMonth}
                  onChange={(e: any) => setGenerateMonth(e.target.value)}
                  sx={{ flex: 1 }}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </CustomSelect>
                <CustomSelect
                  value={generateYear}
                  onChange={(e: any) => setGenerateYear(e.target.value)}
                  sx={{ flex: 1 }}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGenerateDialog(false)} disabled={isGenerating}>
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleGenerateBills}
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Pay Bill Dialog */}
        <Dialog
          open={openPayDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isPaying) {
              setOpenPayDialog(false);
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Catat Pembayaran</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel>Tanggal Bayar</CustomFormLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={payDate}
                  onChange={(newValue) => setPayDate(newValue)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </LocalizationProvider>

              <CustomFormLabel>Catatan</CustomFormLabel>
              <CustomTextField
                placeholder="Catatan pembayaran (opsional)"
                fullWidth
                multiline
                rows={2}
                value={payNotes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayNotes(e.target.value)}
              />

              <CustomFormLabel>Bukti Transfer (Opsional)</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' },
                }}
                onClick={() => document.getElementById('pay-attachment-input')?.click()}
              >
                <input
                  id="pay-attachment-input"
                  type="file"
                  hidden
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleAttachmentChange}
                />
                {payAttachmentPreview ? (
                  <Box>
                    <img
                      src={payAttachmentPreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" mt={1}>
                      {payAttachment?.name}
                    </Typography>
                  </Box>
                ) : payAttachment ? (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {payAttachment.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Klik untuk upload bukti transfer
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Format: JPG, PNG, PDF (Max 5MB)
                    </Typography>
                  </Box>
                )}
              </Box>
              {payAttachment && (
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPayAttachment(null);
                    setPayAttachmentPreview(null);
                  }}
                  sx={{ mt: 1 }}
                >
                  Hapus File
                </Button>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPayDialog(false)} disabled={isPaying}>
              Batal
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handlePayBill}
              disabled={isPaying}
              startIcon={isPaying ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isPaying ? 'Memproses...' : 'Bayar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
