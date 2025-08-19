import { useEffect, useState, useCallback, useMemo } from 'react';
import { Label, TextInput, Button, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Role } from 'src/types/user/User';
import { ProfilePropType } from 'src/views/details/UserDetail';
import { useUser } from 'src/hooks/UserContext';
import InputText from '../input/InputText';
import InputPassword from '../input/InputPassword';
import InpuSelect, { OptionValue } from '../input/InputSelect';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import toast from 'react-hot-toast';
import useGoBack from 'src/hooks/useGoBack';

import './userDetails.css';

const UserDetails = (user: ProfilePropType) => {
  const { username } = useParams();
  const { goBack } = useGoBack();
  const navigate = useNavigate();

  const { token, theme, hasPermission } = useUser();
  const currentUser: User = user.user;

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isShowOldPassword, setIsShowOldPassword] = useState(false);

  // User info states
  const [userName, setUserName] = useState(currentUser.username);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [email, setEmail] = useState(currentUser.email);
  const [isMale, setIsMale] = useState(currentUser.gender === 'MALE');
  const [age, setAge] = useState(Number(currentUser.age));
  const [groups, setGroups] = useState<OptionValue[] | OptionValue>(
    currentUser.roles.map((group) => group.name),
  );

  // Password states
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Validation states
  const [isFormValidEmail, setIsFormValidEmail] = useState(true);
  const [isFormValidPassword, setIsFormValidPassword] = useState(true);
  const [isFormValidOldPassword, setIsFormValidOldPassword] = useState(true);

  // Memoized values
  const emailExistList = useMemo(() => {
    return users
      .filter((user) => user.email && user.username !== username)
      .map((user) => user.email);
  }, [users, username]);

  const canUpdateUser = useMemo(() => hasPermission('update_user'), [hasPermission]);
  const canGetAllUsers = useMemo(() => hasPermission('get_all_user'), [hasPermission]);
  const canGetAllRoles = useMemo(() => hasPermission('get_all_roles'), [hasPermission]);

  // Fetch users - optimized with useCallback
  const fetchUsers = useCallback(async () => {
    if (!canGetAllUsers || !token) return;

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
  }, [canGetAllUsers, token]);

  // Fetch roles - optimized with useCallback
  const fetchRoles = useCallback(async () => {
    if (!canGetAllRoles || !token) return;

    try {
      const res = await axiosClient.get('/roles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles(res.data.result.map((role: Role) => role.name));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách role:', error);
    }
  }, [canGetAllRoles, token]);

  // Effects with proper dependencies
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Optimized handlers with useCallback
  const handleSaveUserDetails = useCallback(async () => {
    if (!canUpdateUser || !isFormValidEmail) {
      if (!isFormValidEmail) {
        console.log('invalid');
      }
      return;
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      gender: isMale ? 'MALE' : 'FEMALE',
      age: age === 0 || age > 100 ? 1 : age,
      roles: Array.isArray(groups) && groups.length === 0 ? ['USER'] : groups,
    };

    try {
      setLoading(true);
      await axiosClient.put(`/users/${currentUser.id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('update info user ' + currentUser.username + ' successful');
      navigate('/ui/users', { state: { updateInfoUsersuccess: true } });
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
    currentUser.id,
    currentUser.username,
    token,
    navigate,
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
      await axiosClient.post(`/users/${currentUser.id}`, updatedUserPassword, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('update password user ' + currentUser.username + ' successful');
      navigate('/ui/users', { state: { updatePasswordUsersuccess: true } });
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
    currentUser.id,
    currentUser.username,
    token,
    navigate,
  ]);

  const handleCancel = useCallback(() => {
    setUserName(currentUser.username);
    setFirstName(currentUser.firstName);
    setLastName(currentUser.lastName);
    setEmail(currentUser.email);
    setIsMale(currentUser.gender === 'MALE');
    setAge(Number(currentUser.age));
    setGroups(currentUser.roles.map((group) => group.name));
    setIsEdit(false);
    console.log(currentUser.username, 'cancel');
  }, [currentUser]);

  const handleToggleGender = useCallback(() => {
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

  const handleStartChangePassword = useCallback(() => {
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

  const handleToggleShowOldPassword = useCallback(() => {
    setIsShowOldPassword((prev) => !prev);
  }, []);

  // Memoized components
  const genderBadge = useMemo(
    () => (
      <Badge
        color={isMale ? `lightsuccess` : 'lighterror'}
        className={isMale ? `text-success` : 'lighterror'}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={handleToggleGender}
      >
        <span style={{ fontSize: '0.9rem' }}>{isMale ? `+` : '--'}</span>
      </Badge>
    ),
    [isMale, handleToggleGender],
  );

  const groupsDisplay = useMemo(() => {
    if (isEdit && canGetAllRoles) {
      return (
        <InpuSelect
          options={roles}
          label="Group(s)"
          multiple={true}
          placeholder="Select group(s) - USER by default"
          onChange={(values: OptionValue[] | OptionValue) => setGroups(values)}
          defaultValue={groups}
        />
      );
    }

    return (
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
    );
  }, [isEdit, roles, groups]);

  const actionButtons = useMemo(() => {
    if (!canUpdateUser) return null;

    if (!isEdit) {
      return (
        <div className="col-span-12 flex gap-3 items-center justify-between">
          <Button color={'primary'} onClick={() => setIsEdit(true)}>
            Edit
          </Button>
          {!isChangePassword && (
            <Button color={'primary'} onClick={handleStartChangePassword}>
              Change Password
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="col-span-12 flex gap-3 items-center justify-between">
        <div className="flex gap-3 items-center justify-between">
          <Button color={'primary'} onClick={handleSaveUserDetails} disabled={!isFormValidEmail}>
            Save
          </Button>
          <Button color={'error'} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        {!isChangePassword && (
          <Button color={'primary'} onClick={handleStartChangePassword}>
            Change Password
          </Button>
        )}
      </div>
    );
  }, [
    canUpdateUser,
    isEdit,
    isChangePassword,
    handleStartChangePassword,
    handleSaveUserDetails,
    handleCancel,
    isFormValidEmail,
  ]);

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
          <p>
            {isEdit ? 'Edit User ' : 'User '}
            <strong style={{ color: 'var(--color-primary)' }}>{userName}</strong>
          </p>
        </h5>
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col">
                <InputText
                  type="text"
                  label="First Name"
                  value={firstName || ''}
                  onChange={setFirstName}
                  isEditable={isEdit}
                  placeholder="Enter First Name"
                  required={false}
                />
                <InputText
                  type="text"
                  label="Last Name"
                  value={lastName || ''}
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
                      if (isEdit) setIsMale(e.target.checked);
                    }}
                  />
                  {genderBadge}
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
                    value={age}
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
                  value={email || ''}
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
                {groupsDisplay}
              </div>
            </div>
            {actionButtons}
          </div>
        </div>
      </div>
      {canUpdateUser && isChangePassword && (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white mt-6 dark:bg-darkgray p-6 relative w-full break-words">
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
            onClick={handleToggleShowOldPassword}
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
          {canUpdateUser && (
            <Button
              color={'primary'}
              onClick={handleSaveUserPassword}
              className="mt-30"
              disabled={!isFormValidPassword || !isFormValidOldPassword}
            >
              Save
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default UserDetails;
