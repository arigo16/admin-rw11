import React from "react";
import MyApp from "./app";
import NextTopLoader from 'nextjs-toploader';
import "./global.css";
import { CustomizerContextProvider } from "./context/customizerContext";
import { OrgProvider } from "./context/orgContext";


export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Admin Portal RW11",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Sistem Administrasi RW11",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#5D87FF" />
        <CustomizerContextProvider>
          <OrgProvider>
            <MyApp>{children}</MyApp>
          </OrgProvider>
        </CustomizerContextProvider>
      </body>
    </html>
  );
}
