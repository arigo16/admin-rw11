'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { IconPlus, IconEdit, IconTrash, IconPhoto, IconDotsVertical, IconSearch, IconRefresh, IconFilter } from '@tabler/icons-react';
import InputAdornment from '@mui/material/InputAdornment';
import { galleryAPI } from '@/services/api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface GalleryPhoto {
  id: number;
  gallery_event_id: number;
  foto: string;
  caption: string | null;
  sequence: number;
}

interface GalleryEvent {
  id: number;
  nama_event: string;
  deskripsi: string | null;
  tanggal_event: string | null;
  lokasi: string | null;
  photos: GalleryPhoto[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export default function GalleryPage() {
  const router = useRouter();
  const { showError, showSuccess } = useSnackbar();
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Event Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_event: '',
    deskripsi: '',
    tanggal_event: null as Dayjs | null,
    lokasi: '',
  });

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuEventId, setMenuEventId] = useState<number | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, eventId: number) => {
    setAnchorEl(event.currentTarget);
    setMenuEventId(eventId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEventId(null);
  };

  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage, search]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (search) params.search = search;

      const response = await galleryAPI.getAll(params);
      setEvents(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Event CRUD
  const handleOpenDialog = (data?: GalleryEvent) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        nama_event: data.nama_event,
        deskripsi: data.deskripsi || '',
        tanggal_event: data.tanggal_event ? dayjs(data.tanggal_event) : null,
        lokasi: data.lokasi || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        nama_event: '',
        deskripsi: '',
        tanggal_event: null,
        lokasi: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        nama_event: formData.nama_event,
        deskripsi: formData.deskripsi,
        tanggal_event: formData.tanggal_event ? formData.tanggal_event.format('YYYY-MM-DD') : null,
        lokasi: formData.lokasi,
      };

      if (editingId) {
        await galleryAPI.update(editingId, submitData);
        showSuccess('Event berhasil diperbarui');
      } else {
        await galleryAPI.create(submitData);
        showSuccess('Event berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchEvents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await galleryAPI.delete(deletingId);
      showSuccess('Event berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchEvents();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <PageContainer title="Gallery" description="Kelola gallery kegiatan RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Gallery Kegiatan
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Event
              </Button>
            </Box>

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
                    placeholder="Cari nama event..."
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
                    <TableCell>Nama Event</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Lokasi</TableCell>
                    <TableCell>Jumlah Foto</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Belum ada data gallery
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 250 }}>
                            {item.nama_event}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.tanggal_event ? dayjs(item.tanggal_event).format('DD MMM YYYY') : '-'}
                        </TableCell>
                        <TableCell>{item.lokasi || '-'}</TableCell>
                        <TableCell>{item.photos?.length || 0} foto</TableCell>
                        <TableCell align="center" sx={{ width: 50 }}>
                          <IconButton onClick={(e) => handleMenuOpen(e, item.id)}>
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
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
              }
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
              router.push(`/gallery/${menuEventId}/photos`);
              handleMenuClose();
            }}
          >
            <IconPhoto size={18} style={{ marginRight: 8 }} />
            Lihat Foto
          </MenuItem>
          <MenuItem
            onClick={() => {
              const event = events.find((e) => e.id === menuEventId);
              if (event) handleOpenDialog(event);
              handleMenuClose();
            }}
          >
            <IconEdit size={18} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeletingId(menuEventId);
              setOpenDeleteDialog(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Hapus
          </MenuItem>
        </Menu>

        {/* Add/Edit Event Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Event' : 'Tambah Event'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel htmlFor="nama_event">Nama Event</CustomFormLabel>
              <CustomTextField
                id="nama_event"
                placeholder="Masukkan nama event"
                fullWidth
                value={formData.nama_event}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nama_event: e.target.value })}
              />

              <CustomFormLabel htmlFor="tanggal_event">Tanggal Event</CustomFormLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.tanggal_event}
                  onChange={(newValue) => setFormData({ ...formData, tanggal_event: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Pilih tanggal',
                    },
                  }}
                />
              </LocalizationProvider>

              <CustomFormLabel htmlFor="lokasi">Lokasi</CustomFormLabel>
              <CustomTextField
                id="lokasi"
                placeholder="Masukkan lokasi"
                fullWidth
                value={formData.lokasi}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, lokasi: e.target.value })}
              />

              <CustomFormLabel htmlFor="deskripsi">Deskripsi</CustomFormLabel>
              <CustomTextField
                id="deskripsi"
                placeholder="Masukkan deskripsi"
                fullWidth
                multiline
                rows={3}
                value={formData.deskripsi}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Batal</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus event ini? Semua foto terkait juga akan dihapus.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}
