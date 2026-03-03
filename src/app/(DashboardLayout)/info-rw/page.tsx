'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import { useSnackbar } from '@/app/context/snackbarContext';
import Divider from '@mui/material/Divider';
import PageContainer from '@/app/components/container/PageContainer';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { rwInfoAPI } from '@/services/api';

interface RWInfo {
  name: string;
  fullName: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  alamat: string;
  telepon: string;
  whatsapp: string;
  email: string;
  googleMapsEmbed: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  about: string;
  visi: string;
  misi: string[];
  sambutanKetuaRW: string;
}

export default function InfoRWPage() {
  const [info, setInfo] = useState<RWInfo>({
    name: '',
    fullName: '',
    desa: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    alamat: '',
    telepon: '',
    whatsapp: '',
    email: '',
    googleMapsEmbed: '',
    socialMedia: { facebook: '', instagram: '', youtube: '' },
    about: '',
    visi: '',
    misi: [],
    sambutanKetuaRW: '',
  });
  const [misiText, setMisiText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useSnackbar();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const response = await rwInfoAPI.getAll();
      const data = response.data.data;
      setInfo(data);
      if (data.misi && Array.isArray(data.misi)) {
        setMisiText(data.misi.join('\n'));
      }
    } catch (err) {
      showError('Gagal memuat data info RW');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...info,
        misi: misiText.split('\n').filter((m) => m.trim() !== ''),
      };
      await rwInfoAPI.bulkUpdate(dataToSave);
      showSuccess('Data berhasil disimpan');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Info RW" description="Kelola informasi RW">
        <Box mt={3}>
          <Skeleton variant="rounded" height={400} />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Info RW" description="Kelola informasi RW">
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Informasi RW
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </Box>

            <Grid container rowSpacing={1} columnSpacing={3}>
              {/* Identitas */}
              <Grid size={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Identitas Organisasi
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="name">Nama RW</CustomFormLabel>
                <CustomTextField
                  id="name"
                  placeholder="Masukkan nama RW"
                  fullWidth
                  value={info.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="fullName">Nama Lengkap</CustomFormLabel>
                <CustomTextField
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  fullWidth
                  value={info.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, fullName: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="desa">Desa</CustomFormLabel>
                <CustomTextField
                  id="desa"
                  placeholder="Masukkan nama desa"
                  fullWidth
                  value={info.desa}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, desa: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="kecamatan">Kecamatan</CustomFormLabel>
                <CustomTextField
                  id="kecamatan"
                  placeholder="Masukkan nama kecamatan"
                  fullWidth
                  value={info.kecamatan}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, kecamatan: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="kabupaten">Kabupaten</CustomFormLabel>
                <CustomTextField
                  id="kabupaten"
                  placeholder="Masukkan nama kabupaten"
                  fullWidth
                  value={info.kabupaten}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, kabupaten: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="provinsi">Provinsi</CustomFormLabel>
                <CustomTextField
                  id="provinsi"
                  placeholder="Masukkan nama provinsi"
                  fullWidth
                  value={info.provinsi}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, provinsi: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="alamat">Alamat Lengkap</CustomFormLabel>
                <CustomTextField
                  id="alamat"
                  placeholder="Masukkan alamat lengkap"
                  fullWidth
                  multiline
                  rows={2}
                  value={info.alamat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, alamat: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Kontak
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="telepon">Telepon</CustomFormLabel>
                <CustomTextField
                  id="telepon"
                  placeholder="Masukkan nomor telepon"
                  fullWidth
                  value={info.telepon}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, telepon: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="whatsapp">WhatsApp</CustomFormLabel>
                <CustomTextField
                  id="whatsapp"
                  placeholder="Masukkan nomor WhatsApp"
                  fullWidth
                  value={info.whatsapp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, whatsapp: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
                <CustomTextField
                  id="email"
                  placeholder="Masukkan alamat email"
                  fullWidth
                  value={info.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, email: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Social Media
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="facebook">Facebook</CustomFormLabel>
                <CustomTextField
                  id="facebook"
                  placeholder="URL Facebook"
                  fullWidth
                  value={info.socialMedia?.facebook || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInfo({
                      ...info,
                      socialMedia: { ...info.socialMedia, facebook: e.target.value },
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="instagram">Instagram</CustomFormLabel>
                <CustomTextField
                  id="instagram"
                  placeholder="URL Instagram"
                  fullWidth
                  value={info.socialMedia?.instagram || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInfo({
                      ...info,
                      socialMedia: { ...info.socialMedia, instagram: e.target.value },
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CustomFormLabel htmlFor="youtube">YouTube</CustomFormLabel>
                <CustomTextField
                  id="youtube"
                  placeholder="URL YouTube"
                  fullWidth
                  value={info.socialMedia?.youtube || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInfo({
                      ...info,
                      socialMedia: { ...info.socialMedia, youtube: e.target.value },
                    })
                  }
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Visi & Misi
                </Typography>
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="about">Tentang RW</CustomFormLabel>
                <CustomTextField
                  id="about"
                  placeholder="Masukkan deskripsi tentang RW"
                  fullWidth
                  multiline
                  rows={3}
                  value={info.about}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, about: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="visi">Visi</CustomFormLabel>
                <CustomTextField
                  id="visi"
                  placeholder="Masukkan visi RW"
                  fullWidth
                  multiline
                  rows={2}
                  value={info.visi}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, visi: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="misi">Misi (satu misi per baris)</CustomFormLabel>
                <CustomTextField
                  id="misi"
                  placeholder="Masukkan misi RW, pisahkan setiap misi dengan baris baru"
                  fullWidth
                  multiline
                  rows={4}
                  value={misiText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMisiText(e.target.value)}
                />
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Sambutan Ketua RW
                </Typography>
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="sambutanKetuaRW">Sambutan Ketua RW</CustomFormLabel>
                <CustomTextField
                  id="sambutanKetuaRW"
                  placeholder="Masukkan sambutan ketua RW"
                  fullWidth
                  multiline
                  rows={5}
                  value={info.sambutanKetuaRW}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, sambutanKetuaRW: e.target.value })}
                />
              </Grid>

              <Grid size={12}>
                <CustomFormLabel htmlFor="googleMapsEmbed">Google Maps Embed URL</CustomFormLabel>
                <CustomTextField
                  id="googleMapsEmbed"
                  placeholder="URL embed dari Google Maps"
                  fullWidth
                  value={info.googleMapsEmbed}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfo({ ...info, googleMapsEmbed: e.target.value })}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
