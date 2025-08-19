import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label, TextInput, Select, Button } from "flowbite-react";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { basicFormSchema, BasicFormData } from 'src/schemas/basicFormSchema';
import Spinner from 'src/components/Spinner/Spinner';

const BasicForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<BasicFormData>({
    resolver: zodResolver(basicFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      country: '',
      state: '',
      city: '',
    },
  });

  const onSubmit = async (data: BasicFormData) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form data:', data);
      toast.success('Form submitted successfully!');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Form (React Hook Form + Zod)</h5>
      
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
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Your Name" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    className="form-control form-rounded-xl"
                    {...register('name')}
                    color={errors.name ? 'failure' : 'gray'}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="email1" value="Your email" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="email1"
                    type="email"
                    placeholder="name@matdash.com"
                    className="form-control form-rounded-xl"
                    {...register('email')}
                    color={errors.email ? 'failure' : 'gray'}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="password1" value="Your password" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <TextInput
                    id="password1"
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
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="countries1" value="Country" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <Select 
                    id="countries1" 
                    className="select-rounded"
                    {...register('country')}
                    color={errors.country ? 'failure' : 'gray'}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Canada">Canada</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                  </Select>
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="countries2" value="State" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <Select 
                    id="countries2" 
                    className="select-rounded"
                    {...register('state')}
                    color={errors.state ? 'failure' : 'gray'}
                  >
                    <option value="">Select State</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                  </Select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="countries3" value="City" />
                    <span className="text-red-500 ml-1">*</span>
                  </div>
                  <Select 
                    id="countries3" 
                    className="select-rounded"
                    {...register('city')}
                    color={errors.city ? 'failure' : 'gray'}
                  >
                    <option value="">Select City</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Ahemedabad">Ahemedabad</option>
                  </Select>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-12 flex gap-3">
              <Button 
                type="submit" 
                color="primary" 
                disabled={!isValid || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button 
                type="button" 
                color="error" 
                onClick={() => reset()}
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

export default BasicForm;
