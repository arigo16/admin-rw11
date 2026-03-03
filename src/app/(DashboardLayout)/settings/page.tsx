'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import PageContainer from '@/app/components/container/PageContainer';
import { IconUser, IconMail, IconCalendar } from '@tabler/icons-react';

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <PageContainer title="Pengaturan" description="Pengaturan akun">
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" py={3}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      mb: 2,
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    {user?.name || 'Administrator'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Administrator
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  Informasi Akun
                </Typography>

                <Box display="flex" alignItems="center" gap={2} py={2}>
                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                    <IconUser size={20} color="#5D87FF" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Nama
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.name || '-'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box display="flex" alignItems="center" gap={2} py={2}>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <IconMail size={20} color="#13DEB9" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.email || '-'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box display="flex" alignItems="center" gap={2} py={2}>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <IconCalendar size={20} color="#FFAE1F" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      ID Pengguna
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.id || '-'}
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
