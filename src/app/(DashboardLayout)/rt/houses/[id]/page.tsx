'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtHouseDetail, RtBillSummary, RtResident, RtMember, RELIGIONS, RELATIVES, FAMILY_STATUS } from '@/services/api';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomSwitch from '@/app/components/forms/theme-elements/CustomSwitch';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import Link from '@mui/material/Link';
import {
  IconArrowLeft,
  IconHome,
  IconUser,
  IconPhone,
  IconId,
  IconUsers,
  IconBuildingCommunity,
  IconCurrencyDollar,
  IconReceipt,
  IconCheck,
  IconAlertCircle,
  IconHomeHeart,
  IconKey,
  IconExternalLink,
  IconEdit,
  IconBan,
  IconListCheck,
  IconChevronDown,
  IconTrash,
  IconUpload,
  IconPhoto,
  IconUserPlus,
  IconCopy,
} from '@tabler/icons-react';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || '';

// Get full URL for KK document
const getKkUrl = (kk: string | null) => {
  if (!kk) return null;
  if (kk.startsWith('http://') || kk.startsWith('https://')) {
    return kk;
  }
  return `${STORAGE_URL}/${kk}`;
};

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const getStatusColor = (status: string, deletedAt: string | null) => {
  if (deletedAt) return 'default';
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'UNPAID':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string, deletedAt: string | null) => {
  if (deletedAt) return 'Tidak Aktif';
  switch (status) {
    case 'PAID':
      return 'Lunas';
    case 'PENDING':
      return 'Pending';
    case 'UNPAID':
      return 'Belum Bayar';
    default:
      return status;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Format number to Rupiah display (without currency symbol, just thousand separator)
const formatRupiah = (value: string | number): string => {
  const numStr = String(value).replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numStr));
};

// Parse Rupiah formatted string back to number
const parseRupiah = (value: string): number => {
  const numStr = value.replace(/\D/g, '');
  return Number(numStr) || 0;
};

// Get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Calculate bill statistics
const calculateBillStats = (bills: RtBillSummary[]) => {
  const activeBills = bills.filter((b) => !b.deleted_at);
  const total = activeBills.length;
  const paid = activeBills.filter((b) => b.status === 'PAID').length;
  const pending = activeBills.filter((b) => b.status === 'PENDING').length;
  const unpaid = activeBills.filter((b) => b.status === 'UNPAID').length;
  const inactive = bills.filter((b) => b.deleted_at).length;
  const paidPercentage = total > 0 ? (paid / total) * 100 : 0;
  return { total, paid, pending, unpaid, inactive, paidPercentage };
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box display="flex" alignItems="center" gap={2} py={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );
}

interface ResidentCardProps {
  title: string;
  subtitle: string;
  resident: RtResident | null;
  color: 'primary' | 'secondary';
  icon: React.ReactNode;
  onEdit: () => void;
  onDelete?: () => void;
}

function ResidentCard({ title, subtitle, resident, color, icon, onEdit, onDelete }: ResidentCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Colored header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          color: 'white',
          p: 2.5,
          pb: 5,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            {icon}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              <IconEdit size={16} />
            </IconButton>
            {onDelete && resident && (
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,0,0,0.3)' },
                }}
              >
                <IconTrash size={16} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Avatar overlapping */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: -4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: resident ? theme.palette[color].light : 'grey.300',
            color: resident ? theme.palette[color].dark : 'grey.500',
            fontSize: '1.5rem',
            fontWeight: 700,
            border: '4px solid white',
            boxShadow: 2,
          }}
        >
          {resident ? getInitials(resident.name) : '?'}
        </Avatar>
      </Box>

      <CardContent sx={{ pt: 2 }}>
        {resident ? (
          <>
            <Typography variant="h6" fontWeight={600} textAlign="center" mb={2}>
              {resident.name}
            </Typography>
            <Stack spacing={0.5}>
              <InfoRow
                icon={<IconPhone size={18} />}
                label="No. Handphone"
                value={resident.handphone}
              />
              <InfoRow
                icon={<IconId size={18} />}
                label="Kartu Keluarga"
                value={
                  resident.kk ? (
                    <Link
                      href={getKkUrl(resident.kk) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Lihat Detail
                      <IconExternalLink size={14} />
                    </Link>
                  ) : null
                }
              />
              <InfoRow
                icon={<IconUsers size={18} />}
                label="Status"
                value={FAMILY_STATUS.find(s => s.value === resident.sum_family)?.label || resident.sum_family}
              />
              <InfoRow
                icon={<IconBuildingCommunity size={18} />}
                label="Agama"
                value={resident.religion}
              />
            </Stack>
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'grey.100',
                color: 'grey.400',
                mx: 'auto',
                mb: 2,
              }}
            >
              <IconUser size={32} />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Data belum tersedia
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface BillSummaryCardProps {
  title: string;
  bills: RtBillSummary[];
  monthlyAmount: number;
  isActive: boolean;
  color: string;
  icon: React.ReactNode;
  onEdit: () => void;
  onEditBill: (bill: RtBillSummary) => void;
  onBulkEdit: (bills: RtBillSummary[]) => void;
  hideHeader?: boolean;
}

function BillSummaryCard({ title, bills, monthlyAmount, isActive, color, icon, onEdit, onEditBill, onBulkEdit, hideHeader = false }: BillSummaryCardProps) {
  const theme = useTheme();
  const stats = calculateBillStats(bills);
  const [selectedBills, setSelectedBills] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(bills.map((b) => b.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId: number, checked: boolean) => {
    if (checked) {
      setSelectedBills((prev) => [...prev, billId]);
    } else {
      setSelectedBills((prev) => prev.filter((id) => id !== billId));
    }
  };

  const handleBulkEdit = () => {
    const selected = bills.filter((b) => selectedBills.includes(b.id));
    onBulkEdit(selected);
    setSelectedBills([]);
  };

  const isAllSelected = bills.length > 0 && selectedBills.length === bills.length;
  const isIndeterminate = selectedBills.length > 0 && selectedBills.length < bills.length;

  return (
    <Box sx={{ height: hideHeader ? 'auto' : '100%' }}>
      {/* Header with gradient - only show when not in accordion */}
      {!hideHeader && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
            color: 'white',
            p: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center" gap={1.5}>
              {icon}
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={isActive ? 'Aktif' : 'Tidak Aktif'}
                size="small"
                sx={{
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                }}
              >
                <IconEdit size={16} />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="h4" fontWeight={700} mt={1}>
            {isActive ? formatCurrency(monthlyAmount) : '-'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            per bulan
          </Typography>
        </Box>
      )}

      <Box sx={{ p: hideHeader ? 2 : 0 }}>
        <CardContent sx={{ p: hideHeader ? 0 : undefined }}>
        {/* Edit Settings Button - only show in accordion mode */}
        {hideHeader && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconEdit size={16} />}
              onClick={onEdit}
            >
              Edit Pengaturan {title}
            </Button>
          </Box>
        )}

        {/* Progress bar */}
        {bills.length > 0 && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress Pembayaran
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {stats.paidPercentage.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.paidPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Stats */}
        <Grid container spacing={1} mb={2}>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                textAlign: 'center',
              }}
            >
              <IconCheck size={20} color={theme.palette.success.main} />
              <Typography variant="h6" fontWeight={700} color="success.main">
                {stats.paid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lunas
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                textAlign: 'center',
              }}
            >
              <IconBan size={20} color={theme.palette.grey[500]} />
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                {stats.inactive}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tidak Aktif
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                textAlign: 'center',
              }}
            >
              <IconAlertCircle size={20} color={theme.palette.error.main} />
              <Typography variant="h6" fontWeight={700} color="error.main">
                {stats.unpaid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Belum
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bulk Edit Button */}
        {selectedBills.length > 0 && (
          <Box mb={2}>
            <Button
              variant="contained"
              size="small"
              startIcon={<IconListCheck size={16} />}
              onClick={handleBulkEdit}
            >
              Edit {selectedBills.length} Tagihan
            </Button>
          </Box>
        )}

        {/* Bills Table */}
        <TableContainer sx={{ maxHeight: 280 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.50', width: 40, p: 0.5 }} align="center">
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={bills.length === 0}
                  />
                </TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Periode</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Jumlah</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600, width: 50 }} align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <IconReceipt size={40} color="#ccc" style={{ marginBottom: 8 }} />
                    <Typography variant="body2" color="text.secondary">
                      Tidak ada data tagihan
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill) => (
                  <TableRow key={bill.id} hover selected={selectedBills.includes(bill.id)}>
                    <TableCell sx={{ p: 0.5 }} align="center">
                      <Checkbox
                        size="small"
                        checked={selectedBills.includes(bill.id)}
                        onChange={(e) => handleSelectBill(bill.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {monthNames[bill.month_bill - 1]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bill.year_bill}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(bill.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(bill.status, bill.deleted_at)}
                        color={getStatusColor(bill.status, bill.deleted_at) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => onEditBill(bill)}
                        disabled={bill.status === 'PAID'}
                        sx={{
                          opacity: bill.status === 'PAID' ? 0.3 : 1,
                        }}
                      >
                        <IconEdit size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </CardContent>
      </Box>
    </Box>
  );
}

type BillType = 'ipl' | 'cash' | 'pkk';

interface EditBillDialogProps {
  open: boolean;
  onClose: () => void;
  billType: BillType | null;
  isActive: boolean;
  amount: number | null;
  onSave: (billType: BillType, isActive: boolean, amount: number) => Promise<void>;
  isSaving: boolean;
}

function EditBillDialog({ open, onClose, billType, isActive, amount, onSave, isSaving }: EditBillDialogProps) {
  const [formActive, setFormActive] = useState(isActive);
  const [formAmount, setFormAmount] = useState(formatRupiah(amount ?? 0));

  useEffect(() => {
    setFormActive(isActive);
    setFormAmount(formatRupiah(amount ?? 0));
  }, [isActive, amount, open]);

  const getBillTitle = () => {
    switch (billType) {
      case 'ipl':
        return 'IPL';
      case 'cash':
        return 'Kas RT';
      case 'pkk':
        return 'PKK';
      default:
        return '';
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits (remove any non-digit characters)
    const numericOnly = value.replace(/\D/g, '');
    // Format with thousand separator
    setFormAmount(formatRupiah(numericOnly));
  };

  const handleSave = async () => {
    if (billType) {
      await onSave(billType, formActive, parseRupiah(formAmount));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Tagihan {getBillTitle()}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <CustomFormLabel sx={{ mb: 0 }}>Status Tagihan</CustomFormLabel>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color={formActive ? 'text.secondary' : 'text.primary'}>
                Tidak Aktif
              </Typography>
              <CustomSwitch
                checked={formActive}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormActive(e.target.checked)}
              />
              <Typography variant="body2" color={formActive ? 'text.primary' : 'text.secondary'}>
                Aktif
              </Typography>
            </Box>
          </Box>

          <CustomFormLabel>Nominal per Bulan</CustomFormLabel>
          <CustomTextField
            fullWidth
            value={formAmount}
            onChange={handleAmountChange}
            disabled={!formActive}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            }}
            placeholder="0"
          />
          {!formActive && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Aktifkan tagihan untuk mengatur nominal
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface EditBillItemDialogProps {
  open: boolean;
  onClose: () => void;
  bill: RtBillSummary | null;
  billType: BillType | null;
  onSave: (billType: BillType, billId: number, amount: number, isDeleted: boolean) => Promise<void>;
  isSaving: boolean;
}

function EditBillItemDialog({ open, onClose, bill, billType, onSave, isSaving }: EditBillItemDialogProps) {
  const [formAmount, setFormAmount] = useState('');
  const [formIsDeleted, setFormIsDeleted] = useState(false);

  useEffect(() => {
    if (bill) {
      setFormAmount(formatRupiah(bill.amount));
      setFormIsDeleted(!!bill.deleted_at);
    }
  }, [bill, open]);

  const getBillTitle = () => {
    switch (billType) {
      case 'ipl':
        return 'IPL';
      case 'cash':
        return 'Kas RT';
      case 'pkk':
        return 'PKK';
      default:
        return '';
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericOnly = value.replace(/\D/g, '');
    setFormAmount(formatRupiah(numericOnly));
  };

  const handleSave = async () => {
    if (billType && bill) {
      await onSave(billType, bill.id, parseRupiah(formAmount), formIsDeleted);
    }
  };

  if (!bill) return null;

  const periodLabel = `${monthNames[bill.month_bill - 1]} ${bill.year_bill}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Tagihan {getBillTitle()} - {periodLabel}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <CustomFormLabel>Nominal</CustomFormLabel>
          <CustomTextField
            fullWidth
            value={formAmount}
            onChange={handleAmountChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
            }}
            placeholder="0"
          />

          <Box display="flex" alignItems="center" justifyContent="space-between" mt={3}>
            <Box>
              <CustomFormLabel sx={{ mb: 0 }}>Status Tagihan</CustomFormLabel>
              <Typography variant="caption" color="text.secondary" display="block">
                {formIsDeleted ? 'Tagihan tidak aktif' : 'Tagihan aktif'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color={formIsDeleted ? 'text.primary' : 'text.secondary'}>
                Tidak Aktif
              </Typography>
              <CustomSwitch
                checked={!formIsDeleted}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormIsDeleted(!e.target.checked)}
              />
              <Typography variant="body2" color={!formIsDeleted ? 'text.primary' : 'text.secondary'}>
                Aktif
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface BillEditRow {
  id: number;
  year_bill: number;
  month_bill: number;
  amount: string;
  isActive: boolean;
  originalAmount: number;
  originalIsActive: boolean;
  status: 'UNPAID' | 'PENDING' | 'PAID';
}

interface BulkEditBillsDialogProps {
  open: boolean;
  onClose: () => void;
  bills: RtBillSummary[];
  billType: BillType | null;
  onSave: (billType: BillType, updates: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>) => Promise<void>;
  isSaving: boolean;
}

function BulkEditBillsDialog({ open, onClose, bills, billType, onSave, isSaving }: BulkEditBillsDialogProps) {
  const [billRows, setBillRows] = useState<BillEditRow[]>([]);

  useEffect(() => {
    if (open && bills.length > 0) {
      setBillRows(
        bills.map((bill) => ({
          id: bill.id,
          year_bill: bill.year_bill,
          month_bill: bill.month_bill,
          amount: formatRupiah(bill.amount),
          isActive: !bill.deleted_at,
          originalAmount: bill.amount,
          originalIsActive: !bill.deleted_at,
          status: bill.status,
        }))
      );
    }
  }, [open, bills]);

  const getBillTitle = () => {
    switch (billType) {
      case 'ipl':
        return 'IPL';
      case 'cash':
        return 'Kas RT';
      case 'pkk':
        return 'PKK';
      default:
        return '';
    }
  };

  const handleAmountChange = (billId: number, value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    setBillRows((prev) =>
      prev.map((row) =>
        row.id === billId ? { ...row, amount: formatRupiah(numericOnly) } : row
      )
    );
  };

  const handleActiveChange = (billId: number, isActive: boolean) => {
    setBillRows((prev) =>
      prev.map((row) =>
        row.id === billId ? { ...row, isActive } : row
      )
    );
  };

  const handleSave = async () => {
    if (!billType || billRows.length === 0) return;

    const updates = billRows
      .filter((row) => row.status !== 'PAID') // Skip PAID bills
      .map((row) => {
        const update: { id: number; amount?: number; delete?: boolean; restore?: boolean } = { id: row.id };
        const newAmount = parseRupiah(row.amount);

        // Check if amount changed
        if (newAmount !== row.originalAmount) {
          update.amount = newAmount;
        }

        // Check if active status changed
        if (row.isActive !== row.originalIsActive) {
          if (!row.isActive && row.originalIsActive) {
            update.delete = true;
          } else if (row.isActive && !row.originalIsActive) {
            update.restore = true;
          }
        }

        return update;
      })
      .filter((update) => update.amount !== undefined || update.delete || update.restore);

    if (updates.length === 0) {
      onClose();
      return;
    }

    await onSave(billType, updates);
  };

  if (bills.length === 0) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Bulk Tagihan {getBillTitle()} ({billRows.length} tagihan)</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Edit nominal dan status untuk masing-masing tagihan.
          </Typography>

          {/* Bills Table */}
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Periode</TableCell>
                  <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600, width: 200 }}>Nominal</TableCell>
                  <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600, width: 80 }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billRows.map((row) => {
                  const isPaid = row.status === 'PAID';
                  return (
                    <TableRow key={row.id} hover sx={{ opacity: isPaid ? 0.6 : 1 }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {monthNames[row.month_bill - 1]} {row.year_bill}
                          </Typography>
                          {isPaid && (
                            <Chip label="Lunas" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <CustomTextField
                          size="small"
                          fullWidth
                          value={row.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(row.id, e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                          }}
                          placeholder="0"
                          disabled={isPaid}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <CustomSwitch
                            checked={row.isActive}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleActiveChange(row.id, e.target.checked)}
                            disabled={isPaid}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Edit Resident Dialog (for Owner and Occupant)
interface EditResidentDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  resident: RtResident | null;
  onSave: (data: FormData) => Promise<void>;
  isSaving: boolean;
  isOwner?: boolean;
}

function EditResidentDialog({ open, onClose, title, resident, onSave, isSaving, isOwner = false }: EditResidentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    handphone: '',
    religion: '',
    sum_family: '',
  });
  const [isOccupied, setIsOccupied] = useState(false);
  const [isAlsoOwner, setIsAlsoOwner] = useState(false);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: resident?.name || '',
        handphone: resident?.handphone || '',
        religion: resident?.religion || '',
        sum_family: resident?.sum_family || '',
      });
      setIsOccupied(false);
      setIsAlsoOwner(false);
      setKkFile(null);
      setKkPreview(resident?.kk ? getKkUrl(resident.kk) : null);
    }
  }, [open, resident]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKkFile(file);
      setKkPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.handphone) data.append('handphone', formData.handphone);
    if (formData.religion) data.append('religion', formData.religion);
    if (formData.sum_family) data.append('sum_family', formData.sum_family);
    if (kkFile) data.append('kk', kkFile);
    if (isOwner && isOccupied) data.append('is_occupied', '1');
    if (!isOwner && isAlsoOwner) data.append('is_owner', '1');

    await onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{resident ? `Edit ${title}` : `Tambah ${title}`}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomFormLabel>Nama *</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel>No. Handphone *</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={formData.handphone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, handphone: value });
                }}
                placeholder="Contoh: 08123456789"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel>Agama *</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={formData.religion}
                onChange={(e: any) => setFormData({ ...formData, religion: e.target.value })}
                placeholder="Pilih Agama"
              >
                {RELIGIONS.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid size={12}>
              <CustomFormLabel>Status *</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={formData.sum_family}
                onChange={(e: any) => setFormData({ ...formData, sum_family: e.target.value })}
                placeholder="Pilih Status"
              >
                {FAMILY_STATUS.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            {isOwner && !resident && (
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <CustomSwitch
                      checked={isOccupied}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsOccupied(e.target.checked)}
                    />
                  }
                  label="Saya juga sebagai penghuni rumah"
                />
                {isOccupied && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Mengaktifkan opsi ini akan menggantikan data penghuni rumah saat ini dengan data pemilik rumah.
                  </Alert>
                )}
              </Grid>
            )}
            {!isOwner && !resident && (
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <CustomSwitch
                      checked={isAlsoOwner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsAlsoOwner(e.target.checked)}
                    />
                  }
                  label="Saya juga sebagai pemilik rumah"
                />
                {isAlsoOwner && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Mengaktifkan opsi ini akan menggantikan data pemilik rumah saat ini dengan data penghuni rumah.
                  </Alert>
                )}
              </Grid>
            )}
            <Grid size={12}>
              <CustomFormLabel>Foto Kartu Keluarga (KK) *</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
                onClick={() => document.getElementById('kk-file-input')?.click()}
              >
                {kkPreview ? (
                  <Box>
                    <Box
                      component="img"
                      src={kkPreview}
                      alt="KK Preview"
                      sx={{ maxHeight: 150, maxWidth: '100%', mb: 1, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Klik untuk mengganti foto
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={40} color="#999" />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Klik untuk upload foto KK
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Format: JPG, PNG (Maks. 2MB)
                    </Typography>
                  </Box>
                )}
              </Box>
              <input
                id="kk-file-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Batal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !formData.name || !formData.handphone || !formData.religion || !formData.sum_family || (!kkFile && !kkPreview)}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Member Form Dialog (for adding/editing members)
interface MemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  member: RtMember | null;
  onSave: (data: FormData) => Promise<void>;
  isSaving: boolean;
}

function MemberFormDialog({ open, onClose, member, onSave, isSaving }: MemberFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    handphone: '',
    religion: '',
    relatives: '',
    is_domicile: true,
  });
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);
  const [removeKk, setRemoveKk] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: member?.name || '',
        handphone: member?.handphone || '',
        religion: member?.religion || '',
        relatives: member?.relatives || '',
        is_domicile: member?.is_domicile ?? true,
      });
      setKkFile(null);
      setKkPreview(member?.kk ? getKkUrl(member.kk) : null);
      setRemoveKk(false);
    }
  }, [open, member]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKkFile(file);
      setKkPreview(URL.createObjectURL(file));
      setRemoveKk(false);
    }
  };

  const handleRemoveKk = () => {
    setKkFile(null);
    setKkPreview(null);
    setRemoveKk(true);
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.handphone) data.append('handphone', formData.handphone);
    if (formData.religion) data.append('religion', formData.religion);
    if (formData.relatives) data.append('relatives', formData.relatives);
    data.append('is_domicile', formData.is_domicile ? '1' : '0');
    if (kkFile) {
      data.append('kk', kkFile);
    } else if (removeKk) {
      data.append('remove_kk', '1');
    }

    await onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{member ? 'Edit Anggota Keluarga' : 'Tambah Anggota Keluarga'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomFormLabel>Nama *</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama anggota"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel>No. Handphone</CustomFormLabel>
              <CustomTextField
                fullWidth
                value={formData.handphone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, handphone: value });
                }}
                placeholder="Contoh: 08123456789"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel>Agama</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={formData.religion}
                onChange={(e: any) => setFormData({ ...formData, religion: e.target.value })}
                placeholder="Pilih Agama"
              >
                {RELIGIONS.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid size={12}>
              <CustomFormLabel>Hubungan Keluarga *</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={formData.relatives}
                onChange={(e: any) => setFormData({ ...formData, relatives: e.target.value })}
                placeholder="Pilih Hubungan"
              >
                {RELATIVES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_domicile}
                    onChange={(e) => setFormData({ ...formData, is_domicile: e.target.checked })}
                  />
                }
                label="Berdomisili di alamat ini"
              />
            </Grid>
            <Grid size={12}>
              <CustomFormLabel>Foto KK (Diisi jika memiliki lebih dari satu KK)</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
                onClick={() => document.getElementById('member-kk-file-input')?.click()}
              >
                {kkPreview ? (
                  <Box>
                    <Box
                      component="img"
                      src={kkPreview}
                      alt="KK Preview"
                      sx={{ maxHeight: 150, maxWidth: '100%', mb: 1, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Klik untuk mengganti foto
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={40} color="#999" />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Klik untuk upload foto KK
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Format: JPG, PNG (Maks. 2MB)
                    </Typography>
                  </Box>
                )}
              </Box>
              {kkPreview && (
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveKk();
                  }}
                  sx={{ mt: 1 }}
                >
                  Hapus Foto KK
                </Button>
              )}
              <input
                id="member-kk-file-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Batal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !formData.name || !formData.relatives}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Copy Member Dialog (for copying from owner/occupant)
interface CopyMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { source: 'owner' | 'occupant'; is_domicile: boolean; relatives: string }) => Promise<void>;
  isSaving: boolean;
  hasOwner: boolean;
  hasOccupant: boolean;
}

function CopyMemberDialog({ open, onClose, onSave, isSaving, hasOwner, hasOccupant }: CopyMemberDialogProps) {
  const [source, setSource] = useState<'owner' | 'occupant'>('owner');
  const [relatives, setRelatives] = useState('');
  const [isDomicile, setIsDomicile] = useState(true);

  useEffect(() => {
    if (open) {
      setSource(hasOwner ? 'owner' : 'occupant');
      setRelatives('');
      setIsDomicile(true);
    }
  }, [open, hasOwner]);

  const handleSave = async () => {
    await onSave({ source, is_domicile: isDomicile, relatives });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Copy Data ke Anggota Keluarga</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomFormLabel>Sumber Data *</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={source}
                onChange={(e: any) => setSource(e.target.value)}
                placeholder="Pilih Sumber"
              >
                {hasOwner && <MenuItem value="owner">Pemilik Rumah</MenuItem>}
                {hasOccupant && <MenuItem value="occupant">Penghuni Rumah</MenuItem>}
              </CustomSelect>
            </Grid>
            <Grid size={12}>
              <CustomFormLabel>Hubungan Keluarga *</CustomFormLabel>
              <CustomSelect
                fullWidth
                value={relatives}
                onChange={(e: any) => setRelatives(e.target.value)}
                placeholder="Pilih Hubungan"
              >
                {RELATIVES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </CustomSelect>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDomicile}
                    onChange={(e) => setIsDomicile(e.target.checked)}
                  />
                }
                label="Berdomisili di alamat ini"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Batal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !relatives}
        >
          {isSaving ? 'Menyalin...' : 'Salin Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Members Section Component
interface MembersSectionProps {
  members: RtMember[];
  onAdd: () => void;
  onEdit: (member: RtMember) => void;
  onDelete: (member: RtMember) => void;
  onCopyFrom: () => void;
  canCopy: boolean;
}

function MembersSection({ members, onAdd, onEdit, onDelete, onCopyFrom, canCopy }: MembersSectionProps) {
  const theme = useTheme();

  return (
    <Card sx={{ mt: 3 }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
          color: 'white',
          p: 2.5,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <IconUsers size={24} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Anggota Keluarga
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {members.length} anggota terdaftar
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {canCopy && (
              <Button
                variant="contained"
                size="small"
                startIcon={<IconCopy size={18} />}
                onClick={onCopyFrom}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Copy dari Pemilik/Penghuni
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<IconUserPlus size={18} />}
              onClick={onAdd}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              }}
            >
              Tambah Anggota
            </Button>
          </Box>
        </Box>
      </Box>
      <CardContent>
        {members.length === 0 ? (
          <Box textAlign="center" py={4}>
            <IconUsers size={48} color="#ccc" />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Belum ada anggota keluarga terdaftar
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {members.map((member) => (
              <Grid key={member.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            fontSize: '0.9rem',
                          }}
                        >
                          {getInitials(member.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                            {member.name}
                          </Typography>
                          {member.relatives && (
                            <Typography variant="caption" color="text.secondary">
                              {member.relatives}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box display="flex" gap={0.5}>
                        <IconButton size="small" onClick={() => onEdit(member)}>
                          <IconEdit size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete(member)}>
                          <IconTrash size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                    <Stack spacing={0.5}>
                      {member.religion && (
                        <Typography variant="caption" color="text.secondary">
                          Agama: <strong>{member.religion}</strong>
                        </Typography>
                      )}
                      {member.handphone && (
                        <Typography variant="caption" color="text.secondary">
                          HP: <strong>{member.handphone}</strong>
                        </Typography>
                      )}
                    </Stack>
                    <Box display="flex" alignItems="center" gap={1} mt={1.5} flexWrap="wrap">
                      <Chip
                        label={member.is_domicile ? 'Domisili' : 'Non-Domisili'}
                        size="small"
                        color={member.is_domicile ? 'success' : 'default'}
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                      {member.kk && (
                        <Chip
                          icon={<IconPhoto size={12} />}
                          label="Lihat KK"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem', cursor: 'pointer' }}
                          onClick={() => window.open(getKkUrl(member.kk) || '#', '_blank')}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

// Delete Confirmation Dialog
interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmDialog({ open, onClose, title, message, onConfirm, isDeleting }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>Batal</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Menghapus...' : 'Hapus'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { rtId } = useOrg();
  const { showError, showSuccess } = useSnackbar();
  const [house, setHouse] = useState<RtHouseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit dialog state (for bill settings)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBillType, setEditBillType] = useState<BillType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit bill item dialog state
  const [editBillItemDialogOpen, setEditBillItemDialogOpen] = useState(false);
  const [editBillItem, setEditBillItem] = useState<RtBillSummary | null>(null);
  const [editBillItemType, setEditBillItemType] = useState<BillType | null>(null);
  const [isSavingBillItem, setIsSavingBillItem] = useState(false);

  // Bulk edit dialog state
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditBills, setBulkEditBills] = useState<RtBillSummary[]>([]);
  const [bulkEditBillType, setBulkEditBillType] = useState<BillType | null>(null);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // Resident edit dialog state (owner/occupant)
  const [editResidentDialogOpen, setEditResidentDialogOpen] = useState(false);
  const [editResidentType, setEditResidentType] = useState<'owner' | 'occupant' | null>(null);
  const [isSavingResident, setIsSavingResident] = useState(false);

  // Member dialog state
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RtMember | null>(null);
  const [isSavingMember, setIsSavingMember] = useState(false);

  // Copy member dialog state
  const [copyMemberDialogOpen, setCopyMemberDialogOpen] = useState(false);
  const [isCopyingMember, setIsCopyingMember] = useState(false);

  // Delete confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'owner' | 'occupant' | 'member'; data?: RtMember } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const houseId = Number(params.id);

  useEffect(() => {
    if (rtId && houseId) {
      fetchHouseDetail();
    }
  }, [rtId, houseId]);

  const fetchHouseDetail = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getHouseById(houseId);
      setHouse(response.data.data);
    } catch (err) {
      showError('Gagal memuat detail rumah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBill = (billType: BillType) => {
    setEditBillType(billType);
    setEditDialogOpen(true);
  };

  const handleSaveBill = async (billType: BillType, isActive: boolean, amount: number) => {
    if (!rtId || !house) return;
    setIsSaving(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const updateData: Record<string, boolean | number | null> = {};

      switch (billType) {
        case 'ipl':
          updateData.pay_ipl = isActive;
          updateData.ipl_amount = isActive ? amount : null;
          break;
        case 'cash':
          updateData.pay_cash = isActive;
          updateData.cash_amount = isActive ? amount : null;
          break;
        case 'pkk':
          updateData.pay_pkk = isActive;
          updateData.pkk_amount = isActive ? amount : null;
          break;
      }

      await rtAPI.updateHouse(houseId, updateData);
      await fetchHouseDetail();
      showSuccess('Tagihan berhasil diperbarui');
      setEditDialogOpen(false);
    } catch (err) {
      showError('Gagal memperbarui tagihan');
    } finally {
      setIsSaving(false);
    }
  };

  const getEditDialogProps = () => {
    if (!house || !editBillType) {
      return { isActive: false, amount: 0 };
    }
    switch (editBillType) {
      case 'ipl':
        return { isActive: house.pay_ipl, amount: house.ipl_amount };
      case 'cash':
        return { isActive: house.pay_cash, amount: house.cash_amount };
      case 'pkk':
        return { isActive: house.pay_pkk, amount: house.pkk_amount };
      default:
        return { isActive: false, amount: 0 };
    }
  };

  const handleEditBillItem = (bill: RtBillSummary, billType: BillType) => {
    setEditBillItem(bill);
    setEditBillItemType(billType);
    setEditBillItemDialogOpen(true);
  };

  const handleSaveBillItem = async (billType: BillType, billId: number, amount: number, isDeleted: boolean) => {
    if (!rtId || !house) return;
    setIsSavingBillItem(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const billUpdate: { id: number; amount?: number; delete?: boolean; restore?: boolean } = { id: billId };

      // Check if we need to update amount
      const currentBill = editBillItem;
      if (currentBill && amount !== currentBill.amount) {
        billUpdate.amount = amount;
      }

      // Check if we need to delete or restore
      const wasDeleted = !!currentBill?.deleted_at;
      if (isDeleted && !wasDeleted) {
        billUpdate.delete = true;
      } else if (!isDeleted && wasDeleted) {
        billUpdate.restore = true;
      }

      const data: {
        ipl?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
        cash?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
        pkk?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
      } = {};
      data[billType] = [billUpdate];

      await rtAPI.updateHouseBillsBulk(houseId, data);
      await fetchHouseDetail();
      showSuccess('Tagihan berhasil diperbarui');
      setEditBillItemDialogOpen(false);
    } catch (err) {
      showError('Gagal memperbarui tagihan');
    } finally {
      setIsSavingBillItem(false);
    }
  };

  const handleBulkEdit = (bills: RtBillSummary[], billType: BillType) => {
    setBulkEditBills(bills);
    setBulkEditBillType(billType);
    setBulkEditDialogOpen(true);
  };

  const handleSaveBulkEdit = async (
    billType: BillType,
    updates: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>
  ) => {
    if (!rtId || !house) return;
    setIsSavingBulk(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const data: {
        ipl?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
        cash?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
        pkk?: Array<{ id: number; amount?: number; delete?: boolean; restore?: boolean }>;
      } = {};
      data[billType] = updates;

      await rtAPI.updateHouseBillsBulk(houseId, data);
      await fetchHouseDetail();
      showSuccess(`${updates.length} tagihan berhasil diperbarui`);
      setBulkEditDialogOpen(false);
    } catch (err) {
      showError('Gagal memperbarui tagihan');
    } finally {
      setIsSavingBulk(false);
    }
  };

  // Resident handlers (owner/occupant)
  const handleEditResident = (type: 'owner' | 'occupant') => {
    setEditResidentType(type);
    setEditResidentDialogOpen(true);
  };

  const handleSaveResident = async (data: FormData) => {
    if (!rtId || !editResidentType) return;
    setIsSavingResident(true);
    try {
      const rtAPI = createRtAPI(rtId);
      if (editResidentType === 'owner') {
        await rtAPI.createOrUpdateOwner(houseId, data);
      } else {
        await rtAPI.createOrUpdateOccupant(houseId, data);
      }
      await fetchHouseDetail();
      showSuccess(`Data ${editResidentType === 'owner' ? 'pemilik' : 'penghuni'} berhasil disimpan`);
      setEditResidentDialogOpen(false);
    } catch (err) {
      showError(`Gagal menyimpan data ${editResidentType === 'owner' ? 'pemilik' : 'penghuni'}`);
    } finally {
      setIsSavingResident(false);
    }
  };

  const handleDeleteResident = (type: 'owner' | 'occupant') => {
    setDeleteTarget({ type });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteResident = async () => {
    if (!rtId || !deleteTarget) return;
    setIsDeleting(true);
    try {
      const rtAPI = createRtAPI(rtId);
      if (deleteTarget.type === 'owner') {
        await rtAPI.deleteOwner(houseId);
      } else if (deleteTarget.type === 'occupant') {
        await rtAPI.deleteOccupant(houseId);
      }
      await fetchHouseDetail();
      showSuccess(`Data ${deleteTarget.type === 'owner' ? 'pemilik' : 'penghuni'} berhasil dihapus`);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      showError(`Gagal menghapus data`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Member handlers
  const handleAddMember = () => {
    setEditingMember(null);
    setMemberDialogOpen(true);
  };

  const handleEditMember = (member: RtMember) => {
    setEditingMember(member);
    setMemberDialogOpen(true);
  };

  const handleSaveMember = async (data: FormData) => {
    if (!rtId) return;
    setIsSavingMember(true);
    try {
      const rtAPI = createRtAPI(rtId);
      if (editingMember) {
        await rtAPI.updateMember(houseId, editingMember.id, data);
      } else {
        await rtAPI.createMember(houseId, data);
      }
      await fetchHouseDetail();
      showSuccess(`Anggota keluarga berhasil ${editingMember ? 'diperbarui' : 'ditambahkan'}`);
      setMemberDialogOpen(false);
      setEditingMember(null);
    } catch (err) {
      showError('Gagal menyimpan data anggota keluarga');
    } finally {
      setIsSavingMember(false);
    }
  };

  const handleCopyMember = async (data: { source: 'owner' | 'occupant'; is_domicile: boolean; relatives: string }) => {
    if (!rtId) return;
    setIsCopyingMember(true);
    try {
      const rtAPI = createRtAPI(rtId);
      await rtAPI.copyMemberFrom(houseId, data);
      await fetchHouseDetail();
      showSuccess('Data berhasil disalin ke anggota keluarga');
      setCopyMemberDialogOpen(false);
    } catch (err) {
      showError('Gagal menyalin data');
    } finally {
      setIsCopyingMember(false);
    }
  };

  const handleDeleteMember = (member: RtMember) => {
    setDeleteTarget({ type: 'member', data: member });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!rtId || !deleteTarget?.data) return;
    setIsDeleting(true);
    try {
      const rtAPI = createRtAPI(rtId);
      await rtAPI.deleteMember(houseId, deleteTarget.data.id);
      await fetchHouseDetail();
      showSuccess('Anggota keluarga berhasil dihapus');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      showError('Gagal menghapus anggota keluarga');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget?.type === 'member') {
      confirmDeleteMember();
    } else {
      confirmDeleteResident();
    }
  };

  if (!rtId || isLoading) {
    return (
      <PageContainer title="Detail Rumah" description="">
        <Box mt={3}>
          <Skeleton variant="rounded" height={180} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2].map((i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton variant="rounded" height={350} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  if (!house) {
    return (
      <PageContainer title="Detail Rumah" description="">
        <Box mt={3}>
          <Alert severity="error">Data rumah tidak ditemukan.</Alert>
          <Button
            variant="outlined"
            startIcon={<IconArrowLeft size={18} />}
            onClick={() => router.back()}
            sx={{ mt: 2 }}
          >
            Kembali
          </Button>
        </Box>
      </PageContainer>
    );
  }

  const occupancyStatus = house.occupied
    ? house.occupied_by_owner
      ? { label: 'Dihuni Pemilik', color: 'success' as const, icon: <IconHomeHeart size={18} /> }
      : { label: 'Dihuni Non Pemilik', color: 'info' as const, icon: <IconKey size={18} /> }
    : { label: 'Kosong', color: 'default' as const, icon: <IconHome size={18} /> };

  const editDialogProps = getEditDialogProps();

  return (
    <PageContainer
      title={`Detail Rumah - ${house.full_address || `Blok ${house.block} No. ${house.no}`}`}
      description=""
    >
      <Box mt={3}>
        {/* Hero Header Card */}
        <Card
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: 'absolute',
              right: -50,
              top: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 50,
              bottom: -80,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
            }}
          />

          <CardContent sx={{ p: 3, position: 'relative' }}>
            <Button
              variant="contained"
              startIcon={<IconArrowLeft size={18} />}
              onClick={() => router.back()}
              sx={{
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Kembali
            </Button>

            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                }}
              >
                <IconHome size={40} />
              </Avatar>

              <Box flex={1}>
                <Typography variant="h4" fontWeight={700}>
                  {house.full_address || `Blok ${house.block} No. ${house.no}`}
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  <Chip
                    icon={occupancyStatus.icon}
                    label={occupancyStatus.label}
                    color={occupancyStatus.color}
                    sx={{
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'inherit' },
                    }}
                  />
                  {house.pay_ipl && (
                    <Chip
                      label={`IPL: ${formatCurrency(house.ipl_amount ?? 0)}`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  {house.pay_cash && (
                    <Chip
                      label={`Kas: ${formatCurrency(house.cash_amount ?? 0)}`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  )}
                  {house.pay_pkk && (
                    <Chip
                      label={`PKK: ${formatCurrency(house.pkk_amount ?? 0)}`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Resident Info Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ResidentCard
              title="Pemilik Rumah"
              subtitle="Informasi pemilik properti"
              resident={house.owner}
              color="primary"
              icon={<IconUser size={24} />}
              onEdit={() => handleEditResident('owner')}
              onDelete={() => handleDeleteResident('owner')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ResidentCard
              title="Penghuni Rumah"
              subtitle="Informasi penghuni saat ini"
              resident={house.occupied_by_owner ? house.owner : house.occupant}
              color="secondary"
              icon={<IconHomeHeart size={24} />}
              onEdit={() => handleEditResident('occupant')}
              onDelete={!house.occupied_by_owner ? () => handleDeleteResident('occupant') : undefined}
            />
          </Grid>
        </Grid>

        {/* Members Section */}
        <MembersSection
          members={house.members || []}
          onAdd={handleAddMember}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          onCopyFrom={() => setCopyMemberDialogOpen(true)}
          canCopy={!!(house.owner || house.occupant)}
        />

        {/* Bills Accordion */}
        <Typography variant="h5" fontWeight={600} mt={4} mb={2} display="flex" alignItems="center" gap={1}>
          <IconReceipt size={24} />
          Riwayat Tagihan
        </Typography>
        <Card>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<IconChevronDown />}
              aria-controls="ipl-content"
              id="ipl-header"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
                color: 'white',
                '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                <IconCurrencyDollar size={24} />
                <Typography variant="h6" fontWeight={600}>IPL</Typography>
                <Box flexGrow={1} />
                <Chip
                  label={house.pay_ipl ? 'Aktif' : 'Tidak Aktif'}
                  size="small"
                  sx={{
                    bgcolor: house.pay_ipl ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {house.pay_ipl ? formatCurrency(house.ipl_amount ?? 0) + '/bulan' : '-'}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <BillSummaryCard
                title="IPL"
                bills={house.bills_ipl || []}
                monthlyAmount={house.ipl_amount ?? 0}
                isActive={house.pay_ipl}
                color={theme.palette.primary.main}
                icon={<IconCurrencyDollar size={24} />}
                onEdit={() => handleEditBill('ipl')}
                onEditBill={(bill) => handleEditBillItem(bill, 'ipl')}
                onBulkEdit={(bills) => handleBulkEdit(bills, 'ipl')}
                hideHeader
              />
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion>
            <AccordionSummary
              expandIcon={<IconChevronDown />}
              aria-controls="cash-content"
              id="cash-header"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.7)} 100%)`,
                color: 'white',
                '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                <IconCurrencyDollar size={24} />
                <Typography variant="h6" fontWeight={600}>Kas RT</Typography>
                <Box flexGrow={1} />
                <Chip
                  label={house.pay_cash ? 'Aktif' : 'Tidak Aktif'}
                  size="small"
                  sx={{
                    bgcolor: house.pay_cash ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {house.pay_cash ? formatCurrency(house.cash_amount ?? 0) + '/bulan' : '-'}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <BillSummaryCard
                title="Kas RT"
                bills={house.bills_cash || []}
                monthlyAmount={house.cash_amount ?? 0}
                isActive={house.pay_cash}
                color={theme.palette.success.main}
                icon={<IconCurrencyDollar size={24} />}
                onEdit={() => handleEditBill('cash')}
                onEditBill={(bill) => handleEditBillItem(bill, 'cash')}
                onBulkEdit={(bills) => handleBulkEdit(bills, 'cash')}
                hideHeader
              />
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Accordion>
            <AccordionSummary
              expandIcon={<IconChevronDown />}
              aria-controls="pkk-content"
              id="pkk-header"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.7)} 100%)`,
                color: 'white',
                '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                <IconCurrencyDollar size={24} />
                <Typography variant="h6" fontWeight={600}>PKK</Typography>
                <Box flexGrow={1} />
                <Chip
                  label={house.pay_pkk ? 'Aktif' : 'Tidak Aktif'}
                  size="small"
                  sx={{
                    bgcolor: house.pay_pkk ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mr: 1,
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {house.pay_pkk ? formatCurrency(house.pkk_amount ?? 0) + '/bulan' : '-'}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <BillSummaryCard
                title="PKK"
                bills={house.bills_pkk || []}
                monthlyAmount={house.pkk_amount ?? 0}
                isActive={house.pay_pkk}
                color={theme.palette.warning.main}
                icon={<IconCurrencyDollar size={24} />}
                onEdit={() => handleEditBill('pkk')}
                onEditBill={(bill) => handleEditBillItem(bill, 'pkk')}
                onBulkEdit={(bills) => handleBulkEdit(bills, 'pkk')}
                hideHeader
              />
            </AccordionDetails>
          </Accordion>
        </Card>
      </Box>

      {/* Edit Bill Dialog */}
      <EditBillDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        billType={editBillType}
        isActive={editDialogProps.isActive}
        amount={editDialogProps.amount}
        onSave={handleSaveBill}
        isSaving={isSaving}
      />

      {/* Edit Bill Item Dialog */}
      <EditBillItemDialog
        open={editBillItemDialogOpen}
        onClose={() => setEditBillItemDialogOpen(false)}
        bill={editBillItem}
        billType={editBillItemType}
        onSave={handleSaveBillItem}
        isSaving={isSavingBillItem}
      />

      {/* Bulk Edit Bills Dialog */}
      <BulkEditBillsDialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        bills={bulkEditBills}
        billType={bulkEditBillType}
        onSave={handleSaveBulkEdit}
        isSaving={isSavingBulk}
      />

      {/* Edit Resident Dialog (Owner/Occupant) */}
      <EditResidentDialog
        open={editResidentDialogOpen}
        onClose={() => setEditResidentDialogOpen(false)}
        title={editResidentType === 'owner' ? 'Pemilik Rumah' : 'Penghuni Rumah'}
        resident={editResidentType === 'owner' ? house?.owner ?? null : house?.occupant ?? null}
        onSave={handleSaveResident}
        isSaving={isSavingResident}
        isOwner={editResidentType === 'owner'}
      />

      {/* Member Form Dialog */}
      <MemberFormDialog
        open={memberDialogOpen}
        onClose={() => {
          setMemberDialogOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={handleSaveMember}
        isSaving={isSavingMember}
      />

      {/* Copy Member Dialog */}
      <CopyMemberDialog
        open={copyMemberDialogOpen}
        onClose={() => setCopyMemberDialogOpen(false)}
        onSave={handleCopyMember}
        isSaving={isCopyingMember}
        hasOwner={!!house?.owner}
        hasOccupant={!!house?.occupant}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        title={
          deleteTarget?.type === 'member'
            ? 'Hapus Anggota Keluarga'
            : deleteTarget?.type === 'owner'
            ? 'Hapus Pemilik Rumah'
            : 'Hapus Penghuni Rumah'
        }
        message={
          deleteTarget?.type === 'member'
            ? `Apakah Anda yakin ingin menghapus "${deleteTarget?.data?.name}" dari daftar anggota keluarga?`
            : deleteTarget?.type === 'owner'
            ? 'Apakah Anda yakin ingin menghapus data pemilik rumah ini?'
            : 'Apakah Anda yakin ingin menghapus data penghuni rumah ini?'
        }
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </PageContainer>
  );
}
