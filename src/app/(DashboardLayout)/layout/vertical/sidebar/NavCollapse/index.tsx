import React, { useContext } from 'react';

import { useState } from 'react';

import { usePathname } from "next/navigation";

// mui imports
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';

// custom imports
import NavItem from '../NavItem';

// plugins
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CustomizerContext } from "@/app/context/customizerContext";

import { isNull } from "lodash";

type NavGroupProps = {
  [x: string]: any;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
};

interface NavCollapseProps {
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

// FC Component For Dropdown Menu
export default function NavCollapse({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick
}: NavCollapseProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const { isBorderRadius } = useContext(CustomizerContext);

  const Icon = menu?.icon;
  const theme = useTheme();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const menuIcon = Icon
    ? (level > 1 ? <Icon stroke={1.5} size="1rem" /> : <Icon stroke={1.5} size="1.3rem" />)
    : null;

  const handleClick = () => {
    setOpen(!open);
  };

  // menu collapse for sub-levels
  React.useEffect(() => {
    setOpen(false);
    menu?.children?.forEach((item: any) => {
      if (item?.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  // Styled component sama persis seperti NavItem
  const ListItemStyled = styled(ListItemButton)(() => ({
    whiteSpace: 'nowrap',
    marginBottom: '2px',
    padding: '8px 10px',
    borderRadius: `${isBorderRadius}px`,
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  }));

  // If Menu has Children
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item?.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={lgDown ? onClick : isNull}
        />
      );
    }
  });

  // Set selected=true when open (untuk trigger &.Mui-selected styles)
  const isSelected = open && level < 2;

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={isSelected}
        key={menu?.id}
      >
        {menuIcon && (
          <ListItemIcon
            sx={{
              minWidth: '36px',
              p: '3px 0',
              color: 'inherit',
            }}
          >
            {menuIcon}
          </ListItemIcon>
        )}
        <ListItemText>
          {hideMenu ? '' : <>{t(`${menu.title}`)}</>}
        </ListItemText>
        <Box sx={{ color: 'inherit', display: 'flex' }}>
          {!open ? (
            <IconChevronDown size="1rem" />
          ) : (
            <IconChevronUp size="1rem" />
          )}
        </Box>
      </ListItemStyled>
      <Collapse in={open} timeout="auto">
        {submenus}
      </Collapse>
    </>
  );
};
