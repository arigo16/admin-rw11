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
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomSelect from '@/app/components/forms/theme-elements/CustomSelect';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import Menu from '@mui/material/Menu';
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconDotsVertical, IconUpload } from '@tabler/icons-react';
import { beritaAPI } from '@/services/api';
import dynamic from 'next/dynamic';

// Dynamic import untuk TiptapEditor (client-only)
const TiptapEditor = dynamic(
  () => import('@/app/components/forms/form-tiptap/TiptapEditor'),
  { ssr: false }
);

interface Berita {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string;
  thumbnail: string | null;
  kategori: string;
  is_published: boolean;
  published_at: string | null;
  author: { id: number; name: string };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const kategoriOptions = ['Kegiatan', 'Pengumuman', 'Info', 'Lainnya'];

export default function BeritaPage() {
  const { showError, showSuccess } = useSnackbar();
  const [berita, setBerita] = useState<Berita[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    ringkasan: '',
    kategori: '',
    is_published: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

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
    fetchBerita();
  }, [page, rowsPerPage]);

  const fetchBerita = async () => {
    setIsLoading(true);
    try {
      const response = await beritaAPI.getAll({
        page: page + 1,
        per_page: rowsPerPage,
      });
      setBerita(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data berita');
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

  const handleOpenDialog = (data?: Berita) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        judul: data.judul,
        konten: data.konten,
        ringkasan: data.ringkasan || '',
        kategori: data.kategori,
        is_published: data.is_published,
      });
      setThumbnailPreview(data.thumbnail || null);
    } else {
      setEditingId(null);
      setFormData({
        judul: '',
        konten: '',
        ringkasan: '',
        kategori: '',
        is_published: false,
      });
      setThumbnailPreview(null);
    }
    setThumbnailFile(null);
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
      submitFormData.append('judul', formData.judul);
      submitFormData.append('konten', formData.konten);
      submitFormData.append('ringkasan', formData.ringkasan);
      submitFormData.append('kategori', formData.kategori);
      submitFormData.append('is_published', formData.is_published ? '1' : '0');

      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile);
      }

      if (editingId) {
        submitFormData.append('_method', 'PUT');
        await beritaAPI.update(editingId, submitFormData);
        showSuccess('Berita berhasil diperbarui');
      } else {
        await beritaAPI.create(submitFormData);
        showSuccess('Berita berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchBerita();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    try {
      if (isPublished) {
        await beritaAPI.unpublish(id);
        showSuccess('Berita berhasil di-unpublish');
      } else {
        await beritaAPI.publish(id);
        showSuccess('Berita berhasil dipublish');
      }
      fetchBerita();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await beritaAPI.delete(deletingId);
      showSuccess('Berita berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchBerita();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  return (
    <PageContainer title="Berita" description="Kelola berita RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Data Berita
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Berita
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Judul</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal Publish</TableCell>
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
                  ) : berita.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Belum ada data berita
                      </TableCell>
                    </TableRow>
                  ) : (
                    berita.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 300 }}>
                            {item.judul}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.kategori}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.is_published ? 'Published' : 'Draft'}
                            color={item.is_published ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString('id-ID')
                            : '-'}
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
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{editingId ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel htmlFor="judul">Judul</CustomFormLabel>
              <CustomTextField
                id="judul"
                placeholder="Masukkan judul berita"
                fullWidth
                value={formData.judul}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, judul: e.target.value })}
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

              <CustomFormLabel htmlFor="ringkasan">Ringkasan</CustomFormLabel>
              <CustomTextField
                id="ringkasan"
                placeholder="Ringkasan singkat untuk preview"
                fullWidth
                multiline
                rows={2}
                value={formData.ringkasan}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, ringkasan: e.target.value })}
              />

              <CustomFormLabel>Konten</CustomFormLabel>
              <TiptapEditor
                value={formData.konten}
                onChange={(html) => setFormData({ ...formData, konten: html })}
                placeholder="Ketik konten berita di sini..."
              />

              <CustomFormLabel>Thumbnail</CustomFormLabel>
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
                onClick={() => document.getElementById('thumbnail-input')?.click()}
              >
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {thumbnailPreview ? (
                  <Box>
                    <img
                      src={thumbnailPreview.startsWith('blob:') ? thumbnailPreview : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${thumbnailPreview}`}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti thumbnail
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary">
                      Klik untuk upload thumbnail
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
          {(() => {
            const item = berita.find((b) => b.id === menuItemId);
            return (
              <MenuItem
                onClick={() => {
                  if (item) handleTogglePublish(item.id, item.is_published);
                  handleMenuClose();
                }}
              >
                {item?.is_published ? (
                  <>
                    <IconEyeOff size={18} style={{ marginRight: 8 }} />
                    Unpublish
                  </>
                ) : (
                  <>
                    <IconEye size={18} style={{ marginRight: 8 }} />
                    Publish
                  </>
                )}
              </MenuItem>
            );
          })()}
          <MenuItem
            onClick={() => {
              const item = berita.find((b) => b.id === menuItemId);
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
            <Typography>Apakah Anda yakin ingin menghapus berita ini?</Typography>
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
