import { useEffect, useState } from 'react';
import { Label, Button, Badge } from 'flowbite-react';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { useUser } from 'src/hooks/UserContext';
import { useNavigate } from 'react-router';
import { Desktop, User } from 'src/types/user/User';
import toast from 'react-hot-toast';

import InputText from '../input/InputText';
import InputPassword from '../input/InputPassword';
import InpuSelect, { OptionValue, OptionObject } from '../input/InputSelect';
import useGoBack from 'src/hooks/useGoBack';

import './addDesktopForm.css';

const AddDesktopForm = () => {
  const { token, hasPermission, userDetails } = useUser();
  const [loading, setLoading] = useState(false);
  const [desktops, setDesktops] = useState<Desktop[]>([]);
  const [users, setUsers] = useState<OptionObject[]>([]);
  const [idAdmin, setIdAdmin] = useState<string>('');
  const navigate = useNavigate();
  const { goBack } = useGoBack();

  const [desktopName, setDesktopName] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [ssd, setSsd] = useState('');

  const [hasGpu, setHasGpu] = useState(true);
  const [gpu, setGpu] = useState('');

  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<OptionValue | OptionValue[]>([]);

  const [isFormValidDesktopName, setIsFormValidDesktopName] = useState(false);
  const [isFormValidIP, setIsFormValidIP] = useState(false);
  const [isFormValidPassword, setIsFormValidPassword] = useState(false);

  const desktopNameExistList: string[] = [];
  const ipExistList: string[] = [];

  useEffect(() => {
    const fetchDesktops = async () => {
      if (!hasPermission('get_all_VDI')) return;

      try {
        const res = await axiosClient.get('/virtualDesktops', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDesktops(res.data.result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách desktop:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesktops();
  }, [token, hasPermission]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!hasPermission('get_all_user')) return;

      try {
        const res = await axiosClient.get('/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data.result.map((u: User) => ({ value: u.id, label: u.username })));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, hasPermission]);

  useEffect(() => {
    if (users) {
      const userAdmin = users.find((u: OptionObject) => u.label === 'admin');
      if (userAdmin) {
        setIdAdmin(userAdmin.value.toString());
      }
    }
  }, [users]);

  useEffect(() => {
    if (!hasGpu) {
      setGpu('');
    }
  }, [hasGpu]);

  desktops.forEach((des) => {
    desktopNameExistList.push(des.name);
    if (des.ip) {
      ipExistList.push(des.ip);
    }
  });

  const handleAddDesktop = async () => {
    if (!hasPermission('create_VDI')) return;

    if (!isFormValidDesktopName || !isFormValidIP || !isFormValidPassword) {
      console.log('invalid');
      return;
    }
    console.log('valid');

    try {
      setLoading(true);

      await axiosClient.post(
        '/virtualDesktops',
        {
          name: desktopName,
          ip: ip,
          password: password,
          hasGPU: hasGpu ? 'YES' : 'NO',
          port: port,
          userId:
            (Array.isArray(selectedUser) && selectedUser.length === 0 ? idAdmin : selectedUser) ||
            userDetails?.id,
          cpu: cpu,
          ram: ram,
          ssd: ssd,
          gpu: hasGpu ? gpu : '0',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('add desktop successful');
      navigate(`/ui/${hasPermission('get_all_VDI') ? 'desktops' : 'myDesktops'}`, {
        state: { addDesktopSuccess: true },
      });
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Add New Desktop</h5>
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex  flex-col">
                <InputText
                  type="text"
                  label="Name"
                  value={desktopName}
                  onChange={setDesktopName}
                  isEditable={true}
                  placeholder="Enter Desktop Name"
                  minLength={5}
                  existingValues={desktopNameExistList}
                  onValidStateChange={setIsFormValidDesktopName}
                  required={true}
                  errorMessages={{
                    minLength: 'At least 5 character',
                    duplicate: 'This desktop is existed',
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="IP"
                  value={ip}
                  onChange={setIp}
                  isEditable={true}
                  placeholder="Enter IP Address"
                  existingValues={ipExistList}
                  onValidStateChange={setIsFormValidIP}
                  required={true}
                  errorMessages={{
                    duplicate: 'This ip address is existed',
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="Port"
                  value={port}
                  onChange={setPort}
                  isEditable={true}
                  placeholder="Enter Port"
                  required={true}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />

                {idAdmin || !(Array.isArray(selectedUser) && selectedUser.length === 0) ? (
                  <InpuSelect
                    options={users}
                    label="User"
                    multiple={false}
                    placeholder="Select user - admin by default"
                    onChange={(values) => setSelectedUser(values)}
                    defaultValue={''}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col">
                <div className={`flex items-start justify-between ${hasGpu ? 'mb-5' : 'mb-9'}`}>
                  <div>
                    <div className="mb-2 flex items-center">
                      <Label htmlFor="hasGpu" value="Has GPU" />
                    </div>
                    <input
                      type="checkbox"
                      id="hasGpu"
                      style={{ display: 'none' }}
                      checked={hasGpu}
                      onChange={(e) => setHasGpu(e.target.checked)}
                    />
                    <Badge
                      color={hasGpu ? `lightsuccess` : 'lighterror'}
                      className={hasGpu ? `text-success` : 'lighterror'}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => setHasGpu((prev) => !prev)}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{hasGpu ? `+` : '--'}</span>
                    </Badge>
                  </div>
                  {hasGpu ? (
                    <InputText
                      type="text"
                      label="GPU"
                      value={gpu}
                      onChange={setGpu}
                      isEditable={true}
                      placeholder="Enter GPU"
                      required={true}
                      errorMessages={{
                        required: 'This field is required',
                      }}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <InputText
                  type="text"
                  label="CPU"
                  value={cpu}
                  onChange={setCpu}
                  isEditable={true}
                  placeholder="Enter CPU"
                  required={true}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="RAM"
                  value={ram}
                  onChange={setRam}
                  isEditable={true}
                  placeholder="Enter RAM"
                  required={true}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="SSD"
                  value={ssd}
                  onChange={setSsd}
                  isEditable={true}
                  placeholder="Enter SSD"
                  required={true}
                  errorMessages={{
                    required: 'This field is required',
                  }}
                />
                <div className="mt-5 mb-5">
                  <InputPassword
                    value={password}
                    onChange={setPassword}
                    onValidStateChange={setIsFormValidPassword}
                    isEditable={true}
                    minLength={8}
                    requireUppercase={true}
                    requireLowercase={true}
                    requireNumber={true}
                    requireSpecialChar={true}
                    required={true}
                    passwordLabel="Password"
                    confirmLabel="Confirm Password"
                    placeholder="Enter Your Password"
                    confirmPlaceholder="Confirm Your Password"
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
              </div>
            </div>
            {hasPermission('create_VDI') ? (
              <div className="col-span-12 flex gap-3">
                <Button
                  color={'primary'}
                  onClick={handleAddDesktop}
                  disabled={!isFormValidDesktopName || !isFormValidIP || !isFormValidPassword}
                >
                  Add
                </Button>
                <Button color={'error'} onClick={goBack}>
                  Cancel
                </Button>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDesktopForm;
