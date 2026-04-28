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
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUpload,
  IconDotsVertical,
  IconSearch,
  IconRefresh,
  IconFilter,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconWallet,
  IconReportMoney,
} from '@tabler/icons-react';
import { transactionsAPI, Transaction, TransactionType, TransactionBalance, TransactionSummary } from '@/services/api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export default function KeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [balance, setBalance] = useState<TransactionBalance | null>(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useSnackbar();

  // Filter state
  const [search, setSearch] = useState('');
  const [filterMutation, setFilterMutation] = useState<'' | 'IN' | 'OUT'>('');
  const [filterTypeId, setFilterTypeId] = useState<number | ''>('');
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>(new Date().getFullYear());

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mutation: 'IN' as 'IN' | 'OUT',
    type_id: '',
    amount: '',
    transaction_date: dayjs() as Dayjs | null,
    description: '',
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<number | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Tab state for types management
  const [tabValue, setTabValue] = useState(0);
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingType, setIsSubmittingType] = useState(false);

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

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  useEffect(() => {
    fetchTransactionTypes();
    fetchBalance();
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [page, rowsPerPage, search, filterMutation, filterTypeId, filterMonth, filterYear]);

  const fetchTransactionTypes = async () => {
    try {
      const response = await transactionsAPI.getTypes({ active_only: false });
      setTransactionTypes(response.data.data || []);
    } catch (err) {
      console.error('Error fetching transaction types:', err);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await transactionsAPI.getBalance();
      setBalance(response.data.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const params: any = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const response = await transactionsAPI.getSummary(params);
      setSummary(response.data.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (search) params.search = search;
      if (filterMutation) params.mutation = filterMutation;
      if (filterTypeId) params.type_id = filterTypeId;
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;

      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
    fetchBalance();
    fetchSummary();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (data?: Transaction) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        mutation: data.mutation,
        type_id: String(data.type_id),
        amount: data.amount,
        transaction_date: dayjs(data.transaction_date),
        description: data.description || '',
      });
      setAttachmentPreview(data.attachment || null);
    } else {
      setEditingId(null);
      setFormData({
        mutation: 'IN',
        type_id: '',
        amount: '',
        transaction_date: dayjs(),
        description: '',
      });
      setAttachmentPreview(null);
    }
    setAttachmentFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.type_id || !formData.amount || !formData.transaction_date) {
      showError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();

      if (!editingId) {
        // Only send these fields for new transactions
        submitFormData.append('mutation', formData.mutation);
        submitFormData.append('type_id', formData.type_id);
        submitFormData.append('amount', formData.amount);
        submitFormData.append('transaction_date', formData.transaction_date.format('YYYY-MM-DD HH:mm:ss'));
      }

      submitFormData.append('description', formData.description);

      if (attachmentFile) {
        submitFormData.append('attachment', attachmentFile);
      }

      if (editingId) {
        await transactionsAPI.update(editingId, submitFormData);
        showSuccess('Transaksi berhasil diperbarui');
      } else {
        await transactionsAPI.create(submitFormData);
        showSuccess('Transaksi berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchTransactions();
      fetchBalance();
      fetchSummary();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await transactionsAPI.delete(deletingId);
      showSuccess('Transaksi berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchTransactions();
      fetchBalance();
      fetchSummary();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus transaksi');
    } finally {
      setIsDeleting(false);
    }
  };

  // Type management handlers
  const handleOpenTypeDialog = (type?: TransactionType) => {
    if (type) {
      setEditingTypeId(type.id);
      setTypeName(type.name);
    } else {
      setEditingTypeId(null);
      setTypeName('');
    }
    setOpenTypeDialog(true);
  };

  const handleCloseTypeDialog = () => {
    setOpenTypeDialog(false);
    setEditingTypeId(null);
    setTypeName('');
  };

  const handleSubmitType = async () => {
    if (!typeName.trim()) {
      showError('Nama tipe tidak boleh kosong');
      return;
    }

    setIsSubmittingType(true);
    try {
      if (editingTypeId) {
        await transactionsAPI.updateType(editingTypeId, { name: typeName });
        showSuccess('Tipe transaksi berhasil diperbarui');
      } else {
        await transactionsAPI.createType({ name: typeName });
        showSuccess('Tipe transaksi berhasil ditambahkan');
      }
      handleCloseTypeDialog();
      fetchTransactionTypes();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan tipe transaksi');
    } finally {
      setIsSubmittingType(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tipe transaksi ini?')) return;
    try {
      await transactionsAPI.deleteType(id);
      showSuccess('Tipe transaksi berhasil dihapus');
      fetchTransactionTypes();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus tipe transaksi');
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

  // Format number with thousand separator (1.000.000)
  const formatThousand = (value: string) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(num));
  };

  // Parse formatted number back to raw number
  const parseThousand = (value: string) => {
    return value.replace(/\./g, '');
  };

  return (
    <PageContainer title="Kelola Kas" description="Kelola keuangan dan transaksi RW">
      <Box mt={3}>
        {/* Balance & Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconWallet size={40} />
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Saldo Saat Ini
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {balance ? formatCurrency(balance.balance) : '-'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconArrowDownLeft size={32} color="green" />
                  <Box>
                    <Typography variant="body2" color="success.dark">
                      Total Pemasukan {filterMonth ? months.find(m => m.value === filterMonth)?.label : ''} {filterYear}
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="success.dark">
                      {summary ? formatCurrency(summary.total_in) : '-'}
                    </Typography>
                    <Typography variant="caption" color="success.dark">
                      {summary?.count_in || 0} transaksi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconArrowUpRight size={32} color="red" />
                  <Box>
                    <Typography variant="body2" color="error.dark">
                      Total Pengeluaran {filterMonth ? months.find(m => m.value === filterMonth)?.label : ''} {filterYear}
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="error.dark">
                      {summary ? formatCurrency(summary.total_out) : '-'}
                    </Typography>
                    <Typography variant="caption" color="error.dark">
                      {summary?.count_out || 0} transaksi
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Daftar Transaksi" />
              <Tab label="Tipe Transaksi" />
            </Tabs>

            {tabValue === 0 && (
              <>
                {/* Header & Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight={600}>
                    Daftar Transaksi
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={18} />}
                    onClick={() => handleOpenDialog()}
                  >
                    Tambah Transaksi
                  </Button>
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
                      <CustomTextField
                        placeholder="Cari transaksi..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconSearch size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <CustomSelect
                        value={filterMutation}
                        onChange={(e: any) => {
                          setFilterMutation(e.target.value);
                          setPage(0);
                        }}
                        fullWidth
                      >
                        <MenuItem value="">Semua Jenis</MenuItem>
                        <MenuItem value="IN">Pemasukan</MenuItem>
                        <MenuItem value="OUT">Pengeluaran</MenuItem>
                      </CustomSelect>
                      <CustomSelect
                        value={filterTypeId}
                        onChange={(e: any) => {
                          setFilterTypeId(e.target.value);
                          setPage(0);
                        }}
                        fullWidth
                      >
                        <MenuItem value="">Semua Tipe</MenuItem>
                        {transactionTypes.filter(t => t.is_active).map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </CustomSelect>
                      <Box display="flex" gap={1}>
                        <CustomSelect
                          value={filterMonth}
                          onChange={(e: any) => {
                            setFilterMonth(e.target.value);
                            setPage(0);
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
                            setPage(0);
                          }}
                          sx={{ flex: 1 }}
                        >
                          <MenuItem value="">Semua Tahun</MenuItem>
                          {years.map((y) => (
                            <MenuItem key={y} value={y}>
                              {y}
                            </MenuItem>
                          ))}
                        </CustomSelect>
                      </Box>
                    </Box>
                  </Menu>

                  {/* Active filters display */}
                  {(filterMutation || filterTypeId || filterMonth) && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {filterMutation && (
                        <Chip
                          label={filterMutation === 'IN' ? 'Pemasukan' : 'Pengeluaran'}
                          size="small"
                          onDelete={() => setFilterMutation('')}
                        />
                      )}
                      {filterTypeId && (
                        <Chip
                          label={transactionTypes.find(t => t.id === filterTypeId)?.name}
                          size="small"
                          onDelete={() => setFilterTypeId('')}
                        />
                      )}
                      {filterMonth && (
                        <Chip
                          label={months.find(m => m.value === filterMonth)?.label}
                          size="small"
                          onDelete={() => setFilterMonth('')}
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

                {/* Table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID Settlement</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Jenis</TableCell>
                        <TableCell>Tipe</TableCell>
                        <TableCell>Keterangan</TableCell>
                        <TableCell align="right">Nominal</TableCell>
                        <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(7)].map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            Belum ada data transaksi
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {item.id_settlement}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {dayjs(item.transaction_date).format('DD MMM YYYY HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.mutation === 'IN' ? 'Masuk' : 'Keluar'}
                                color={item.mutation === 'IN' ? 'success' : 'error'}
                                size="small"
                                icon={item.mutation === 'IN' ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                              />
                            </TableCell>
                            <TableCell>{item.type?.name || '-'}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                {item.description || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={item.mutation === 'IN' ? 'success.main' : 'error.main'}
                              >
                                {item.mutation === 'IN' ? '+' : '-'} {formatCurrency(item.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
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
                  count={meta?.total || 0}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Baris per halaman:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
                  }
                />
              </>
            )}

            {tabValue === 1 && (
              <>
                {/* Transaction Types Management */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight={600}>
                    Tipe Transaksi
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={18} />}
                    onClick={() => handleOpenTypeDialog()}
                  >
                    Tambah Tipe
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nama</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center" sx={{ width: 120 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactionTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.id}</TableCell>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={type.is_active ? 'Aktif' : 'Nonaktif'}
                              color={type.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleOpenTypeDialog(type)}>
                              <IconEdit size={18} />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteType(type.id)} color="error">
                              <IconTrash size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Transaction Dialog */}
        <Dialog
          open={openDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              handleCloseDialog();
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {!editingId && (
                <>
                  <CustomFormLabel>Jenis Transaksi *</CustomFormLabel>
                  <CustomSelect
                    value={formData.mutation}
                    onChange={(e: any) => setFormData({ ...formData, mutation: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="IN">Pemasukan (Masuk)</MenuItem>
                    <MenuItem value="OUT">Pengeluaran (Keluar)</MenuItem>
                  </CustomSelect>

                  <CustomFormLabel>Tipe Transaksi *</CustomFormLabel>
                  <CustomSelect
                    value={formData.type_id}
                    onChange={(e: any) => {
                      if (e.target.value === '__add_new__') {
                        handleOpenTypeDialog();
                        return;
                      }
                      setFormData({ ...formData, type_id: e.target.value });
                    }}
                    fullWidth
                  >
                    <MenuItem value="">Pilih Tipe</MenuItem>
                    {transactionTypes.filter(t => t.is_active).map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                    <MenuItem value="__add_new__" sx={{ borderTop: 1, borderColor: 'divider', mt: 1, color: 'primary.main' }}>
                      <IconPlus size={16} style={{ marginRight: 8 }} />
                      Tambah Tipe Baru
                    </MenuItem>
                  </CustomSelect>

                  <CustomFormLabel>Nominal *</CustomFormLabel>
                  <CustomTextField
                    placeholder="Masukkan nominal"
                    fullWidth
                    value={formatThousand(formData.amount)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const rawValue = parseThousand(e.target.value);
                      setFormData({ ...formData, amount: rawValue });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    }}
                  />

                  <CustomFormLabel>Tanggal & Waktu *</CustomFormLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      value={formData.transaction_date}
                      onChange={(newValue) => setFormData({ ...formData, transaction_date: newValue })}
                      ampm={false}
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}

              <CustomFormLabel>Keterangan</CustomFormLabel>
              <CustomTextField
                placeholder="Masukkan keterangan"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
              />

              <CustomFormLabel>Bukti Transaksi</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => document.getElementById('attachment-input')?.click()}
              >
                <input
                  id="attachment-input"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentFile(file);
                      if (file.type.startsWith('image/')) {
                        setAttachmentPreview(URL.createObjectURL(file));
                      } else {
                        setAttachmentPreview(file.name);
                      }
                    }
                  }}
                />
                {attachmentPreview ? (
                  <Box>
                    {attachmentPreview.startsWith('blob:') || attachmentPreview.startsWith('http') || attachmentPreview.startsWith('transactions/') ? (
                      attachmentPreview.endsWith('.pdf') ? (
                        <Typography variant="body2">{attachmentPreview}</Typography>
                      ) : (
                        <img
                          src={attachmentPreview.startsWith('blob:') ? attachmentPreview : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${attachmentPreview}`}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                        />
                      )
                    ) : (
                      <Typography variant="body2">{attachmentPreview}</Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti file
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary">
                      Klik untuk upload bukti (JPG, PNG, PDF - Max 5MB)
                    </Typography>
                  </Box>
                )}
              </Box>

              {editingId && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                  * Jenis, tipe, nominal, dan tanggal transaksi tidak dapat diubah untuk menjaga integritas saldo.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Batal</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              const item = transactions.find((t) => t.id === menuItemId);
              if (item) handleOpenDialog(item);
              handleMenuClose();
            }}
          >
            <IconEdit size={18} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeletingId(menuItemId);
              setOpenDeleteDialog(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Hapus
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isDeleting) {
              setOpenDeleteDialog(false);
            }
          }}
        >
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan otomatis disesuaikan.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>Batal</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Transaction Type Dialog */}
        <Dialog
          open={openTypeDialog}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown' && !isSubmittingType) {
              handleCloseTypeDialog();
            }
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>{editingTypeId ? 'Edit Tipe Transaksi' : 'Tambah Tipe Transaksi'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel>Nama Tipe *</CustomFormLabel>
              <CustomTextField
                placeholder="Masukkan nama tipe"
                fullWidth
                value={typeName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeName(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTypeDialog} disabled={isSubmittingType}>Batal</Button>
            <Button
              variant="contained"
              onClick={handleSubmitType}
              disabled={isSubmittingType}
              startIcon={isSubmittingType ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {isSubmittingType ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
