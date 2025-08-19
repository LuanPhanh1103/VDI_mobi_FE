import { useState, useEffect } from 'react';
import { Label, Button, Badge, Dropdown } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Desktop } from 'src/types/user/User';
import axiosClient from 'src/lib/api/axiosClient';
import InputText from '../Input/InputText';
import InpuSelect, { OptionObject, OptionValue } from '../Input/InputSelect';
import InputPassword from '../Input/InputPassword';
import { DesktopDetailsType } from 'src/views/details/DesktopDetails';
import toast from 'react-hot-toast';
import Spinner from 'src/components/Spinner/Spinner';
import { useUser } from 'src/hooks/useUser';
import useGoBack from 'src/hooks/useGoBack';

import './DesktopDetails.css';
import { HiOutlineDotsVertical } from 'react-icons/hi';

const DesktopDetails = ({ desktop, ipList, desNameList }: DesktopDetailsType) => {
  const { desktopName } = useParams();
  const { token, theme, hasPermission } = useUser();
  const { goBack } = useGoBack();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const currenDesktop: Desktop = desktop;
  const ipExistList: string[] = ipList;
  const desNameExistList: string[] = desNameList;

  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [newPass, setNewPass] = useState('');

  const [desName, setDesName] = useState(currenDesktop.name);
  const [ip, setIp] = useState(currenDesktop.ip);
  const [port, setPort] = useState(currenDesktop.port);
  const [hasGpu, setHasGpu] = useState(currenDesktop.hasGPU === 'YES' ? true : false);
  const [gpu, setGpu] = useState(currenDesktop.gpu);
  const [volumeSize, setVolumeSize] = useState(currenDesktop.volumeSize);
  const [ram, setRam] = useState(currenDesktop.ram);
  const [cpu, setCpu] = useState(currenDesktop.cpu);

  const [userList, setUserList] = useState<OptionObject[]>([]);
  const [user, setUser] = useState<OptionValue[] | OptionValue>(); // default

  const [isFormValidIp, setIsFormValidIp] = useState(true);
  const [isFormValidPassword, setIsFormValidPassword] = useState(true);

  //get list user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!hasPermission('get_all_user')) return;

      try {
        setLoading(true);
        const res = await axiosClient.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserList(
          res.data.result.map((user: User) => ({
            label: user.username,
            value: user.id,
          })),
        );
      } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, hasPermission]);

  useEffect(() => {
    if (userList) {
      setUser(userList.find((u) => u.value === currenDesktop.userId)?.value);
    }
  }, [userList]);

  // Function download với location picker - Updated
  const downloadWithLocationPicker = async (
    data: Blob,
    fileName: string,
  ): Promise<{ success: boolean; cancelled: boolean }> => {
    try {
      if (!('showSaveFilePicker' in window)) {
        console.warn('File System Access API not supported');
        return { success: false, cancelled: false }; // API không được hỗ trợ
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
      return { success: true, cancelled: false };
    } catch (error: any) {
      const errorName = error?.name || '';

      if (errorName === 'AbortError') {
        console.log('User cancelled file save dialog');
        return { success: false, cancelled: true }; // User đã cancel
      }

      console.error('Error with file picker:', error);
      return { success: false, cancelled: false }; // Lỗi khác
    }
  };

  // Hàm fallback sử dụng phương pháp cũ - Không thay đổi
  const downloadWithFallback = (data: Blob, fileName: string): void => {
    try {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute('download', fileName);

      // Thêm vào DOM, click, và cleanup
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Cleanup blob URL
      window.URL.revokeObjectURL(url);

      console.log('File downloaded via fallback method:', fileName);
    } catch (error) {
      console.error('Error with fallback download:', error);
      throw error;
    }
  };

  // download file VNC - Updated
  const handleDownVNC = async (): Promise<void> => {
    try {
      // Gọi API để lấy file data
      const res = await axiosClient.post(
        '/vnc/vncfile',
        {
          name: desName,
          ip: ip,
          port: port,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        },
      );

      const fileName = `${desName || 'desktop'}.vnc`;
      const blob = new Blob([res.data]);

      // Thử download với location picker trước
      const { success, cancelled } = await downloadWithLocationPicker(blob, fileName);

      if (cancelled) {
        // User đã cancel, không làm gì cả
        console.log('Download cancelled by user');
        return;
      }

      if (!success) {
        // API không được hỗ trợ hoặc có lỗi khác, dùng fallback
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else {
        toast.success('File saved successfully');
      }

      console.log('Download VNC file completed for:', desName);
    } catch (error) {
      console.error('Error downloading VNC file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  // download file RDP - Updated
  const handleDownRDP = async (): Promise<void> => {
    try {
      // Gọi API để lấy file data
      const res = await axiosClient.get('/generateRdp/downloadRdp', {
        params: {
          ipAddress: ip,
          username: userList.find((u) => u.value === currenDesktop.userId)?.label,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const fileName = `${desName || 'desktop'}.rdp`;
      const blob = new Blob([res.data]);

      // Thử download với location picker trước
      const { success, cancelled } = await downloadWithLocationPicker(blob, fileName);

      if (cancelled) {
        // User đã cancel, không làm gì cả
        console.log('Download cancelled by user');
        return;
      }

      if (!success) {
        // API không được hỗ trợ hoặc có lỗi khác, dùng fallback
        downloadWithFallback(blob, fileName);
        toast.success('File downloaded to Downloads folder');
      } else {
        toast.success('File saved successfully');
      }

      console.log('Download RDP file completed for:', desName);
    } catch (error) {
      console.error('Error downloading RDP file:', error);
      toast.error(`Download failed: ${error}`);
    }
  };

  const handleSave = async () => {
    const updatedDesktop = {
      name: desName,
      ip: ip,
      password: newPass ? newPass : currenDesktop.password,
      hasGPU: hasGpu ? 'YES' : 'NO',
      port: port,
      cpu: cpu,
      gpu: hasGpu ? gpu : '0',
      ram: ram,
      volumeSize: volumeSize,
      userId: user,
    };

    // call api
    if (
      !hasPermission('update_VDI') ||
      hasPermission('get_all_user') ||
      hasPermission('get_all_VDI')
    )
      return;

    if (!isFormValidIp || !isFormValidPassword) {
      console.log('invalid');
      return;
    }
    console.log('valid');

    try {
      setLoading(true);
      await axiosClient.put(`/virtualDesktops/${currenDesktop.id}`, updatedDesktop, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('update desktop ' + currenDesktop.name + ' successful');
      navigate('/desktops', { state: { updateDesktopSuccess: true } });
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDesName(currenDesktop.name);
    setIp(currenDesktop.ip);
    setPort(currenDesktop.port);
    setHasGpu(currenDesktop.hasGPU === 'YES' ? true : false);
    setGpu(currenDesktop.gpu);
    setCpu(currenDesktop.cpu);
    setRam(currenDesktop.ram);
    setVolumeSize(currenDesktop.volumeSize);
    setUser(userList.find((u) => u.value === currenDesktop.userId)?.value || '');

    setIsEdit(false);
  };

  return loading ? (
    <Spinner />
  ) : (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <button onClick={goBack} className="mb-2 inline-block" title="Go Back">
          <Icon
            className={`details-back-icon ${theme === 'dark' ? 'dark-theme' : ''}`}
            icon="solar:map-arrow-left-bold-duotone"
            height="30"
          />
        </button>
        <div className="flex items-center justify-between">
          <h5 className="card-title">
            Desktop <strong style={{ color: 'var(--color-primary)' }}>{desktopName}</strong>
          </h5>
          <Dropdown
            placement="bottom-end"
            label=""
            dismissOnClick={false}
            renderTrigger={() => (
              <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                <HiOutlineDotsVertical size={36} style={{ padding: '7px' }} />
              </span>
            )}
          >
            <Dropdown.Item className="flex gap-3">
              {' '}
              <Icon icon="solar:laptop-minimalistic-broken" height={18} />
              <span>noVNC</span>
            </Dropdown.Item>
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
          </Dropdown>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col">
                <InputText
                  type="text"
                  label="Desktop Name"
                  value={desName}
                  onChange={setDesName}
                  isEditable={isEdit}
                  placeholder="Enter Desktop Name"
                  required={isEdit}
                  existingValues={desNameExistList}
                />
                <InputText
                  type="text"
                  label="IP"
                  value={ip || ''}
                  onChange={setIp}
                  isEditable={isEdit}
                  placeholder="Enter IP"
                  required={isEdit}
                  existingValues={ipExistList}
                  onValidStateChange={setIsFormValidIp}
                />
                <InputText
                  type="text"
                  label="Port"
                  value={port || ''}
                  onChange={setPort}
                  isEditable={isEdit}
                  placeholder="Enter Port"
                  required={isEdit}
                />
                <div
                  className={`flex items-start mt-5 justify-between ${hasGpu ? 'mb-5' : 'mb-9'}`}
                >
                  <div>
                    <div className="mb-2 flex items-center">
                      <Label htmlFor="hasGpu" value="Has GPU" />
                    </div>
                    <input
                      type="checkbox"
                      id="hasGpu"
                      style={{ display: 'none' }}
                      checked={hasGpu}
                      onChange={(e) => {
                        isEdit && setHasGpu(e.target.checked);
                      }}
                    />
                    <Badge
                      color={hasGpu ? `lightsuccess` : 'lighterror'}
                      className={hasGpu ? `text-success` : 'lighterror'}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => {
                        isEdit && setHasGpu((prev) => !prev);
                      }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{hasGpu ? `+` : '--'}</span>
                    </Badge>
                  </div>
                  {hasGpu ? (
                    <div style={{ width: '50%' }}>
                      <InputText
                        type="text"
                        label="GPU"
                        value={gpu || ''}
                        onChange={setGpu}
                        isEditable={isEdit}
                        placeholder="Enter GPU"
                        required={isEdit}
                        errorMessages={{
                          required: 'This field is required',
                        }}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="flex  flex-col">
                {hasPermission('get_all_user') ? (
                  isEdit ? (
                    <InpuSelect
                      options={userList}
                      label="User"
                      multiple={false}
                      placeholder="Select User - admin by default"
                      onChange={(values: OptionValue[] | OptionValue) => setUser(values)}
                      defaultValue={user}
                    />
                  ) : (
                    <InputText
                      type="text"
                      label="User"
                      value={
                        userList
                          ? userList.find((u) => u.value === currenDesktop.userId)?.label
                          : 'This desktop does not belong to any user'
                      }
                      isEditable={false}
                      placeholder="User"
                      required={false}
                    />
                  )
                ) : (
                  <></>
                )}
                <InputText
                  type="text"
                  label="CPU"
                  value={cpu || ''}
                  onChange={setCpu}
                  isEditable={isEdit}
                  placeholder="Enter CPU"
                  required={isEdit}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="RAM"
                  value={ram || ''}
                  onChange={setRam}
                  isEditable={isEdit}
                  placeholder="Enter RAM"
                  required={isEdit}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="volumeSize"
                  value={volumeSize || ''}
                  onChange={setVolumeSize}
                  isEditable={isEdit}
                  placeholder="Enter volumeSize"
                  required={isEdit}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
              </div>
            </div>
            {hasPermission('update_VDI') &&
            hasPermission('get_all_user') &&
            hasPermission('get_all_VDI') ? (
              !isEdit ? (
                <div className="col-span-12 flex gap-3 items-center justify-between">
                  <Button color={'primary'} onClick={() => setIsEdit(true)}>
                    Edit
                  </Button>
                  {!isChangePassword && (
                    <Button
                      color={'primary'}
                      onClick={() => {
                        setIsChangePassword(true);
                        setIsFormValidPassword(false);
                      }}
                    >
                      Change Password
                    </Button>
                  )}
                </div>
              ) : (
                <div className="col-span-12 flex gap-3 items-center justify-between">
                  <div className="flex gap-3 items-center justify-between">
                    <Button
                      color={'primary'}
                      onClick={handleSave}
                      disabled={!isFormValidIp || !isFormValidPassword}
                    >
                      Save
                    </Button>
                    <Button color={'error'} onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                  {!isChangePassword && (
                    <Button
                      color={'primary'}
                      onClick={() => {
                        setIsChangePassword(true);
                        setIsFormValidPassword(false);
                      }}
                    >
                      Change Password
                    </Button>
                  )}
                </div>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      {hasPermission('update_VDI') &&
        hasPermission('get_all_user') &&
        hasPermission('get_all_VDI') &&
        isChangePassword && (
          <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white mt-6 dark:bg-darkgray p-6 relative w-full break-words">
            <h5 className="card-title">Change Desktop Password</h5>
            <Icon
              className="close-change-password-icon"
              icon="solar:close-circle-broken"
              height="30"
              onClick={() => {
                setIsChangePassword(false);
                setIsFormValidPassword(true);
                setNewPass('');
              }}
            />
            <div className="mt-6">
              <InputPassword
                value={newPass}
                onChange={setNewPass}
                onValidStateChange={setIsFormValidPassword}
                isEditable={true}
                minLength={8}
                requireUppercase={true}
                requireLowercase={true}
                requireNumber={true}
                requireSpecialChar={true}
                required={true}
                passwordLabel="New Password"
                confirmLabel="Confirm New Password"
                placeholder="Enter New Password"
                confirmPlaceholder="Confirm New Password"
                errorMessages={{
                  minLength: `At least 8 character`,
                  match: 'Confirmation password does not match',
                  uppercase: 'At least one uppercase character (A-Z)',
                  lowercase: 'At least one lowercase character (a-z)',
                  number: 'At least one number (0-9)',
                  specialChar: 'At least one special character (@, #, !, $, %, &, ...)',
                  required: 'This field is required',
                }}
              />
            </div>
            {hasPermission('update_VDI') &&
              hasPermission('get_all_user') &&
              hasPermission('get_all_VDI') &&
              !isEdit && (
                <Button
                  color={'primary'}
                  onClick={handleSave}
                  className="mt-30"
                  disabled={!isFormValidPassword}
                >
                  Save
                </Button>
              )}
          </div>
        )}
    </>
  );
};

export default DesktopDetails;
