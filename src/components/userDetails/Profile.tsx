import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Label, TextInput, Button, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { useParams } from 'react-router-dom';
import { User, Role } from 'src/types/user/User';
import { useUser } from 'src/hooks/useUser';
import InputText from '../Input/InputText';
import InputPassword from '../Input/InputPassword';
import InpuSelect, { OptionValue } from '../Input/InputSelect';
import axiosClient from 'src/lib/api/axiosClient';
import Spinner from 'src/components/Spinner/Spinner';
import toast from 'react-hot-toast';
import useGoBack from 'src/hooks/useGoBack';

import './userDetails.css';

const Profile = () => {
  const { username } = useParams();
  const { goBack } = useGoBack();
  const { token, theme, hasPermission, userDetails } = useUser();

  // Use ref to track if data has been initialized
  const isInitialized = useRef(false);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // UI State
  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State - Initialize with empty values
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isMale, setIsMale] = useState(false);
  const [age, setAge] = useState(1);
  const [groups, setGroups] = useState<OptionValue[] | OptionValue>([]);

  // Validation State
  const [isFormValidEmail, setIsFormValidEmail] = useState(true);
  const [isFormValidPassword, setIsFormValidPassword] = useState(true);
  const [isFormValidOldPassword, setIsFormValidOldPassword] = useState(true);

  // Memoized permission checks - only recalculate when hasPermission function changes
  const canGetAllUsers = useMemo(() => hasPermission('get_all_user'), [hasPermission]);
  const canGetAllRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);
  const canUpdateUser = useMemo(() => hasPermission('update_user'), [hasPermission]);

  // Memoized email list - only recalculate when users array changes
  const emailExistList = useMemo(() => {
    return users
      .filter((user) => user.username !== username && user.email)
      .map((user) => user.email);
  }, [users, username]);

  // Initialize form data only once when userDetails is first available
  useEffect(() => {
    if (userDetails && !isInitialized.current) {
      setUserName(userDetails.username || '');
      setFirstName(userDetails.firstName || '');
      setLastName(userDetails.lastName || '');
      setEmail(userDetails.email || '');
      setIsMale(userDetails.gender === 'MALE');
      setAge(Number(userDetails.age) || 1);
      setGroups(userDetails.roles?.map((group) => group.name) || []);
      isInitialized.current = true;
    }
  }, [userDetails]);

  // Fetch users - only when permission is available and token exists
  useEffect(() => {
    if (!canGetAllUsers || !token) return;

    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await axiosClient.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUsers(res.data.result);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách user:', error);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [canGetAllUsers, token]);

  // Fetch roles - only when permission is available and token exists
  useEffect(() => {
    if (!canGetAllRoles || !token) return;

    let isMounted = true;
    const fetchRoles = async () => {
      try {
        const res = await axiosClient.get('/roles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setRoles(res.data.result.map((role: Role) => role.name));
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách role:', error);
      }
    };

    fetchRoles();

    return () => {
      isMounted = false;
    };
  }, [canGetAllRoles, token]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSaveUserDetails = useCallback(async () => {
    if (!canUpdateUser || !isFormValidEmail) {
      console.log('invalid');
      return;
    }

    const updatedUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: isMale ? 'MALE' : 'FEMALE',
      age: age === 0 || age > 100 ? 1 : age,
      roles: Array.isArray(groups) && groups.length === 0 ? ['USER'] : groups,
    };

    try {
      setLoading(true);
      await axiosClient.put(`/users/${userDetails?.id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('update info user ' + userDetails?.username + ' successful');
      setIsEdit(false);
      setIsChangePassword(false);
      setIsFormValidPassword(true);
      setIsFormValidOldPassword(true);
      setIsShowOldPassword(false);
      setNewPass('');
      setOldPass('');
      toast.success('Updated user successful');
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [
    canUpdateUser,
    isFormValidEmail,
    firstName,
    lastName,
    email,
    isMale,
    age,
    groups,
    userDetails,
    token,
  ]);

  const handleSaveUserPassword = useCallback(async () => {
    if (!canUpdateUser || !isFormValidPassword || !isFormValidOldPassword) {
      console.log('invalid');
      return;
    }

    const updatedUserPassword = {
      oldPassword: oldPass,
      newPassword: newPass,
    };

    try {
      setLoading(true);
      await axiosClient.post(`/users/${userDetails?.id}`, updatedUserPassword, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('update password user ' + userDetails?.username + ' successful');
      setIsEdit(false);
      setIsChangePassword(false);
      setIsFormValidPassword(true);
      setIsFormValidOldPassword(true);
      setIsShowOldPassword(false);
      setNewPass('');
      setOldPass('');
      toast.success('Updated password successful');
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [
    canUpdateUser,
    isFormValidPassword,
    isFormValidOldPassword,
    oldPass,
    newPass,
    userDetails,
    token,
  ]);

  const handleCancel = useCallback(() => {
    if (userDetails) {
      setUserName(userDetails.username || '');
      setFirstName(userDetails.firstName || '');
      setLastName(userDetails.lastName || '');
      setEmail(userDetails.email || '');
      setIsMale(userDetails.gender === 'MALE');
      setAge(Number(userDetails.age) || 1);
      setGroups(userDetails.roles?.map((group) => group.name) || []);
    }
    setIsEdit(false);
    console.log(userDetails?.username, 'cancel');
  }, [userDetails]);

  const handleGenderToggle = useCallback(() => {
    if (isEdit) {
      setIsMale((prev) => !prev);
    }
  }, [isEdit]);

  const handleAgeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isEdit) {
        setAge(Number(e.target.value));
      }
    },
    [isEdit],
  );

  const handleToggleChangePassword = useCallback(() => {
    setIsChangePassword(true);
    setIsFormValidPassword(false);
    setIsFormValidOldPassword(false);
  }, []);

  const handleCloseChangePassword = useCallback(() => {
    setIsChangePassword(false);
    setIsFormValidPassword(true);
    setIsFormValidOldPassword(true);
    setIsShowOldPassword(false);
    setNewPass('');
    setOldPass('');
  }, []);

  const handleToggleShowPassword = useCallback(() => {
    setIsShowOldPassword((prev) => !prev);
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <button onClick={goBack} className="mb-2 inline-block" title="Go Back">
          <Icon
            className={`details-back-icon ${theme === 'dark' ? 'dark-theme' : ''}`}
            icon="solar:map-arrow-left-bold-duotone"
            height="30"
          />
        </button>
        <h5 className="card-title">
          {!isEdit ? (
            <p>
              User <strong style={{ color: 'var(--color-primary)' }}>{userName}</strong>
            </p>
          ) : (
            <p>
              Edit User <strong style={{ color: 'var(--color-primary)' }}>{userName}</strong>
            </p>
          )}
        </h5>
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col">
                <InputText
                  type="text"
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  isEditable={isEdit}
                  placeholder="Enter First Name"
                  required={false}
                />
                <InputText
                  type="text"
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  isEditable={isEdit}
                  placeholder="Enter Last Name"
                  required={false}
                />
                <div className="mt-5">
                  <div className="mb-2 flex items-center">
                    <Label htmlFor="gender" value="Gender" />
                    <p className="check-desc ml-2">(Green: Male ---- Red: Female)</p>
                  </div>
                  <input
                    type="checkbox"
                    id="gender"
                    style={{ display: 'none' }}
                    checked={isMale}
                    onChange={(e) => {
                      isEdit && setIsMale(e.target.checked);
                    }}
                  />
                  <Badge
                    color={isMale ? 'lightsuccess' : 'lighterror'}
                    className={isMale ? 'text-success' : 'lighterror'}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={handleGenderToggle}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{isMale ? '+' : '--'}</span>
                  </Badge>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center">
                    <Label htmlFor="age" value="Age" />
                    <p className="check-desc ml-2">(From 1 to 100)</p>
                  </div>
                  <TextInput
                    id="age"
                    type="number"
                    name="quantity"
                    min="1"
                    max="100"
                    placeholder="Age"
                    disabled={!isEdit}
                    className={
                      !isEdit
                        ? 'form-control form-rounded-xl custom-input-age'
                        : 'form-control form-rounded-xl'
                    }
                    value={age || 1}
                    onChange={handleAgeChange}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col">
                <InputText
                  type="email"
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  isEditable={isEdit}
                  placeholder="Enter email"
                  existingValues={emailExistList.filter((e): e is string => e !== null)}
                  onValidStateChange={setIsFormValidEmail}
                  required={isEdit}
                  errorMessages={{
                    required: 'This field is required',
                    duplicate: 'This email is existed',
                  }}
                  allowedDomains={['gmail.com']}
                />
                {isEdit && canGetAllRoles ? (
                  <InpuSelect
                    options={roles}
                    label="Group(s)"
                    multiple={true}
                    placeholder="Select group(s) - USER by default"
                    onChange={setGroups}
                    defaultValue={groups}
                  />
                ) : (
                  <InputText
                    type="text"
                    label="Group(s)"
                    value={
                      Array.isArray(groups) && groups.length > 0
                        ? groups.join(', ')
                        : 'This user is not in any groups'
                    }
                    isEditable={false}
                    placeholder="Group(s)"
                    required={false}
                  />
                )}
              </div>
            </div>
            {canUpdateUser &&
              (!isEdit ? (
                <div className="col-span-12 flex gap-3 items-center justify-between">
                  <Button color={'primary'} onClick={() => setIsEdit(true)}>
                    Edit
                  </Button>
                  {!isChangePassword && (
                    <Button color={'primary'} onClick={handleToggleChangePassword}>
                      Change Password
                    </Button>
                  )}
                </div>
              ) : (
                <div className="col-span-12 flex gap-3 items-center justify-between">
                  <div className="flex gap-3 items-center justify-between">
                    <Button
                      color={'primary'}
                      onClick={handleSaveUserDetails}
                      disabled={!isFormValidEmail}
                    >
                      Save
                    </Button>
                    <Button color={'error'} onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                  {!isChangePassword && (
                    <Button color={'primary'} onClick={handleToggleChangePassword}>
                      Change Password
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      {canUpdateUser && isChangePassword && (
        <div className="relative rounded-xl dark:shadow-dark-md shadow-md bg-white mt-6 dark:bg-darkgray p-6 relative w-full break-words">
          <h5 className="card-title">Change User Password</h5>
          <Icon
            className="close-change-password-icon"
            icon="solar:close-circle-broken"
            height="30"
            onClick={handleCloseChangePassword}
          />
          <Icon
            icon="solar:eye-broken"
            height="22"
            className={`show-old-password-icon ${
              isShowOldPassword
                ? `${theme === 'dark' ? 'dark-theme text-white' : 'text-dark'}`
                : `${theme === 'dark' ? 'dark-theme' : ''}`
            }`}
            onClick={handleToggleShowPassword}
          />
          <div className="mt-6">
            <InputText
              type={isShowOldPassword ? 'text' : 'password'}
              label="Current Password"
              value={oldPass}
              onChange={setOldPass}
              onValidStateChange={setIsFormValidOldPassword}
              isEditable={true}
              placeholder="Enter Current Password"
              required={true}
              errorMessages={{
                required: 'This field is required',
              }}
            />

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
          <Button
            color={'primary'}
            onClick={handleSaveUserPassword}
            className="mt-30"
            disabled={!isFormValidPassword || !isFormValidOldPassword}
          >
            Save
          </Button>
        </div>
      )}
    </>
  );
};

export default Profile;
