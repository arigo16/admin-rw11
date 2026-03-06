'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtBill } from '@/services/api';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import { IconRefresh, IconFilter } from '@tabler/icons-react';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const getStatusColor = (status: string) => {
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

const getStatusLabel = (status: string) => {
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

const monthOptions = [
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

const getMonthName = (month: number) => {
  return monthOptions.find((m) => m.value === month)?.label || '';
};

// Generate year options (current year - 5 to current year + 1)
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

export default function CashBillsPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [bills, setBills] = useState<RtBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchBills();
    }
  }, [rtId, page, rowsPerPage, filterYear, filterMonth, filterStatus]);

  const fetchBills = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (filterYear) params.year = filterYear;
      if (filterMonth) params.month = filterMonth;
      if (filterStatus) params.status = filterStatus;

      const response = await rtAPI.getBillsCash(params);
      setBills(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data tagihan Kas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBills();
  };

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };

  if (!rtId) {
    return (
      <PageContainer title="Tagihan Kas" description="">
        <Box mt={3}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
              <Box display="flex" gap={2} mb={3}>
                <Skeleton variant="rounded" width={150} height={40} />
                <Skeleton variant="rounded" width={150} height={40} />
              </Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="text" height={50} sx={{ mb: 1 }} />
              ))}
            </CardContent>
          </Card>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Tagihan Kas - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Tagihan Kas {orgLabel}
            </Typography>

            {/* Filter Section */}
            <Box display="flex" gap={2} mb={3} alignItems="center">
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
                slotProps={{ paper: { sx: { p: 2, minWidth: 280 } } }}
              >
                <Box display="flex" flexDirection="column" gap={2}>
                  <CustomSelect
                    value={filterYear}
                    onChange={(e: any) => handleFilterChange(setFilterYear)(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Tahun"
                  >
                    <MenuItem value="">Semua Tahun</MenuItem>
                    {yearOptions.map((year) => (
                      <MenuItem key={year} value={String(year)}>
                        {year}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                  <CustomSelect
                    value={filterMonth}
                    onChange={(e: any) => handleFilterChange(setFilterMonth)(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Bulan"
                  >
                    <MenuItem value="">Semua Bulan</MenuItem>
                    {monthOptions.map((month) => (
                      <MenuItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                  <CustomSelect
                    value={filterStatus}
                    onChange={(e: any) => handleFilterChange(setFilterStatus)(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Status"
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="unpaid">Belum Bayar</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Lunas</MenuItem>
                  </CustomSelect>
                </Box>
              </Menu>
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
                    <TableCell>Alamat</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal Bayar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : bills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Belum ada data tagihan Kas</TableCell>
                    </TableRow>
                  ) : (
                    bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          {bill.house ? `Blok ${bill.house.block} No. ${bill.house.no}` : '-'}
                        </TableCell>
                        <TableCell>
                          {getMonthName(bill.month_bill)} {bill.year_bill}
                        </TableCell>
                        <TableCell>
                          Rp {bill.amount?.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(bill.status)}
                            color={getStatusColor(bill.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>-</TableCell>
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
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Baris per halaman:"
            />
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
