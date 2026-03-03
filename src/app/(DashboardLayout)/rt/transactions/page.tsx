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
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtTransaction } from '@/services/api';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchTransactions();
    }
  }, [rtId, page, rowsPerPage]);

  const fetchTransactions = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getTransactions({
        page: page + 1,
        per_page: rowsPerPage,
      });
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

  if (!rtId) {
    return (
      <PageContainer title="Transaksi" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
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
