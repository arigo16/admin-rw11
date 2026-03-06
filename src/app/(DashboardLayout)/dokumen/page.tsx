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
import { IconPlus, IconEdit, IconTrash, IconLock, IconLockOpen, IconDotsVertical, IconUpload, IconFile, IconSearch, IconRefresh, IconFilter } from '@tabler/icons-react';
import InputAdornment from '@mui/material/InputAdornment';
import { dokumenAPI } from '@/services/api';

interface Dokumen {
  id: number;
  nama: string;
  kategori: string | null;
  deskripsi: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  is_public: boolean;
  uploaded_by?: number;
  uploader: { id: number; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const kategoriOptions = ['Organisasi', 'Keuangan', 'Surat', 'Laporan', 'Lainnya'];

export default function DokumenPage() {
  const [dokumen, setDokumen] = useState<Dokumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showError, showSuccess } = useSnackbar();

  // Filter state
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterPublic, setFilterPublic] = useState('');

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
    deskripsi: '',
    is_public: false,
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [existingFile, setExistingFile] = useState<{ path: string; type: string; size: number } | null>(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<number | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  useEffect(() => {
    fetchDokumen();
  }, [page, rowsPerPage, search, filterKategori, filterPublic]);

  const fetchDokumen = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: page + 1,
        per_page: rowsPerPage,
      };
      if (search) params.search = search;
      if (filterKategori) params.kategori = filterKategori;
      if (filterPublic !== '') params.is_public = filterPublic;

      const response = await dokumenAPI.getAll(params);
      setDokumen(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (err) {
      showError('Gagal memuat data dokumen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDokumen();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleFilterKategoriChange = (value: string) => {
    setFilterKategori(value);
    setPage(0);
  };

  const handleFilterPublicChange = (value: string) => {
    setFilterPublic(value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (data?: Dokumen) => {
    if (data) {
      setEditingId(data.id);
      setFormData({
        nama: data.nama,
        kategori: data.kategori || '',
        deskripsi: data.deskripsi || '',
        is_public: data.is_public,
      });
      setExistingFile({
        path: data.file_path,
        type: data.file_type || '',
        size: data.file_size || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        kategori: '',
        deskripsi: '',
        is_public: false,
      });
      setExistingFile(null);
    }
    setDocFile(null);
    setDocPreview(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!editingId && !docFile) {
      showError('File dokumen wajib diupload');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('nama', formData.nama);
      submitFormData.append('kategori', formData.kategori);
      submitFormData.append('deskripsi', formData.deskripsi);
      submitFormData.append('is_public', formData.is_public ? '1' : '0');

      if (docFile) {
        submitFormData.append('file', docFile);
      }

      if (editingId) {
        submitFormData.append('_method', 'PUT');
        await dokumenAPI.update(editingId, submitFormData);
        showSuccess('Dokumen berhasil diperbarui');
      } else {
        await dokumenAPI.create(submitFormData);
        showSuccess('Dokumen berhasil ditambahkan');
      }
      handleCloseDialog();
      fetchDokumen();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setDocFile(file);
    if (file.type.startsWith('image/')) {
      setDocPreview(URL.createObjectURL(file));
    } else {
      setDocPreview(null);
    }
  };

  const handleTogglePublic = async (id: number) => {
    try {
      await dokumenAPI.togglePublic(id);
      showSuccess('Status dokumen berhasil diubah');
      fetchDokumen();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await dokumenAPI.delete(deletingId);
      showSuccess('Dokumen berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingId(null);
      fetchDokumen();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus data');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <PageContainer title="Dokumen" description="Kelola dokumen RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Data Dokumen
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => handleOpenDialog()}
              >
                Tambah Dokumen
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
                    placeholder="Cari nama dokumen..."
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
                    value={filterKategori}
                    onChange={(e: any) => handleFilterKategoriChange(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Kategori"
                  >
                    <MenuItem value="">Semua Kategori</MenuItem>
                    {kategoriOptions.map((kategori) => (
                      <MenuItem key={kategori} value={kategori}>
                        {kategori}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                  <CustomSelect
                    value={filterPublic}
                    onChange={(e: any) => handleFilterPublicChange(e.target.value)}
                    sx={{ width: '100%' }}
                    placeholder="Semua Status"
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="1">Publik</MenuItem>
                    <MenuItem value="0">Privat</MenuItem>
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
                    <TableCell>Nama</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Ukuran</TableCell>
                    <TableCell>Status</TableCell>
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
                  ) : dokumen.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Belum ada data dokumen
                      </TableCell>
                    </TableRow>
                  ) : (
                    dokumen.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 250 }}>
                            {item.nama}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.kategori || '-'}</TableCell>
                        <TableCell>{formatFileSize(item.file_size || 0)}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.is_public ? 'Publik' : 'Privat'}
                            color={item.is_public ? 'success' : 'default'}
                            size="small"
                            icon={item.is_public ? <IconLockOpen size={14} /> : <IconLock size={14} />}
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
          <DialogTitle>{editingId ? 'Edit Dokumen' : 'Tambah Dokumen'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel htmlFor="nama">Nama Dokumen</CustomFormLabel>
              <CustomTextField
                id="nama"
                placeholder="Masukkan nama dokumen"
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

              <CustomFormLabel>File Dokumen {!editingId && <span style={{ color: 'red' }}>*</span>}</CustomFormLabel>
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
                onClick={() => document.getElementById('doc-input')?.click()}
              >
                <input
                  id="doc-input"
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                {docFile ? (
                  <Box>
                    {docPreview ? (
                      <img
                        src={docPreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconFile size={48} color="gray" />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {docFile.name}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti file
                    </Typography>
                  </Box>
                ) : existingFile ? (
                  <Box>
                    {existingFile.type?.startsWith('image/') ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${existingFile.path}`}
                        alt="Current file"
                        style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconFile size={48} color="gray" />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {existingFile.path.split('/').pop()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatFileSize(existingFile.size)}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti file
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={32} color="gray" />
                    <Typography variant="body2" color="textSecondary">
                      Klik untuk upload file (gambar atau PDF)
                    </Typography>
                  </Box>
                )}
              </Box>

              <CustomFormLabel htmlFor="deskripsi">Deskripsi</CustomFormLabel>
              <CustomTextField
                id="deskripsi"
                placeholder="Masukkan deskripsi dokumen"
                fullWidth
                multiline
                rows={3}
                value={formData.deskripsi}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, deskripsi: e.target.value })}
              />

              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <CustomSwitch
                    checked={formData.is_public}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                }
                label="Dokumen Publik"
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
          {(() => {
            const item = dokumen.find((d) => d.id === menuItemId);
            return (
              <MenuItem
                onClick={() => {
                  if (menuItemId) handleTogglePublic(menuItemId);
                  handleMenuClose();
                }}
              >
                {item?.is_public ? (
                  <>
                    <IconLock size={18} style={{ marginRight: 8 }} />
                    Jadikan Privat
                  </>
                ) : (
                  <>
                    <IconLockOpen size={18} style={{ marginRight: 8 }} />
                    Jadikan Publik
                  </>
                )}
              </MenuItem>
            );
          })()}
          <MenuItem
            onClick={() => {
              const item = dokumen.find((d) => d.id === menuItemId);
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
            <Typography>Apakah Anda yakin ingin menghapus dokumen ini?</Typography>
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
