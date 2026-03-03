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
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtVote } from '@/services/api';

export default function VotesPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [votes, setVotes] = useState<RtVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (rtId) {
      fetchVotes();
    }
  }, [rtId]);

  const fetchVotes = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getVotes({});
      setVotes(response.data.data || []);
    } catch (err) {
      showError('Gagal memuat data voting');
    } finally {
      setIsLoading(false);
    }
  };

  if (!rtId) {
    return (
      <PageContainer title="Voting" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Voting - ${orgLabel}`} description="">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={600} mb={3}>
              Voting {orgLabel}
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    <TableCell>Deskripsi</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Jumlah Jawaban</TableCell>
                    <TableCell>Periode</TableCell>
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
                  ) : votes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Belum ada data voting</TableCell>
                    </TableRow>
                  ) : (
                    votes.map((vote) => (
                      <TableRow key={vote.id}>
                        <TableCell>{vote.title}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {vote.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={vote.is_active ? 'Aktif' : 'Selesai'}
                            color={vote.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {vote.answers_count || 0} suara
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(vote.start_vote).toLocaleDateString('id-ID')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            s/d {new Date(vote.end_vote).toLocaleDateString('id-ID')}
                          </Typography>
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
