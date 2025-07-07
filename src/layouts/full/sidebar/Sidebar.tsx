import { Sidebar } from 'flowbite-react';
import React from 'react';
import SimpleBar from 'simplebar-react';
import FullLogo from '../shared/logo/FullLogo';
import NavItems from './NavItems';
import { useUser } from 'src/hooks/UserContext';

import { uniqueId } from 'lodash';

const SidebarLayout = () => {
  const { theme, hasPermission } = useUser();

  const SidebarContent = [
    {
      heading: 'OVERVIEW',
      children: [
        {
          name: 'Dashboard',
          icon: 'solar:widget-add-line-duotone',
          id: uniqueId(),
          url: '/ui/dashboard',
          hasPermission:
            hasPermission('get_all_user') &&
            hasPermission('get_all_roles') &&
            hasPermission('get_all_VDI'),
        },
      ],
    },
    {
      heading: 'ADMIN',
      children: [
        {
          name: 'Groups',
          icon: 'solar:users-group-rounded-line-duotone',
          id: uniqueId(),
          url: '/ui/groups',
          hasPermission: hasPermission('get_all_roles'),
        },
        {
          name: 'Users',
          icon: 'solar:user-id-outline',
          id: uniqueId(),
          url: '/ui/users',
          hasPermission: hasPermission('get_all_user'),
        },
        {
          name: 'Desktops',
          icon: 'solar:laptop-minimalistic-line-duotone',
          id: uniqueId(),
          url: '/ui/desktops',
          hasPermission: hasPermission('get_all_VDI'),
        },
      ],
    },
    {
      heading: 'MANAGEMENT',
      children: [
        {
          name: 'My Desktops',
          icon: 'solar:laptop-minimalistic-line-duotone',
          id: uniqueId(),
          url: '/ui/myDesktops',
          hasPermission: true,
        },
      ],
    },

    {
      heading: 'EXTRA',
      children: [
        {
          name: 'Icons',
          icon: 'solar:smile-circle-outline',
          id: uniqueId(),
          url: '/icons/solar',
          hasPermission:
            hasPermission('get_all_user') &&
            hasPermission('get_all_roles') &&
            hasPermission('get_all_VDI'),
        },
      ],
    },
  ];

  return (
    <>
      <div className="xl:block hidden">
        <Sidebar
          className="fixed menu-sidebar  bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0 "
          aria-label="Sidebar with multi-level dropdown example"
        >
          <div className="px-5 py-4 flex items-center sidebarlogo justify-between">
            <FullLogo />
          </div>
          <SimpleBar className="h-[calc(100vh_-_140px)]">
            <Sidebar.Items className="px-5 mt-2">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                {SidebarContent &&
                  SidebarContent?.filter((item) => item.children.some((e) => e.hasPermission))?.map(
                    (item, index) => (
                      <div
                        className="caption"
                        key={item.heading}
                        style={theme === 'dark' ? { borderColor: 'var(--color-darkborder)' } : {}}
                      >
                        <React.Fragment key={index}>
                          <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 uppercase">
                            {item.heading}
                          </h5>
                          {item.children
                            ?.filter((e) => e.hasPermission)
                            ?.map((child, index) => (
                              <React.Fragment key={child.id && index}>
                                <NavItems item={child} />
                              </React.Fragment>
                            ))}
                        </React.Fragment>
                      </div>
                    ),
                  )}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;
