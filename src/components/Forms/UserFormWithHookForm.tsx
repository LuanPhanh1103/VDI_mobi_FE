import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label, TextInput, Button, Badge, Select } from 'flowbite-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import axiosClient from 'src/lib/api/axiosClient';
import { useUser } from 'src/hooks/useUser';
import Spinner from 'src/components/Spinner/Spinner';
import { userSchema, UserFormData } from 'src/schemas/userSchema';

const UserFormWithHookForm = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      age: 1,
      gender: 'MALE',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      await axiosClient.post(
        '/users',
        {
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender,
          age: data.age,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success('User created successfully!');
      navigate('/users', { state: { addUserSuccess: true } });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    navigate('/users');
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Add New User (React Hook Form + Zod)</h5>
      <p>
        Newly created users will be in the{' '}
        <strong style={{ color: 'var(--color-primary)' }}>USER</strong> group by default
      </p>
      
      <div className="mt-6 relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/50 dark:bg-darkgray/50 flex items-center justify-center z-10 rounded-lg">
            <Spinner />
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className={`${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
          <div className="grid grid-cols-12 gap-30">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                {/* Username */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="username" value="Username" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="form-control form-rounded-xl"
                    {...register('username')}
                    color={errors.username ? 'failure' : 'gray'}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="firstName" value="First Name" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    className="form-control form-rounded-xl"
                    {...register('firstName')}
                    color={errors.firstName ? 'failure' : 'gray'}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="lastName" value="Last Name" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    className="form-control form-rounded-xl"
                    {...register('lastName')}
                    color={errors.lastName ? 'failure' : 'gray'}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                {/* Email */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="email" value="Email" />
                    <span className="text-red-500 ml-1">*</span>
                    <Badge color="info" className="ml-2">Gmail only</Badge>
                  </div>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    className="form-control form-rounded-xl"
                    {...register('email')}
                    color={errors.email ? 'failure' : 'gray'}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <div className="mb-2 flex items-center">
                    <Label htmlFor="age" value="Age" />
                    <span className="text-red-500 ml-1">*</span>
                    <p className="check-desc ml-2">(From 1 to 100)</p>
                  </div>
                  <TextInput
                    id="age"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Age"
                    className="form-control form-rounded-xl"
                    {...register('age', { valueAsNumber: true })}
                    color={errors.age ? 'failure' : 'gray'}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="gender" value="Gender" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <Select
                    id="gender"
                    className="select-rounded"
                    {...register('gender')}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </Select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12">
              <div className="grid grid-cols-12 gap-30">
                {/* Password */}
                <div className="lg:col-span-6 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="password" value="Password" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="form-control form-rounded-xl"
                    {...register('password')}
                    color={errors.password ? 'failure' : 'gray'}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="lg:col-span-6 col-span-12">
                  <div className="mb-2 block">
                    <Label htmlFor="confirmPassword" value="Confirm Password" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    className="form-control form-rounded-xl"
                    {...register('confirmPassword')}
                    color={errors.confirmPassword ? 'failure' : 'gray'}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="col-span-12 flex gap-3">
              <Button 
                type="submit" 
                color="primary" 
                disabled={!isValid || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Creating...' : 'Add User'}
              </Button>
              <Button 
                type="button" 
                color="error" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormWithHookForm;
