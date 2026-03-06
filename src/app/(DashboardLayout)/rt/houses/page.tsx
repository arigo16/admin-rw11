'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import InputAdornment from '@mui/material/InputAdornment';
import PageContainer from '@/app/components/container/PageContainer';
import { useOrg } from '@/app/context/orgContext';
import { useSnackbar } from '@/app/context/snackbarContext';
import { createRtAPI, RtHouse } from '@/services/api';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import { IconSearch, IconRefresh, IconFilter, IconDotsVertical, IconEye } from '@tabler/icons-react';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function RtHousesPage() {
  const router = useRouter();
  const { rtId, orgLabel } = useOrg();
  const { showError } = useSnackbar();
  const [houses, setHouses] = useState<RtHouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [filterOccupied, setFilterOccupied] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Action menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuHouseId, setMenuHouseId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, houseId: number) => {
    setAnchorEl(event.currentTarget);
    setMenuHouseId(houseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuHouseId(null);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (rtId) {
      fetchHouses();
    }
  }, [rtId, page, rowsPerPage, search, filterOccupied]);

  const fetchHouses = async () => {
    if (!rtId) return;
    setIsLoading(true);
    try {
      const rtAPI = createRtAPI(rtId);
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (search) params.search = search;
      if (filterOccupied !== '') params.occupied = filterOccupied;

      const response = await rtAPI.getHouses(params);
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

  const handleRefresh = () => {
    fetchHouses();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleFilterOccupiedChange = (value: string) => {
    setFilterOccupied(value);
    setPage(0);
  };

  if (!rtId) {
    return (
      <PageContainer title="Data Rumah" description="">
        <Box mt={3}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
              <Box display="flex" gap={2} mb={3}>
                <Skeleton variant="rounded" width={300} height={40} />
                <Skeleton variant="rounded" width={150} height={40} />
              </Box>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="text" height={50} sx={{ mb: 1 }} />
              ))}
            </CardContent>
          </Card>
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

            {/* Filter Section */}
            <Box display="flex" gap={2} mb={3} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<IconFilter size={18} />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                Filter
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => setFilterAnchorEl(null)}
                slotProps={{ paper: { sx: { p: 2, minWidth: 280 } } }}
              >
                <Box display="flex" flexDirection="column" gap={2}>
                  <CustomTextField
                    placeholder="Cari pemilik/penghuni/blok..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                    sx={{ width: '100%' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <CustomSelect
                    value={filterOccupied}
                    onChange={(e: any) => handleFilterOccupiedChange(e.target.value)}
                    sx={{ width: '100%' }}
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="1">Terisi</MenuItem>
                    <MenuItem value="0">Kosong</MenuItem>
                  </CustomSelect>
                </Box>
              </Menu>
              <Box flexGrow={1} />
              <Button
                variant="outlined"
                startIcon={<IconRefresh size={18} />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alamat</TableCell>
                    <TableCell>Pemilik</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>IPL</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
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
                  ) : houses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Belum ada data rumah</TableCell>
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
                        <TableCell align="center" sx={{ width: 50 }}>
                          <IconButton onClick={(e) => handleMenuOpen(e, house.id)}>
                            <IconDotsVertical size={18} />
                          </IconButton>
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

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              router.push(`/rt/houses/${menuHouseId}`);
              handleMenuClose();
            }}
          >
            <IconEye size={18} style={{ marginRight: 8 }} />
            Lihat Detail
          </MenuItem>
        </Menu>
      </Box>
    </PageContainer>
  );
}
