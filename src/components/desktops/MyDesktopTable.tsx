import { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge, Button, Dropdown } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Table } from 'flowbite-react';
import Search from '../Search/Search';
import { Link } from 'react-router';
import Confirm from '../confirm/Confirm';
import { Desktop } from 'src/types/user/User';
import { useUser } from 'src/hooks/UserContext';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import toast from 'react-hot-toast';

import './DesktopTable.css';
import { useLocation, useNavigate } from 'react-router';

const MyDesktopTable = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { hasPermission, token, theme, userDetails } = useUser();

  // State consolidation
  const [desktops, setDesktops] = useState<Desktop[]>([]);
  const [searchKey, setSearchKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<{
    isVisible: boolean;
    desktopName: string | null;
  }>({ isVisible: false, desktopName: null });
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    desktop: Desktop | null;
  }>({ visible: false, desktop: null });

  // Memoized filtered desktops
  const filteredDesktops = useMemo(() => {
    if (!searchKey.trim()) return desktops;
    return desktops.filter((item) =>
      item.name?.toLowerCase().includes(searchKey.toLowerCase().trim()),
    );
  }, [desktops, searchKey]);

  // Memoized permission checks
  const permissions = useMemo(
    () => ({
      canGetDesktops: hasPermission('get_all_VDI_by_user'),
      canCreateDesktop: hasPermission('create_VDI'),
      canDeleteDesktop: hasPermission('delete_VDI'),
      canViewDetails:
        // hasPermission('get_all_user') &&
        // hasPermission('get_all_VDI') &&
        hasPermission('get_VDI_info'),
    }),
    [hasPermission],
  );

  // Handle toast notifications from navigation state
  useEffect(() => {
    const { state } = location;
    if (!state) return;

    const messages = {
      addDesktopSuccess: 'Add desktop successful!',
      updateDesktopSuccess: 'Update desktop successful!',
      loginSuccess: 'Login successful!',
    };

    Object.entries(messages).forEach(([key, message]) => {
      if (state[key]) {
        toast.success(message);
      }
    });

    if (Object.keys(messages).some((key) => state[key])) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Fetch desktops
  useEffect(() => {
    const fetchDesktops = async () => {
      if (!permissions.canGetDesktops || !userDetails?.id) return;

      try {
        setLoading(true);
        const res = await axiosClient.get(`/virtualDesktops/user/${userDetails.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDesktops(res.data.result || []);
      } catch (error) {
        console.error('Error fetching desktops:', error);
        toast.error('Failed to load desktops');
      } finally {
        setLoading(false);
      }
    };

    fetchDesktops();
  }, [permissions.canGetDesktops, userDetails?.id, token]);

  // Callbacks
  const handleSearch = useCallback((key: string) => {
    setSearchKey(key);
  }, []);

  const handlePasswordToggle = useCallback((desktop: Desktop) => {
    setPasswordVisibility((prev) => ({
      isVisible: prev.desktopName === desktop.name ? !prev.isVisible : true,
      desktopName: desktop.name,
    }));
  }, []);

  const handleShowConfirm = useCallback((desktop: Desktop) => {
    setConfirmDialog({ visible: true, desktop });
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setConfirmDialog({ visible: false, desktop: null });
  }, []);

  // Download functions (keeping original logic)
  const downloadWithLocationPicker = async (
    data: Blob,
    fileName: string,
  ): Promise<boolean | null> => {
    try {
      if (!('showSaveFilePicker' in window)) {
        console.warn('File System Access API not supported');
        return false;
      }

      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'VNC files',
            accept: { 'application/x-vnc': ['.vnc'] },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(data);
      await writableStream.close();

      console.log('File saved successfully with location picker:', fileName);
      return true;
    } catch (error: any) {
      const errorName = error?.name || '';

      if (errorName === 'AbortError') {
        console.log('User cancelled file save dialog');
        return null;
      }

      console.error('Error with file picker:', error);
      return false;
    }
  };

  const downloadWithFallback = (data: Blob, fileName: string): void => {
    try {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      document.body.appendChild(link);

      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log('File downloaded via fallback method:', fileName);
    } catch (error) {
      console.error('Error with fallback download:', error);
      throw error;
    }
  };

  const handleDownVNC = async (): Promise<void> => {
    const desktop = confirmDialog.desktop;
    if (!desktop) return;

    try {
      const res = await axiosClient.post(
        '/vnc/vncfile',
        {
          name: desktop.name,
          ip: desktop.ip,
          port: desktop.port,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        },
      );

      const fileName = `${desktop.name || 'desktop'}.vnc`;
      const blob = new Blob([res.data]);

      const pickerResult = await downloadWithLocationPicker(blob, fileName);

      if (pickerResult === true) {
        toast.success('File saved successfully');
      } else if (pickerResult === false) {
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else if (pickerResult === null) {
        console.log('Download cancelled by user');
        return;
      }

      console.log('Download VNC file completed for:', desktop.name);
    } catch (error) {
      console.error('Error downloading VNC file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  const handleDownRDP = async (): Promise<void> => {
    const desktop = confirmDialog.desktop;
    if (!desktop) return;

    try {
      const res = await axiosClient.get('/generateRdp/downloadRdp', {
        params: {
          ipAddress: desktop.ip,
          username: userDetails?.username,
        },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const fileName = `${desktop.name || 'desktop'}.rdp`;
      const blob = new Blob([res.data]);

      const pickerResult = await downloadWithLocationPicker(blob, fileName);

      if (pickerResult === true) {
        toast.success('File saved successfully');
      } else if (pickerResult === false) {
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else if (pickerResult === null) {
        console.log('Download cancelled by user');
        return;
      }

      console.log('Download RDP file completed for:', desktop.name);
    } catch (error) {
      console.error('Error downloading RDP file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  const handleDeleteDesktop = async () => {
    if (!permissions.canDeleteDesktop || !confirmDialog.desktop) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/virtualDesktops/${confirmDialog.desktop.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDesktops((prev) => prev.filter((desktop) => desktop.id !== confirmDialog.desktop?.id));
      setConfirmDialog({ visible: false, desktop: null });

      console.log('delete desktop ' + confirmDialog.desktop.name);
      toast.success(`Delete desktop ${confirmDialog.desktop.name} successful!`);
    } catch (error) {
      console.error('Error deleting desktop:', error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Render password cell
  const renderPasswordCell = useCallback(
    (desktop: Desktop) => {
      const isVisible =
        passwordVisibility.isVisible && passwordVisibility.desktopName === desktop.name;

      return (
        <div className="flex items-center">
          <h6 className="text-wrap mr-1">
            {isVisible ? desktop.password || '--' : '•'.repeat(8) || 'no data...'}
          </h6>
          <Icon
            icon="solar:eye-broken"
            height="18"
            className={
              isVisible
                ? theme === 'dark'
                  ? 'text-light-dark-theme-custom'
                  : 'text-dark'
                : 'text-gray'
            }
            style={{ cursor: 'pointer' }}
            onClick={() => handlePasswordToggle(desktop)}
          />
        </div>
      );
    },
    [passwordVisibility, theme, handlePasswordToggle],
  );

  // Render table row
  const renderTableRow = useCallback(
    (desktop: Desktop, index: number) => (
      <Table.Row key={`${desktop.id}-${index}`}>
        <Table.Cell className="whitespace-nowrap">
          <h6
            className={`text-sm desktop-name-link ${theme === 'dark' ? 'dark-theme' : ''}`}
            style={permissions.canViewDetails ? {} : { cursor: 'initial' }}
          >
            {permissions.canViewDetails ? (
              <Link to={`/ui/myDesktops/${desktop.name}`}>{desktop.name}</Link>
            ) : (
              desktop.name
            )}
          </h6>
        </Table.Cell>
        <Table.Cell>
          <div className="flex gap-3 items-center">
            <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
              <h6 className="text-wrap">{desktop.ip || '--'}</h6>
            </div>
          </div>
        </Table.Cell>
        <Table.Cell>
          <h6 className="text-wrap">{desktop.port}</h6>
        </Table.Cell>
        <Table.Cell>{renderPasswordCell(desktop)}</Table.Cell>
        <Table.Cell>
          <Badge
            color={desktop.hasGPU === 'YES' ? 'lightsuccess' : 'lighterror'}
            className={desktop.hasGPU === 'YES' ? 'text-success' : 'lighterror'}
          >
            <span style={{ fontSize: '0.9rem' }}>{desktop.hasGPU ? '+' : '--'}</span>
          </Badge>
        </Table.Cell>
        <Table.Cell>
          <h6 className="text-wrap">{desktop.gpu}</h6>
        </Table.Cell>
        <Table.Cell>
          <h6 className="text-wrap">{desktop.ssd}</h6>
        </Table.Cell>
        <Table.Cell>
          <h6 className="text-wrap">{desktop.ram}</h6>
        </Table.Cell>
        <Table.Cell>
          <h6 className="text-wrap">{desktop.cpu}</h6>
        </Table.Cell>
        <Table.Cell>
          <Badge color="lightsuccess" className="text-success">
            <span style={{ fontSize: '0.9rem' }}>+</span>
          </Badge>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap">
          <button className="noVNC-btn">
            <Icon icon="solar:laptop-minimalistic-broken" height={20} />
          </button>
        </Table.Cell>
        <Table.Cell>
          <Dropdown
            placement="bottom-end"
            label=""
            dismissOnClick={false}
            renderTrigger={() => (
              <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                <HiOutlineDotsVertical
                  size={36}
                  style={{ padding: '7px' }}
                  onClick={() => setConfirmDialog({ visible: false, desktop })}
                />
              </span>
            )}
          >
            <Dropdown.Item onClick={handleDownVNC} className="flex gap-3">
              <Icon icon="solar:download-minimalistic-broken" height={18} />
              <span>Download VNC</span>
            </Dropdown.Item>
            <Dropdown.Item onClick={handleDownRDP} className="flex gap-3">
              <Icon icon="solar:download-minimalistic-broken" height={18} />
              <span>Download RDP</span>
            </Dropdown.Item>
            {permissions.canDeleteDesktop && (
              <Dropdown.Item onClick={() => handleShowConfirm(desktop)} className="flex gap-3">
                <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                <span>Delete</span>
              </Dropdown.Item>
            )}
          </Dropdown>
        </Table.Cell>
      </Table.Row>
    ),
    [theme, permissions, renderPasswordCell, handleDownVNC, handleDownRDP, handleShowConfirm],
  );

  if (loading) return <Spinner />;

  return (
    <div
      className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words"
      style={{ overflowX: 'auto' }}
    >
      <div className="flex items-center justify-between">
        <h5 className="card-title">My Desktops</h5>
        <Search placeholder="Enter Desktop Name" handleSearch={handleSearch} />
      </div>

      <Confirm
        visible={confirmDialog.visible}
        mess={
          <>
            Are you sure you want to delete desktop:{' '}
            <strong
              style={{
                color: theme === 'dark' ? 'var(--color-dark-link)' : 'var(--color-primary)',
                fontSize: '1.1rem',
                padding: '0 2px',
              }}
            >
              {confirmDialog.desktop?.name}
            </strong>
            ?
          </>
        }
        handleConfirm={handleDeleteDesktop}
        handleCancel={handleCancelConfirm}
      />

      {permissions.canCreateDesktop && (
        <div>
          <Button
            as={Link}
            color="primary"
            style={{ marginLeft: 'auto', marginTop: '14px', maxWidth: 'fit-content' }}
            to="/ui/desktops/addDesktop"
          >
            Add Desktop
            <Icon icon="solar:add-circle-bold" height={22} />
          </Button>
        </div>
      )}

      <div className="mt-3">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Desktop</Table.HeadCell>
            <Table.HeadCell>IP</Table.HeadCell>
            <Table.HeadCell>Port</Table.HeadCell>
            <Table.HeadCell>Password</Table.HeadCell>
            <Table.HeadCell>hasGPU</Table.HeadCell>
            <Table.HeadCell>GPU</Table.HeadCell>
            <Table.HeadCell>SSD</Table.HeadCell>
            <Table.HeadCell>RAM</Table.HeadCell>
            <Table.HeadCell>CPU</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>noVNC</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-border dark:divide-darkborder">
            {filteredDesktops.map(renderTableRow)}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default MyDesktopTable;
