'use client';

import { useState, useEffect } from 'react';
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
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import Menu from '@mui/material/Menu';
import { IconPlus, IconEdit, IconTrash, IconUpload, IconDotsVertical } from '@tabler/icons-react';
import { assetsAPI } from '@/services/api';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface Asset {
  id: number;
  nama: string;
  kategori: string;
  kondisi: string;
  deskripsi: string;
  foto: string | null;
  jumlah: number;
  tanggal_perolehan: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const kondisiOptions = [
  { value: 'baik', label: 'Baik', color: 'success' as const },
  { value: 'rusak_ringan', label: 'Rusak Ringan', color: 'warning' as const },
  { value: 'rusak_berat', label: 'Rusak Berat', color: 'error' as const },
];

const kategoriOptions = ['Peralatan', 'Kendaraan', 'Elektronik', 'Furniture', 'Lainnya'];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useSnackbar();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    kategori: '',
    kondisi: '',
    deskripsi: '',
    jumlah: '',
    tanggal_perolehan: null as Dayjs | null,
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  useEffect(() => {
    fetchAssets();
  }, [page, rowsPerPage]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await assetsAPI.getAll({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setAssets(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data inventaris');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (data?: Asset) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        nama: data.nama,
        kategori: data.kategori,
        kondisi: data.kondisi,
        deskripsi: data.deskripsi || '',
        jumlah: String(data.jumlah),
        tanggal_perolehan: data.tanggal_perolehan ? dayjs(data.tanggal_perolehan) : null,
      });
      setFotoPreview(data.foto || null);
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        kategori: '',
        kondisi: '',
        deskripsi: '',
        jumlah: '',
        tanggal_perolehan: null,
      });
      setFotoPreview(null);
    }
    setFotoFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('nama', formData.nama);
      submitFormData.append('kategori', formData.kategori);
      submitFormData.append('kondisi', formData.kondisi);
      submitFormData.append('deskripsi', formData.deskripsi);
      submitFormData.append('jumlah', formData.jumlah ? String(parseInt(formData.jumlah)) : '0');
      submitFormData.append('tanggal_perolehan', formData.tanggal_perolehan ? formData.tanggal_perolehan.format('YYYY-MM-DD') : '');

      if (fotoFile) {
        submitFormData.append('foto', fotoFile);
      }

      if (editingId) {
        submitFormData.append('_method', 'PUT');
        await assetsAPI.update(editingId, submitFormData);
        showSuccess('Inventaris berhasil diperbarui');
      } else {
        await assetsAPI.create(submitFormData);
        showSuccess('Inventaris berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchAssets();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await assetsAPI.delete(deletingId);
      showSuccess('Inventaris berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchAssets();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const getKondisiChip = (kondisi: string) => {
    const option = kondisiOptions.find((o) => o.value === kondisi);
    return (
      <Chip
        label={option?.label || kondisi}
        color={option?.color || 'default'}
        size="small"
      />
    );
  };

  return (
    <PageContainer title="Inventaris" description="Kelola data inventaris RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Data Inventaris
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Inventaris
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Foto</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Kondisi</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Tanggal Perolehan</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Belum ada data inventaris
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.foto ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.foto}`}
                              alt={item.nama}
                              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" color="textSecondary">
                                -
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.kategori}</TableCell>
                        <TableCell>{getKondisiChip(item.kondisi)}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{item.tanggal_perolehan ? dayjs(item.tanggal_perolehan).format('DD MMM YYYY') : '-'}</TableCell>
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

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Inventaris' : 'Tambah Inventaris'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel htmlFor="nama">Nama</CustomFormLabel>
              <CustomTextField
                id="nama"
                placeholder="Masukkan nama inventaris"
                fullWidth
                value={formData.nama}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nama: e.target.value })}
              />

              <CustomFormLabel htmlFor="kategori">Kategori</CustomFormLabel>
              <CustomSelect
                id="kategori"
                value={formData.kategori}
                onChange={(e: any) => setFormData({ ...formData, kategori: e.target.value })}
                fullWidth
                placeholder="Pilih kategori"
              >
                {kategoriOptions.map((kategori) => (
                  <MenuItem key={kategori} value={kategori}>
                    {kategori}
                  </MenuItem>
                ))}
              </CustomSelect>

              <CustomFormLabel htmlFor="kondisi">Kondisi</CustomFormLabel>
              <CustomSelect
                id="kondisi"
                value={formData.kondisi}
                onChange={(e: any) => setFormData({ ...formData, kondisi: e.target.value })}
                fullWidth
                placeholder="Pilih kondisi"
              >
                {kondisiOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </CustomSelect>

              <CustomFormLabel htmlFor="jumlah">Jumlah</CustomFormLabel>
              <CustomTextField
                id="jumlah"
                placeholder="Masukkan jumlah"
                fullWidth
                value={formData.jumlah}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, jumlah: value });
                }}
              />

              <CustomFormLabel htmlFor="tanggal_perolehan">Tanggal Perolehan</CustomFormLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.tanggal_perolehan}
                  onChange={(newValue) => setFormData({ ...formData, tanggal_perolehan: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Pilih tanggal',
                    },
                  }}
                />
              </LocalizationProvider>

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

              <CustomFormLabel>Foto</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => document.getElementById('foto-input')?.click()}
              >
                <input
                  id="foto-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFotoFile(file);
                      setFotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {fotoPreview ? (
                  <Box>
                    <img
                      src={fotoPreview.startsWith('blob:') ? fotoPreview : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${fotoPreview}`}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti foto
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary">
                      Klik untuk upload foto
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Batal</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

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
              const item = assets.find((a) => a.id === menuItemId);
              if (item) handleOpenDialog(item);
              handleMenuClose();
            }}
          >
            <IconEdit size={18} style={{ marginRight: 8 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeletingId(menuItemId);
              setOpenDeleteDialog(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Hapus
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>Apakah Anda yakin ingin menghapus inventaris ini?</Typography>
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
