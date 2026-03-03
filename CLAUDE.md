# Admin Portal RW11 - Project Guide

## Project Overview
Admin Portal RW11 - Sistem Administrasi Warga menggunakan Next.js 16 dengan Material UI v7.

## Claude Configuration (.claude/)

### Custom Agents
- **nextjs-ui-ux-engineer** - Agent untuk UI/UX development, komponen responsif, design patterns, accessibility
- **nextjs-data-processor** - Agent untuk data processing, API integration, data transformation, visualization

### Custom Commands (Slash Commands)
- **/commitmessages** - Buat git commit dengan pesan sesuai konteks perubahan
- **/pullandpush** - Pull, commit, dan push dengan satu perintah (stop jika ada conflict)

### Permissions
Git dan npm commands sudah di-allow otomatis:
- `git pull`, `git add`, `git commit`, `git push`
- `npm` commands

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: MUI (Material UI) v7
- **React**: 19.2.0
- **Language**: TypeScript
- **Icons**: Tabler Icons (@tabler/icons-react)
- **Charts**: ApexCharts
- **i18n**: i18next
- **HTTP Client**: Axios

## Project Structure
```
src/
├── app/
│   ├── (DashboardLayout)/          # Route group untuk dashboard
│   │   ├── layout.tsx              # Dashboard layout utama
│   │   ├── page.tsx                # Dashboard dengan statistik
│   │   ├── pengurus/               # Manajemen pengurus
│   │   ├── info-rw/                # Informasi RW
│   │   ├── assets/                 # Inventaris/aset
│   │   ├── gallery/                # Gallery kegiatan
│   │   ├── berita/                 # Berita/artikel
│   │   ├── dokumen/                # Dokumen
│   │   ├── settings/               # Pengaturan
│   │   └── layout/                 # Layout components
│   ├── auth/                       # Halaman autentikasi
│   │   ├── login/                  # /auth/login
│   │   └── authForms/              # Form components
│   ├── components/                 # Reusable components
│   └── context/                    # React Context
├── services/
│   └── api.ts                      # API service dengan axios
└── utils/
    └── theme/                      # Theme configuration
```

## API Configuration
Backend API URL dikonfigurasi di `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### API Services (`src/services/api.ts`)
- `authAPI` - Login, logout, get user
- `pengurusAPI` - CRUD pengurus
- `rwInfoAPI` - Info RW (get/update)
- `assetsAPI` - CRUD inventaris
- `galleryAPI` - CRUD gallery & photos
- `beritaAPI` - CRUD berita + publish/unpublish
- `dokumenAPI` - CRUD dokumen + toggle public

## Menu Structure
1. **Dashboard** - Overview statistik
2. **Pengurus** - CRUD data pengurus RW
3. **Info RW** - Edit informasi organisasi, visi misi, sambutan
4. **Inventaris** - CRUD inventaris/aset RW
5. **Gallery** - CRUD event dan foto-foto kegiatan
6. **Berita** - CRUD berita/artikel dengan publish/unpublish
7. **Dokumen** - CRUD dokumen dengan toggle public/private
8. **Pengaturan** - Pengaturan akun

## Commands
```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Adding New Pages
1. Buat folder baru di `src/app/(DashboardLayout)/`
2. Tambahkan `page.tsx` di dalam folder tersebut
3. Tambahkan menu item di `MenuItems.ts`

## Adding Menu Items
Edit `src/app/(DashboardLayout)/layout/vertical/sidebar/MenuItems.ts`:
```typescript
{
  id: uniqueId(),
  title: "Menu Title",
  icon: IconName,      // dari @tabler/icons-react
  href: "/path",
  chip: "New",         // optional
  chipColor: "primary" // optional
}
```

## Conventions
- Gunakan `"use client"` untuk komponen yang membutuhkan client-side features
- Ikuti struktur folder yang sudah ada
- Gunakan komponen MUI untuk konsistensi UI
- Import icons dari `@tabler/icons-react`
