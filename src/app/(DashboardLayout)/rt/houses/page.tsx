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
import { createRtAPI, RtHouse } from '@/services/api';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function RtHousesPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [houses, setHouses] = useState<RtHouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchHouses();
    }
  }, [rtId, page, rowsPerPage]);

  const fetchHouses = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getHouses({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setHouses(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data rumah');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rtId) {
    return (
      <PageContainer title="Data Rumah" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Data Rumah - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Data Rumah {orgLabel}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alamat</TableCell>
                    <TableCell>Pemilik</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>IPL</TableCell>
                    <TableCell>Kas</TableCell>
                    <TableCell>PKK</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : houses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Belum ada data rumah</TableCell>
                    </TableRow>
                  ) : (
                    houses.map((house) => (
                      <TableRow key={house.id}>
                        <TableCell>Blok {house.block} No. {house.no}</TableCell>
                        <TableCell>{house.owner?.name || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={house.occupied ? 'Terisi' : 'Kosong'}
                            color={house.occupied ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {house.pay_ipl ? (
                            <Typography variant="body2">
                              Rp {house.ipl_amount?.toLocaleString('id-ID')}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {house.pay_cash ? (
                            <Typography variant="body2">
                              Rp {house.cash_amount?.toLocaleString('id-ID')}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {house.pay_pkk ? (
                            <Typography variant="body2">
                              Rp {house.pkk_amount?.toLocaleString('id-ID')}
                            </Typography>
                          ) : '-'}
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
