import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

import {
  IconDashboard,
  IconUsers,
  IconInfoCircle,
  IconPackage,
  IconPhoto,
  IconNews,
  IconFileText,
  IconSettings,
  IconHome,
  IconReceipt,
  IconCash,
  IconWallet,
  IconChartBar,
  IconSpeakerphone,
  IconHeart,
  IconMessageCircle,
  IconBulb,
} from "@tabler/icons-react";

// Menu untuk RW (menu yang sudah ada)
export const RwMenuItems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Menu Utama",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconDashboard,
    href: "/",
  },

  {
    navlabel: true,
    subheader: "Manajemen Data",
  },
  {
    id: uniqueId(),
    title: "Pengurus",
    icon: IconUsers,
    href: "/pengurus",
  },
  {
    id: uniqueId(),
    title: "Info RW",
    icon: IconInfoCircle,
    href: "/info-rw",
  },
  {
    id: uniqueId(),
    title: "Inventaris",
    icon: IconPackage,
    href: "/assets",
  },

  {
    navlabel: true,
    subheader: "Konten",
  },
  {
    id: uniqueId(),
    title: "Gallery",
    icon: IconPhoto,
    href: "/gallery",
  },
  {
    id: uniqueId(),
    title: "Berita",
    icon: IconNews,
    href: "/berita",
  },
  {
    id: uniqueId(),
    title: "Dokumen",
    icon: IconFileText,
    href: "/dokumen",
  },

  {
    navlabel: true,
    subheader: "Pengaturan",
  },
  {
    id: uniqueId(),
    title: "Pengaturan",
    icon: IconSettings,
    href: "/settings",
  },
];

// Menu untuk RT
export const RtMenuItems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Menu Utama",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconDashboard,
    href: "/rt/dashboard",
  },

  {
    navlabel: true,
    subheader: "Data Warga",
  },
  {
    id: uniqueId(),
    title: "Rumah",
    icon: IconHome,
    href: "/rt/houses",
  },

  {
    navlabel: true,
    subheader: "Keuangan",
  },
  {
    id: uniqueId(),
    title: "Tagihan",
    icon: IconReceipt,
    href: "/rt/bills",
    children: [
      {
        id: uniqueId(),
        title: "IPL",
        href: "/rt/bills/ipl",
      },
      {
        id: uniqueId(),
        title: "Kas",
        href: "/rt/bills/cash",
      },
      {
        id: uniqueId(),
        title: "PKK",
        href: "/rt/bills/pkk",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Transaksi",
    icon: IconCash,
    href: "/rt/transactions",
  },
  {
    id: uniqueId(),
    title: "Saldo",
    icon: IconWallet,
    href: "/rt/balance",
  },

  {
    navlabel: true,
    subheader: "Partisipasi",
  },
  {
    id: uniqueId(),
    title: "Voting",
    icon: IconChartBar,
    href: "/rt/votes",
  },
  {
    id: uniqueId(),
    title: "Iuran/Donasi",
    icon: IconHeart,
    href: "/rt/contributions",
  },

  {
    navlabel: true,
    subheader: "Komunikasi",
  },
  {
    id: uniqueId(),
    title: "Pengumuman",
    icon: IconSpeakerphone,
    href: "/rt/information",
  },
  {
    id: uniqueId(),
    title: "Keluhan",
    icon: IconMessageCircle,
    href: "/rt/complaints",
  },
  {
    id: uniqueId(),
    title: "Saran",
    icon: IconBulb,
    href: "/rt/suggestions",
  },
];

// Default export untuk kompatibilitas
const Menuitems = RwMenuItems;
export default Menuitems;
