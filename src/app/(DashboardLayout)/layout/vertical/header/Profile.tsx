'use client';

import React, { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';
import { IconMail, IconUser, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import { getSecureItem, removeSecureItem, STORAGE_KEYS } from '@/utils/storage';

interface User {
  id: number;
  name: string;
  email: string;
}

const Profile = () => {
  const router = useRouter();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getSecureItem<User>(STORAGE_KEYS.USER);
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      removeSecureItem(STORAGE_KEYS.USER);
      // Remove auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/auth/login');
      router.refresh();
    }
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="profile menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: 'primary.main',
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'A'}
        </Avatar>
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '300px',
            p: 3,
          },
        }}
      >
        <Typography variant="h5" mb={2}>Profil Pengguna</Typography>
        <Stack direction="row" py={2} spacing={2} alignItems="center">
          <Avatar
            sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
              {user?.name || 'Administrator'}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              {user?.email || 'admin@rw11.id'}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<IconLogout size={18} />}
            onClick={handleLogout}
          >
            Keluar
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
