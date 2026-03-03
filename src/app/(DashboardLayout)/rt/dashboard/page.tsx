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
import { createRtAPI, RtDashboard } from '@/services/api';
import {
  IconHome,
  IconReceipt,
  IconWallet,
  IconChartBar,
  IconMessageCircle,
  IconBulb,
} from '@tabler/icons-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
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
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function RtDashboardPage() {
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [dashboard, setDashboard] = useState<RtDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (rtId) {
      fetchDashboard();
    }
  }, [rtId]);

  const fetchDashboard = async () => {
    if (!rtId) return;

    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const response = await rtAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (err) {
      showError('Gagal memuat data dashboard');
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
      <PageContainer title="RT Dashboard" description="">
        <Box mt={3}>
          <Alert severity="warning">Silakan pilih RT dari dropdown di sidebar.</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Dashboard ${orgLabel}`} description={`Dashboard ${orgLabel}`}>
      <Box mt={3}>
        <Typography variant="h4" fontWeight={600} mb={3}>
          Dashboard {orgLabel}
        </Typography>

        {isLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : dashboard ? (
          <>
            {/* Statistik Rumah */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Data Rumah
            </Typography>
            <Grid container spacing={3} mb={4}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Total Rumah"
                  value={dashboard.houses.total}
                  icon={<IconHome size={28} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Rumah Terisi"
                  value={dashboard.houses.occupied}
                  icon={<IconHome size={28} />}
                  color="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Rumah Kosong"
                  value={dashboard.houses.empty}
                  icon={<IconHome size={28} />}
                  color="warning"
                />
              </Grid>
            </Grid>

            {/* Statistik Keuangan */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Keuangan
            </Typography>
            <Grid container spacing={3} mb={4}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Saldo Utama"
                  value={formatCurrency(dashboard.balance.main)}
                  icon={<IconWallet size={28} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Saldo PKK"
                  value={formatCurrency(dashboard.balance.pkk)}
                  icon={<IconWallet size={28} />}
                  color="secondary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Total Saldo"
                  value={formatCurrency(dashboard.balance.total)}
                  icon={<IconWallet size={28} />}
                  color="success"
                />
              </Grid>
            </Grid>

            {/* Tagihan Belum Dibayar */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Tagihan Belum Dibayar
            </Typography>
            <Grid container spacing={3} mb={4}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="IPL"
                  value={dashboard.unpaid_bills.ipl}
                  subtitle="tagihan"
                  icon={<IconReceipt size={28} />}
                  color="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Kas"
                  value={dashboard.unpaid_bills.cash}
                  subtitle="tagihan"
                  icon={<IconReceipt size={28} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="PKK"
                  value={dashboard.unpaid_bills.pkk}
                  subtitle="tagihan"
                  icon={<IconReceipt size={28} />}
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Total"
                  value={dashboard.unpaid_bills.total}
                  subtitle="tagihan"
                  icon={<IconReceipt size={28} />}
                  color="error"
                />
              </Grid>
            </Grid>

            {/* Status Lainnya */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Status Lainnya
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Voting Aktif"
                  value={dashboard.active_votes}
                  icon={<IconChartBar size={28} />}
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Keluhan Pending"
                  value={dashboard.pending.complaints}
                  icon={<IconMessageCircle size={28} />}
                  color="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title="Saran Pending"
                  value={dashboard.pending.suggestions}
                  icon={<IconBulb size={28} />}
                  color="info"
                />
              </Grid>
            </Grid>
          </>
        ) : (
          <Alert severity="info">Data dashboard tidak tersedia.</Alert>
        )}
      </Box>
    </PageContainer>
  );
}
