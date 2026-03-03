'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtBalance } from '@/services/api';
import { IconWallet, IconReceipt } from '@tabler/icons-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function BalancePage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [balance, setBalance] = useState<RtBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (rtId) {
      fetchBalance();
    }
  }, [rtId]);

  const fetchBalance = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getBalance();
      setBalance(response.data.data);
    } catch (err) {
      showError('Gagal memuat data saldo');
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
      <PageContainer title="Saldo" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Saldo - ${orgLabel}`} description="">
      <Box mt={3}>
        <Typography variant="h4" fontWeight={600} mb={3}>
          Saldo {orgLabel}
        </Typography>

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(3)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : balance ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Saldo Utama"
                value={formatCurrency(balance.balance)}
                icon={<IconWallet size={28} />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Saldo PKK"
                value={formatCurrency(balance.balance_pkk)}
                icon={<IconReceipt size={28} />}
                color="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <StatCard
                title="Total Saldo"
                value={formatCurrency(balance.total)}
                icon={<IconWallet size={28} />}
                color="success"
              />
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">Data saldo tidak tersedia.</Alert>
        )}
      </Box>
    </PageContainer>
  );
}
