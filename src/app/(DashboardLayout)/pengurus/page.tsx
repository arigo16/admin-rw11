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
import FormControlLabel from '@mui/material/FormControlLabel';
import Skeleton from '@mui/material/Skeleton';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomSwitch from '@/app/components/forms/theme-elements/CustomSwitch';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import Menu from '@mui/material/Menu';
import { IconPlus, IconEdit, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { pengurusAPI } from '@/services/api';

interface Pengurus {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string;
  sequence: number;
  foto: string | null;
  is_active: boolean;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const bidangOptions = [
  'Pengurus Inti',
  'Kasepuhan & Kerukunan Masyarakat',
  'Ketua RT',
  'Sekretariat',
  'Bendahara',
  'Keamanan',
  'Kebersihan',
  'Pembangunan',
];

export default function PengurusPage() {
  const [pengurus, setPengurus] = useState<Pengurus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useSnackbar();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    bidang: '',
    periode: '',
    sequence: '',
    is_active: false,
  });

  // Delete dialog
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
    fetchPengurus();
  }, [page, rowsPerPage]);

  const fetchPengurus = async () => {
    setIsLoading(true);
    try {
      const response = await pengurusAPI.getAll({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setPengurus(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data pengurus');
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

  const handleOpenDialog = (data?: Pengurus) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        nama: data.nama,
        jabatan: data.jabatan,
        bidang: data.bidang,
        periode: data.periode,
        sequence: data.sequence,
        is_active: data.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        jabatan: '',
        bidang: '',
        periode: '',
        sequence: '',
        is_active: false,
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
        ...formData,
        sequence: formData.sequence ? parseInt(formData.sequence as string) : 0,
      };
      if (editingId) {
        await pengurusAPI.update(editingId, submitData);
        showSuccess('Pengurus berhasil diperbarui');
      } else {
        await pengurusAPI.create(submitData);
        showSuccess('Pengurus berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchPengurus();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await pengurusAPI.delete(deletingId);
      showSuccess('Pengurus berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchPengurus();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <PageContainer title="Pengurus" description="Kelola data pengurus RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Data Pengurus RW
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Pengurus
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama</TableCell>
                    <TableCell>Jabatan</TableCell>
                    <TableCell>Bidang</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : pengurus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Belum ada data pengurus
                      </TableCell>
                    </TableRow>
                  ) : (
                    pengurus.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.jabatan}</TableCell>
                        <TableCell>{item.bidang}</TableCell>
                        <TableCell>{item.periode}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.is_active ? 'Aktif' : 'Nonaktif'}
                            color={item.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
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
          <DialogTitle>
            {editingId ? 'Edit Pengurus' : 'Tambah Pengurus'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel htmlFor="nama">Nama</CustomFormLabel>
              <CustomTextField
                id="nama"
                placeholder="Masukkan nama"
                fullWidth
                value={formData.nama}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nama: e.target.value })}
              />

              <CustomFormLabel htmlFor="jabatan">Jabatan</CustomFormLabel>
              <CustomTextField
                id="jabatan"
                placeholder="Masukkan jabatan"
                fullWidth
                value={formData.jabatan}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, jabatan: e.target.value })}
              />

              <CustomFormLabel htmlFor="bidang">Bidang</CustomFormLabel>
              <CustomSelect
                id="bidang"
                value={formData.bidang}
                onChange={(e: any) => setFormData({ ...formData, bidang: e.target.value })}
                fullWidth
                placeholder="Pilih bidang"
              >
                {bidangOptions.map((bidang) => (
                  <MenuItem key={bidang} value={bidang}>
                    {bidang}
                  </MenuItem>
                ))}
              </CustomSelect>

              <CustomFormLabel htmlFor="periode">Periode</CustomFormLabel>
              <CustomTextField
                id="periode"
                placeholder="Masukkan periode"
                fullWidth
                value={formData.periode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, periode: e.target.value })}
              />

              <CustomFormLabel htmlFor="sequence">Urutan</CustomFormLabel>
              <CustomTextField
                id="sequence"
                placeholder="Masukkan urutan"
                fullWidth
                value={formData.sequence}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, sequence: value });
                }}
              />

              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <CustomSwitch
                    checked={formData.is_active}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Aktif"
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
              const item = pengurus.find((p) => p.id === menuItemId);
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
            <Typography>Apakah Anda yakin ingin menghapus pengurus ini?</Typography>
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
