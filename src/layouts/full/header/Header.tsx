import { useState } from 'react';
import { Navbar } from 'flowbite-react';
import { Icon } from '@iconify/react';
import Profile from './Profile';
import { Drawer } from 'flowbite-react';
import MobileSidebar from '../sidebar/MobileSidebar';
import { useUser } from 'src/hooks/UserContext';

import './header.css';

const Header = () => {
  const { setTheme } = useUser();
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem('flowbite-theme-mode') === 'light' ? false : true,
  );

  const toggleTheme = () => {
    const currentTheme = localStorage.getItem('flowbite-theme-mode');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('flowbite-theme-mode', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    setDarkTheme((prev) => !prev);
    setTheme(newTheme);
  };

  // mobile-sidebar
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <>
      <header
        className={`sticky top-0 z-[5] ${
          !darkTheme ? 'bg-white' : 'header_custom-dark-theme'
        } fixed w-full`}
      >
        <Navbar
          fluid
          className={`rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4`}
        >
          {/* Mobile Toggle Icon */}

          <div className="flex gap-3 items-center justify-between w-full ">
            <div className="flex gap-2 items-center">
              <span
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
              </span>
              <button
                onClick={toggleTheme}
                title="Switch Dark Mode"
                className={darkTheme ? 'icon-switch-dark-theme' : ''}
              >
                {darkTheme ? (
                  <Icon icon="solar:lightbulb-bolt-bold" height="28" className="text-gray" />
                ) : (
                  <Icon icon="solar:lightbulb-bolt-broken" height="27" className="text-gray" />
                )}
              </button>
            </div>

            <Profile />
          </div>
        </Navbar>
      </header>

      {/* Mobile Sidebar */}
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default Header;
