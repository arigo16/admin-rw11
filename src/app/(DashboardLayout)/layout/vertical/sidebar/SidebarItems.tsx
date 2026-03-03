'use client';
import { RwMenuItems, RtMenuItems } from './MenuItems';
import { usePathname, useRouter } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { useContext } from 'react';
import { useOrg } from '@/app/context/orgContext';
import { CustomizerContext } from '@/app/context/customizerContext';
import { IconBuilding, IconHome2 } from '@tabler/icons-react';

// Generate RT options (1-15)
const rtOptions = Array.from({ length: 15 }, (_, i) => i + 1);

const SidebarItems = () => {
  const pathname = usePathname();
  const router = useRouter();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const { orgType, rtId, setOrg } = useOrg();

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  // Select menu based on org type
  const menuItems = orgType === 'rw' ? RwMenuItems : RtMenuItems;

  // Handle org change
  const handleOrgChange = (value: string) => {
    if (value === 'rw') {
      setOrg('rw');
      router.push('/');
    } else {
      const rtNumber = parseInt(value.replace('rt-', ''));
      setOrg('rt', rtNumber);
      router.push('/rt/dashboard');
    }
  };

  const currentValue = orgType === 'rw' ? 'rw' : `rt-${rtId}`;

  return (
    <Box sx={{ px: 3 }}>
      {/* Organization Selector */}
      {!hideMenu && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
            Kelola
          </Typography>
          <Select
            value={currentValue}
            onChange={(e) => handleOrgChange(e.target.value)}
            fullWidth
            size="small"
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1,
              },
            }}
          >
            <MenuItem value="rw">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconBuilding size={18} />
                <span>RW 11</span>
              </Box>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            {rtOptions.map((rt) => (
              <MenuItem key={rt} value={`rt-${rt}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconHome2 size={18} />
                  <span>RT {rt}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <List sx={{ pt: 0 }} className="sidebarNav">
        {menuItems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => setIsMobileSidebar(!isMobileSidebar)}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu} onClick={() => setIsMobileSidebar(!isMobileSidebar)} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
