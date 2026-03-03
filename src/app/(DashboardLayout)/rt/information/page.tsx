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
import { createRtAPI, RtInformation } from '@/services/api';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function InformationPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [information, setInformation] = useState<RtInformation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchInformation();
    }
  }, [rtId, page, rowsPerPage]);

  const fetchInformation = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getInformation({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setInformation(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data pengumuman');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rtId) {
    return (
      <PageContainer title="Pengumuman" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Pengumuman - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Pengumuman {orgLabel}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    <TableCell>Konten</TableCell>
                    <TableCell>Pin</TableCell>
                    <TableCell>Tanggal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(4)].map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : information.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Belum ada data pengumuman</TableCell>
                    </TableRow>
                  ) : (
                    information.map((info) => (
                      <TableRow key={info.id}>
                        <TableCell>
                          <Typography fontWeight={500}>{info.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {info.content}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {info.is_pin && (
                            <Chip
                              label="Pinned"
                              color="primary"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(info.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
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
