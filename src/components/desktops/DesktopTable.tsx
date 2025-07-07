import { useEffect, useState, useCallback, useMemo } from 'react';
import { Badge, Button, Dropdown } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { Table } from 'flowbite-react';
import Search from '../Search/Search';
import { Link } from 'react-router';
import Confirm from '../confirm/Confirm';
import { User, Desktop } from 'src/types/user/User';
import { useUser } from 'src/hooks/UserContext';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import toast from 'react-hot-toast';

import './DesktopTable.css';
import { useLocation, useNavigate } from 'react-router';

const DesktopTable = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.addDesktopSuccess) {
      toast.success('Add desktop successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
    if (location.state?.updateDesktopSuccess) {
      toast.success('Update desktop successful!');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const { hasPermission, token, theme } = useUser();

  const [desktops, setDesktops] = useState<Desktop[]>([]);
  const [desktopFilter, setDesktopFilter] = useState<Desktop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShowPass, setIsShowPass] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDesktop, setSelectedDesktop] = useState<Desktop | null>(null);

  // Memoize user map để tránh tìm kiếm lặp lại
  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, User>);
  }, [users]);

  // Memoize permissions check
  const permissions = useMemo(
    () => ({
      canGetAllVDI: hasPermission('get_all_VDI'),
      canViewInfoVDI:
        // hasPermission('get_all_user') &&
        // hasPermission('get_all_VDI') &&
        hasPermission('get_VDI_info'),
      canGetAllUser: hasPermission('get_all_user'),
      canCreateVDI: hasPermission('create_VDI'),
      canDeleteVDI: hasPermission('delete_VDI'),
    }),
    [hasPermission],
  );

  // Fetch desktops với useCallback
  const fetchDesktops = useCallback(async () => {
    if (!permissions.canGetAllVDI) return;

    try {
      const res = await axiosClient.get('/virtualDesktops', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDesktops(res.data.result);
      setDesktopFilter(res.data.result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách desktop:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions.canGetAllVDI, token]);

  // Fetch users với useCallback
  const fetchUsers = useCallback(async () => {
    if (!permissions.canGetAllUser) return;

    try {
      const res = await axiosClient.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data.result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách user:', error);
    }
  }, [token, permissions.canGetAllUser]);

  useEffect(() => {
    fetchDesktops();
  }, [fetchDesktops]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setDesktopFilter([...desktops]);
  }, [desktops]);

  // Optimize search với useCallback và debounce concept
  const handleSearch = useCallback(
    (key: string) => {
      if (key.trim()) {
        setDesktopFilter(desktops.filter((item) => item.name?.includes(key.trim())));
      } else {
        setDesktopFilter([...desktops]);
      }
    },
    [desktops],
  );

  const handleShowConfirm = useCallback((item: Desktop) => {
    setSelectedDesktop(item);
    setShowConfirm(true);
  }, []);

  // Giữ nguyên các function download như yêu cầu
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
        // Trả về null để phân biệt với lỗi thật sự
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
      // Đảm bảo link được add vào DOM để browser tracking download history
      link.style.display = 'none';
      document.body.appendChild(link);

      // Click để trigger download
      link.click();

      // Cleanup sau một chút delay để đảm bảo download đã bắt đầu
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
    try {
      // Gọi API để lấy file data
      const res = await axiosClient.post(
        '/vnc/vncfile',
        {
          name: selectedDesktop?.name,
          ip: selectedDesktop?.ip,
          port: selectedDesktop?.port,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        },
      );

      const fileName = `${selectedDesktop?.name || 'desktop'}.vnc`;
      const blob = new Blob([res.data]);

      // Thử download với location picker trước
      const pickerResult = await downloadWithLocationPicker(blob, fileName);

      if (pickerResult === true) {
        // Thành công với file picker
        toast.success('File saved successfully');
      } else if (pickerResult === false) {
        // Lỗi với file picker, dùng fallback
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else if (pickerResult === null) {
        // User đã cancel, không làm gì cả
        console.log('Download cancelled by user');
        return; // Thoát sớm, không chạy fallback
      }

      console.log('Download VNC file completed for:', selectedDesktop?.name);
    } catch (error) {
      console.error('Error downloading VNC file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  const handleDownRDP = async (): Promise<void> => {
    try {
      // Gọi API để lấy file data
      const res = await axiosClient.get('/generateRdp/downloadRdp', {
        params: {
          ipAddress: selectedDesktop?.ip,
          username: userMap[selectedDesktop?.userId || '']?.username,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const fileName = `${selectedDesktop?.name || 'desktop'}.rdp`;
      const blob = new Blob([res.data]);

      // Thử download với location picker trước
      const pickerResult = await downloadWithLocationPicker(blob, fileName);

      if (pickerResult === true) {
        // Thành công với file picker
        toast.success('File saved successfully');
      } else if (pickerResult === false) {
        // Lỗi với file picker, dùng fallback
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else if (pickerResult === null) {
        // User đã cancel, không làm gì cả
        console.log('Download cancelled by user');
        return; // Thoát sớm, không chạy fallback
      }

      console.log('Download RDP file completed for:', selectedDesktop?.name);
    } catch (error) {
      console.error('Error downloading RDP file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  const handleDeleteDesktop = useCallback(async () => {
    if (!permissions.canDeleteVDI) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/virtualDesktops/${selectedDesktop?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDesktops((prev) => prev.filter((des) => des.id !== selectedDesktop?.id));
      setShowConfirm(false);
      setSelectedDesktop(null);
      console.log('delete desktop ' + selectedDesktop?.name);
      toast.success(`Delete desktop ${selectedDesktop?.name} successful!`);
    } catch (error) {
      console.error('Lỗi khi xóa desktop:', error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [permissions.canDeleteVDI, selectedDesktop, token]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(false);
    setSelectedDesktop(null);
  }, []);

  const handlePasswordToggle = useCallback((item: Desktop) => {
    setIsShowPass((prev) => !prev);
    setSelectedDesktop(item);
  }, []);

  // Memoize confirm message để tránh re-render
  const confirmMessage = useMemo(
    () => (
      <>
        Are you sure you want to delete desktop:{' '}
        <strong
          style={{
            color: `${theme === 'dark' ? 'var(--color-dark-link)' : 'var(--color-primary)'}`,
            fontSize: '1.1rem',
            padding: '0 2px',
          }}
        >
          {selectedDesktop?.name}{' '}
        </strong>
        ?
      </>
    ),
    [selectedDesktop?.name, theme],
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div
      className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words"
      style={{ overflowX: 'auto' }}
    >
      <div className="flex items-center justify-between">
        <h5 className="card-title">Desktop Management</h5>
        <Search placeholder={'Enter Desktop Name'} handleSearch={handleSearch} />
        <Confirm
          visible={showConfirm}
          mess={confirmMessage}
          handleConfirm={handleDeleteDesktop}
          handleCancel={handleCancelConfirm}
        />
      </div>

      {permissions.canCreateVDI && (
        <div>
          <Button
            as={Link}
            color={'primary'}
            style={{ marginLeft: 'auto', marginTop: '14px', maxWidth: 'fit-content' }}
            to={'/ui/desktops/addDesktop'}
          >
            Add Desktop
            <Icon icon="solar:add-circle-bold" height={22} />
          </Button>
        </div>
      )}

      <div className="mt-3">
        <div>
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
              <Table.HeadCell>User</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder ">
              {desktopFilter.map((item, index) => {
                const user = userMap[item.userId || ''];
                const isPasswordVisible = isShowPass && selectedDesktop?.name === item.name;

                return (
                  <Table.Row key={index}>
                    <Table.Cell className="whitespace-nowrap">
                      <h6
                        className={`text-sm desktop-name-link ${
                          theme === 'dark' ? 'dark-theme' : ''
                        }`}
                        style={permissions.canViewInfoVDI ? {} : { cursor: 'initial' }}
                      >
                        {permissions.canViewInfoVDI ? (
                          <Link to={`/ui/desktops/${item.name}`}>{item.name}</Link>
                        ) : (
                          item.name
                        )}
                      </h6>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-3 items-center">
                        <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                          <h6 className="text-wrap">{item.ip || '--'}</h6>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <h6 className="text-wrap">{item.port}</h6>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center">
                        {isPasswordVisible ? (
                          <h6 className="text-wrap mr-1">{item.password || '--'}</h6>
                        ) : (
                          <h6 className="text-wrap mr-1">{'•'.repeat(8) || 'no data...'}</h6>
                        )}

                        <Icon
                          icon="solar:eye-broken"
                          height="18"
                          className={
                            isPasswordVisible
                              ? theme === 'dark'
                                ? 'text-light-dark-theme-custom'
                                : 'text-dark'
                              : 'text-gray'
                          }
                          style={{ cursor: 'pointer' }}
                          onClick={() => handlePasswordToggle(item)}
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={item.hasGPU === 'YES' ? `lightsuccess` : 'lighterror'}
                        className={item.hasGPU === 'YES' ? `text-success` : 'lighterror'}
                      >
                        <span style={{ fontSize: '0.9rem' }}>{item.hasGPU ? `+` : '--'}</span>
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <h6 className="text-wrap">{item.gpu}</h6>
                    </Table.Cell>
                    <Table.Cell>
                      <h6 className="text-wrap">{item.ssd}</h6>
                    </Table.Cell>
                    <Table.Cell>
                      <h6 className="text-wrap">{item.ram}</h6>
                    </Table.Cell>
                    <Table.Cell>
                      <h6 className="text-wrap">{item.cpu}</h6>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={`lightsuccess`} className={`text-success`}>
                        <span style={{ fontSize: '0.9rem' }}>{`+`}</span>
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <button className="noVNC-btn">
                        <Icon icon="solar:laptop-minimalistic-broken" height={20} />
                      </button>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <h6
                        className={`text-sm desktop-name-link ${
                          theme === 'dark' ? 'dark-theme' : ''
                        }`}
                        style={!permissions.canGetAllUser ? { cursor: 'initial' } : {}}
                      >
                        {permissions.canGetAllUser ? (
                          <Link to={user?.username ? `/ui/users/${user.username}` : '#'}>
                            {user?.username || '----'}
                          </Link>
                        ) : (
                          '----'
                        )}
                      </h6>
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
                              onClick={() => setSelectedDesktop(item)}
                            />
                          </span>
                        )}
                      >
                        <Dropdown.Item onClick={handleDownVNC} className="flex gap-3">
                          {' '}
                          <Icon icon={`solar:download-minimalistic-broken`} height={18} />
                          <span>Download VNC</span>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleDownRDP} className="flex gap-3">
                          {' '}
                          <Icon icon={`solar:download-minimalistic-broken`} height={18} />
                          <span>Download RDP</span>
                        </Dropdown.Item>
                        {permissions.canDeleteVDI && (
                          <Dropdown.Item
                            onClick={() => handleShowConfirm(item)}
                            className="flex gap-3"
                          >
                            {' '}
                            <Icon icon={`solar:trash-bin-minimalistic-outline`} height={18} />
                            <span>Delete</span>
                          </Dropdown.Item>
                        )}
                      </Dropdown>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DesktopTable;
