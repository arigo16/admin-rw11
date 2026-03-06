'use client'
import { CustomizerContext } from "@/app/context/customizerContext";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import config from '@/app/context/config'
import Image from "next/image";
import { useContext } from "react";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);

  const TopbarHeight = config.topbarHeight;
  const isMini = isCollapse === "mini-sidebar" && !isSidebarHover;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isMini ? '40px' : '180px',
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  }));

  if (activeDir === "ltr") {
    return (
      <LinkStyled href="/">
        {activeMode === "dark" ? (
          <Image
            src="/images/logos/light-logo.png"
            alt="logo"
            height={50}
            width={180}
            priority
            style={{
              objectFit: 'contain',
              width: 'auto',
              height: '50px',
            }}
          />
        ) : (
          <Image
            src={"/images/logos/dark-logo.png"}
            alt="logo"
            height={50}
            width={180}
            priority
            style={{
              objectFit: 'contain',
              width: 'auto',
              height: '50px',
            }}
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {activeMode === "dark" ? (
        <Image
          src="/images/logos/dark-rtl-logo.png"
          alt="logo"
          height={50}
          width={180}
          priority
          style={{
            objectFit: 'contain',
            width: 'auto',
            height: '50px',
          }}
        />
      ) : (
        <Image
          src="/images/logos/light-logo-rtl.png"
          alt="logo"
          height={50}
          width={180}
          priority
          style={{
            objectFit: 'contain',
            width: 'auto',
            height: '50px',
          }}
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
