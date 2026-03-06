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
import { createRtAPI, RtTransaction } from '@/services/api';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import { IconRefresh, IconFilter } from '@tabler/icons-react';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function TransactionsPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [transactions, setTransactions] = useState<RtTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMutation, setFilterMutation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchTransactions();
    }
  }, [rtId, page, rowsPerPage, filterCategory, filterMutation, startDate, endDate]);

  const fetchTransactions = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (filterCategory) params.category = filterCategory;
      if (filterMutation) params.mutation = filterMutation;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await rtAPI.getTransactions(params);
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
  };

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };

  if (!rtId) {
    return (
      <PageContainer title="Transaksi" description="">
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
    <PageContainer title={`Transaksi - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Transaksi {orgLabel}
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
                    value={filterCategory}
                    onChange={(e: any) => handleFilterChange(setFilterCategory)(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Kategori"
                  >
                    <MenuItem value="">Semua Kategori</MenuItem>
                    <MenuItem value="utama">Utama</MenuItem>
                    <MenuItem value="pkk">PKK</MenuItem>
                  </CustomSelect>
                  <CustomSelect
                    value={filterMutation}
                    onChange={(e: any) => handleFilterChange(setFilterMutation)(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Mutasi"
                  >
                    <MenuItem value="">Semua Mutasi</MenuItem>
                    <MenuItem value="kredit">Masuk (Kredit)</MenuItem>
                    <MenuItem value="debit">Keluar (Debit)</MenuItem>
                  </CustomSelect>
                  <CustomTextField
                    type="date"
                    label="Dari Tanggal"
                    value={startDate}
                    onChange={(e: any) => handleFilterChange(setStartDate)(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: '100%' }}
                  />
                  <CustomTextField
                    type="date"
                    label="Sampai Tanggal"
                    value={endDate}
                    onChange={(e: any) => handleFilterChange(setEndDate)(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: '100%' }}
                  />
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
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Keterangan</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Mutasi</TableCell>
                    <TableCell align="right">Jumlah</TableCell>
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
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Belum ada data transaksi</TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {new Date(tx.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>{tx.notes || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={tx.category}
                            color={tx.category === 'UTAMA' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tx.mutation === 'KREDIT' ? 'Masuk' : 'Keluar'}
                            color={tx.mutation === 'KREDIT' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={tx.mutation === 'KREDIT' ? 'success.main' : 'error.main'}
                            fontWeight={500}
                          >
                            {tx.mutation === 'KREDIT' ? '+' : '-'} Rp {tx.amount?.toLocaleString('id-ID')}
                          </Typography>
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
