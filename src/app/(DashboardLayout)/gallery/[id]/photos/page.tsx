'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import PageContainer from '@/app/components/container/PageContainer';
import { useSnackbar } from '@/app/context/snackbarContext';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { IconArrowLeft, IconUpload, IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import { galleryAPI } from '@/services/api';
import dayjs from 'dayjs';

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

export default function GalleryPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = parseInt(id);
  const router = useRouter();

  const { showError, showSuccess } = useSnackbar();
  const [event, setEvent] = useState<GalleryEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  // Edit caption state
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Delete state
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // View photo state
  const [viewingPhoto, setViewingPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await galleryAPI.getById(eventId);
      setEvent(response.data.data);
    } catch (err) {
      showError('Gagal memuat data event');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload handlers
  const handleOpenUploadDialog = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoCaption('');
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoCaption('');
  };

  const handleSelectPhoto = (file: File | null) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto', photoFile);
      formData.append('caption', photoCaption);
      formData.append('sequence', String(event?.photos?.length || 0));

      await galleryAPI.addPhoto(eventId, formData);
      showSuccess('Foto berhasil diupload');
      handleCloseUploadDialog();
      fetchEvent();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal mengupload foto');
    } finally {
      setIsUploading(false);
    }
  };

  // Edit caption handlers
  const handleOpenEditDialog = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditCaption(photo.caption || '');
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingPhoto(null);
    setEditCaption('');
  };

  const handleSaveCaption = async () => {
    if (!editingPhoto) return;

    setIsSavingCaption(true);
    try {
      await galleryAPI.updatePhoto(editingPhoto.id, { caption: editCaption });
      showSuccess('Caption berhasil diperbarui');
      handleCloseEditDialog();
      fetchEvent();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan caption');
    } finally {
      setIsSavingCaption(false);
    }
  };

  // Delete handlers
  const handleDeletePhoto = async () => {
    if (!deletingPhotoId) return;

    setIsDeleting(true);
    try {
      await galleryAPI.deletePhoto(deletingPhotoId);
      showSuccess('Foto berhasil dihapus');
      setOpenDeleteDialog(false);
      setDeletingPhotoId(null);
      fetchEvent();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menghapus foto');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Loading..." description="">
        <Box mt={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rounded" height={400} sx={{ mt: 2 }} />
        </Box>
      </PageContainer>
    );
  }

  if (!event) {
    return (
      <PageContainer title="Event tidak ditemukan" description="">
        <Box mt={3}>
          <Alert severity="error">Event tidak ditemukan</Alert>
          <Button
            startIcon={<IconArrowLeft size={18} />}
            onClick={() => router.push('/gallery')}
            sx={{ mt: 2 }}
          >
            Kembali ke Gallery
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Foto - ${event.nama_event}`} description="Kelola foto event">
      <Box mt={3}>

        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => router.push('/gallery')}
          >
            Gallery
          </Link>
          <Typography color="text.primary">{event.nama_event}</Typography>
        </Breadcrumbs>

        <Card>
          <CardContent>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {event.nama_event}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={0.5}>
                  {event.tanggal_event ? dayjs(event.tanggal_event).format('DD MMM YYYY') : '-'} • {event.lokasi || '-'}
                </Typography>
                {event.deskripsi && (
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    {event.deskripsi}
                  </Typography>
                )}
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<IconArrowLeft size={18} />}
                  onClick={() => router.push('/gallery')}
                >
                  Kembali
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconUpload size={18} />}
                  onClick={handleOpenUploadDialog}
                >
                  Upload Foto
                </Button>
              </Box>
            </Box>

            {/* Photos Grid */}
            {event.photos && event.photos.length > 0 ? (
              <Grid container spacing={2}>
                {event.photos.map((photo) => (
                  <Grid key={photo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover .photo-overlay': { opacity: 1 },
                        }}
                        onClick={() => setViewingPhoto(photo)}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${photo.foto}`}
                          alt={photo.caption || 'Photo'}
                          style={{ width: '100%', height: 180, objectFit: 'cover' }}
                        />
                        <Box
                          className="photo-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.3)',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography color="white" fontWeight={500}>
                            Klik untuk lihat
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography
                            variant="body2"
                            color={photo.caption ? 'textPrimary' : 'textSecondary'}
                            sx={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {photo.caption || '(Tidak ada caption)'}
                          </Typography>
                          <Box display="flex" ml={1}>
                            <IconButton size="small" onClick={() => handleOpenEditDialog(photo)}>
                              <IconEdit size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDeletingPhotoId(photo.id);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <IconTrash size={16} />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={8}>
                <IconPhoto size={64} color="gray" />
                <Typography color="textSecondary" mt={2}>
                  Belum ada foto untuk event ini
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<IconUpload size={18} />}
                  onClick={handleOpenUploadDialog}
                  sx={{ mt: 2 }}
                >
                  Upload Foto Pertama
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Foto</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <CustomFormLabel>Pilih Foto</CustomFormLabel>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: photoPreview ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => document.getElementById('photo-upload-input')?.click()}
              >
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleSelectPhoto(e.target.files?.[0] || null)}
                />
                {photoPreview ? (
                  <Box>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Klik untuk mengganti foto
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <IconUpload size={40} color="gray" />
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Klik untuk pilih foto
                    </Typography>
                  </Box>
                )}
              </Box>

              <CustomFormLabel htmlFor="photo-caption">Caption</CustomFormLabel>
              <CustomTextField
                id="photo-caption"
                placeholder="Masukkan caption foto (opsional)"
                fullWidth
                multiline
                rows={2}
                value={photoCaption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhotoCaption(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog} disabled={isUploading}>
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadPhoto}
              disabled={!photoFile || isUploading}
            >
              {isUploading ? 'Mengupload...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Caption Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Caption</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {editingPhoto && (
                <Box mb={2}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${editingPhoto.foto}`}
                    alt="Photo"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                  />
                </Box>
              )}
              <CustomFormLabel htmlFor="edit-caption">Caption</CustomFormLabel>
              <CustomTextField
                id="edit-caption"
                placeholder="Masukkan caption foto"
                fullWidth
                multiline
                rows={3}
                value={editCaption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCaption(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} disabled={isSavingCaption}>
              Batal
            </Button>
            <Button variant="contained" onClick={handleSaveCaption} disabled={isSavingCaption}>
              {isSavingCaption ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => !isDeleting && setOpenDeleteDialog(false)}>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogContent>
            <Typography>Apakah Anda yakin ingin menghapus foto ini?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button variant="contained" color="error" onClick={handleDeletePhoto} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Photo Dialog */}
        <Dialog
          open={!!viewingPhoto}
          onClose={() => setViewingPhoto(null)}
          maxWidth="lg"
          fullWidth
        >
          {viewingPhoto && (
            <>
              <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
                <img
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${viewingPhoto.foto}`}
                  alt={viewingPhoto.caption || 'Photo'}
                  style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
              </DialogContent>
              {viewingPhoto.caption && (
                <DialogActions sx={{ bgcolor: 'background.paper', justifyContent: 'center' }}>
                  <Typography variant="body1">{viewingPhoto.caption}</Typography>
                </DialogActions>
              )}
            </>
          )}
        </Dialog>
      </Box>
    </PageContainer>
  );
}
