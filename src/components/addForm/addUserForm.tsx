import { useCallback, useEffect, useMemo, useState } from 'react';
import { Label, TextInput, Button, Badge } from 'flowbite-react';
import axiosClient from 'src/api/axiosClient';
import Spinner from 'src/views/spinner/Spinner';
import { useUser } from 'src/hooks/UserContext';
import { useNavigate } from 'react-router';
import { User } from 'src/types/user/User';
import { toast } from 'react-hot-toast';

import InputText from '../input/InputText';
import InputPassword from '../input/InputPassword';

import './addUserForm.css';

const AddUserForm = () => {
  const { token } = useUser();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isMale, setIsMale] = useState(true);
  const [age, setAge] = useState(1);
  const [password, setPassword] = useState('');

  const [isFormValidUsername, setIsFormValidUsername] = useState(false);
  const [isFormValidEmail, setIsFormValidEmail] = useState(false);
  const [isFormValidPassword, setIsFormValidPassword] = useState(false);

  // Memoize existing values lists
  const usernameExistList = useMemo(() => users.map((user) => user.username), [users]);
  const emailExistList = useMemo(
    () => users.filter((user) => user.email).map((user) => user.email!),
    [users],
  );

  // Memoize form validation state
  const isFormValid = useMemo(
    () => isFormValidUsername && isFormValidEmail && isFormValidPassword,
    [isFormValidUsername, isFormValidEmail, isFormValidPassword],
  );

  // Optimize fetchUsers with useCallback
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosClient.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data.result);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách user:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const navigate = useNavigate();

  const handleCancle = useCallback(() => {
    navigate('/ui/users');
  }, [navigate]);

  const handleAddUser = useCallback(async () => {
    if (!isFormValid) {
      console.log('invalid');
      return;
    }
    console.log('valid');

    try {
      setLoading(true);

      await axiosClient.post(
        '/users',
        {
          username: userName,
          password: password,
          firstName: firstName,
          lastName: lastName,
          email: email,
          gender: isMale ? 'MALE' : 'FEMALE',
          age: age === 0 || age > 100 ? 1 : age,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('add user successful');
      navigate('/ui/users', { state: { addUserSuccess: true } });
    } catch (error) {
      console.log(error);
      toast.error(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [isFormValid, userName, password, firstName, lastName, email, isMale, age, token, navigate]);

  const handleGenderToggle = useCallback(() => {
    setIsMale((prev) => !prev);
  }, []);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(Number(e.target.value));
  }, []);

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Add New User</h5>
      <p>
        Newly created users will be in the{' '}
        <strong style={{ color: 'var(--color-primary)' }}>USER</strong> group by default
      </p>
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex  flex-col">
                <InputText
                  type="text"
                  label="Username"
                  value={userName}
                  onChange={setUserName}
                  isEditable={true}
                  placeholder="Enter username"
                  minLength={3}
                  existingValues={usernameExistList}
                  onValidStateChange={setIsFormValidUsername}
                  required={true}
                  errorMessages={{
                    minLength: 'At least 3 character',
                    duplicate: 'This user is existed',
                    required: 'This field is required',
                  }}
                />
                <InputText
                  type="text"
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  isEditable={true}
                  placeholder="Enter First Name"
                  required={false}
                />
                <InputText
                  type="text"
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  isEditable={true}
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
                    onChange={(e) => setIsMale(e.target.checked)}
                  />
                  <Badge
                    color={isMale ? `lightsuccess` : 'lighterror'}
                    className={isMale ? `text-success` : 'lighterror'}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={handleGenderToggle}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{isMale ? `+` : '--'}</span>
                  </Badge>
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
                  isEditable={true}
                  placeholder="Enter email"
                  existingValues={emailExistList}
                  onValidStateChange={setIsFormValidEmail}
                  required={true}
                  errorMessages={{
                    required: 'This field is required',
                    duplicate: 'This email is existed',
                  }}
                  allowedDomains={['gmail.com']}
                />
                <div className="mt-5 mb-5">
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
                    className="form-control form-rounded-xl"
                    value={age}
                    onChange={handleAgeChange}
                  />
                </div>
                <div>
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
            <div className="col-span-12 flex gap-3">
              <Button color={'primary'} onClick={handleAddUser} disabled={!isFormValid}>
                Add
              </Button>
              <Button color={'error'} onClick={handleCancle}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserForm;
