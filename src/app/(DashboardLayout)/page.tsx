'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import PageContainer from '@/app/components/container/PageContainer';
import StatCard from '@/app/components/dashboard/StatCard';
import {
  IconUsers,
  IconNews,
  IconFileText,
  IconPhoto,
  IconPackage,
  IconInfoCircle,
} from '@tabler/icons-react';
import { pengurusAPI, beritaAPI, dokumenAPI, galleryAPI, assetsAPI } from '@/services/api';

interface DashboardStats {
  pengurus: number;
  berita: { total: number; published: number; draft: number };
  dokumen: { total: number; public: number; private: number };
  gallery: number;
  assets: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pengurus: 0,
    berita: { total: 0, published: 0, draft: 0 },
    dokumen: { total: 0, public: 0, private: 0 },
    gallery: 0,
    assets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [pengurusRes, beritaRes, dokumenRes, galleryRes, assetsRes] = await Promise.allSettled([
        pengurusAPI.getAll(),
        beritaAPI.getAll(),
        dokumenAPI.getAll(),
        galleryAPI.getAll(),
        assetsAPI.getAll(),
      ]);

      const pengurusData = pengurusRes.status === 'fulfilled' ? pengurusRes.value.data.data || [] : [];
      const beritaData = beritaRes.status === 'fulfilled' ? beritaRes.value.data.data || [] : [];
      const dokumenData = dokumenRes.status === 'fulfilled' ? dokumenRes.value.data.data || [] : [];
      const galleryData = galleryRes.status === 'fulfilled' ? galleryRes.value.data.data || [] : [];
      const assetsData = assetsRes.status === 'fulfilled' ? assetsRes.value.data.data || [] : [];

      setStats({
        pengurus: pengurusData.length,
        berita: {
          total: beritaData.length,
          published: beritaData.filter((b: any) => b.is_published).length,
          draft: beritaData.filter((b: any) => !b.is_published).length,
        },
        dokumen: {
          total: dokumenData.length,
          public: dokumenData.filter((d: any) => d.is_public).length,
          private: dokumenData.filter((d: any) => !d.is_public).length,
        },
        gallery: galleryData.length,
        assets: assetsData.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Dashboard" description="Dashboard Admin Portal RW11">
      <Box mt={3}>
        {/* Welcome Card */}
        <Card elevation={0} sx={{ mb: 3, bgcolor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h4" fontWeight={700}>
              Selamat Datang, {user?.name || 'Administrator'}!
            </Typography>
            <Typography variant="body1" color="textSecondary" mt={1}>
              Admin Portal RW11 - Sistem Administrasi Warga
            </Typography>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <StatCard
                title="Total Pengurus"
                value={stats.pengurus}
                icon={<IconUsers size={28} color="white" />}
                color="primary"
                subtitle="Pengurus aktif RW"
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <StatCard
                title="Total Berita"
                value={stats.berita.total}
                icon={<IconNews size={28} color="white" />}
                color="success"
                subtitle={`${stats.berita.published} published, ${stats.berita.draft} draft`}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <StatCard
                title="Total Dokumen"
                value={stats.dokumen.total}
                icon={<IconFileText size={28} color="white" />}
                color="warning"
                subtitle={`${stats.dokumen.public} publik, ${stats.dokumen.private} privat`}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <StatCard
                title="Gallery Events"
                value={stats.gallery}
                icon={<IconPhoto size={28} color="white" />}
                color="info"
                subtitle="Event & kegiatan"
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            {isLoading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <StatCard
                title="Total Assets"
                value={stats.assets}
                icon={<IconPackage size={28} color="white" />}
                color="secondary"
                subtitle="Aset RW"
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card elevation={0} sx={{ bgcolor: 'grey.100', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <IconInfoCircle size={28} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Info RW
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Kelola informasi & profil RW
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
