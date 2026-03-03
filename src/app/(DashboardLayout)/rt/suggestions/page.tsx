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
import { createRtAPI, RtSuggestion } from '@/services/api';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function SuggestionsPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [suggestions, setSuggestions] = useState<RtSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchSuggestions();
    }
  }, [rtId, page, rowsPerPage]);

  const fetchSuggestions = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getSuggestions({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setSuggestions(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data saran');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rtId) {
    return (
      <PageContainer title="Saran" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Saran - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Saran Warga {orgLabel}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alamat</TableCell>
                    <TableCell>Saran</TableCell>
                    <TableCell>Status</TableCell>
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
                  ) : suggestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Belum ada data saran</TableCell>
                    </TableRow>
                  ) : (
                    suggestions.map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell>
                          <Typography fontWeight={500}>
                            Blok {suggestion.house.block} No. {suggestion.house.no}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {suggestion.suggestion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={suggestion.is_read ? 'Sudah Dibaca' : 'Belum Dibaca'}
                            color={suggestion.is_read ? 'default' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(suggestion.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
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
