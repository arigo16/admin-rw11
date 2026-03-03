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
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import LinearProgress from '@mui/material/LinearProgress';
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtContribution } from '@/services/api';

export default function ContributionsPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [contributions, setContributions] = useState<RtContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (rtId) {
      fetchContributions();
    }
  }, [rtId]);

  const fetchContributions = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getContributions({});
      setContributions(response.data.data || []);
    } catch (err) {
      showError('Gagal memuat data iuran/donasi');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!rtId) {
    return (
      <PageContainer title="Iuran/Donasi" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Iuran/Donasi - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Iuran/Donasi {orgLabel}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Terkumpul</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
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
                  ) : contributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Belum ada data iuran/donasi</TableCell>
                    </TableRow>
                  ) : (
                    contributions.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell>
                          <Typography fontWeight={500}>{contribution.name}</Typography>
                          <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                            {contribution.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(contribution.goals)}</TableCell>
                        <TableCell>{formatCurrency(contribution.total_collected)}</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(contribution.progress_percentage, 100)}
                              color={contribution.progress_percentage >= 100 ? 'success' : 'primary'}
                              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">{contribution.progress_percentage}%</Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {contribution.transactions_count} transaksi
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={contribution.is_closed ? 'Selesai' : 'Aktif'}
                            color={contribution.is_closed ? 'default' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
