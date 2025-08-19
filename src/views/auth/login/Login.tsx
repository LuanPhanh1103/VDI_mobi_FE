import FullLogo from 'src/components/Layouts/full/shared/logo/FullLogo';
import Mbflogo from 'src/assets/images/logos/MobiFone_logo.png';
import AuthLogin from '../authforms/AuthLogin';

const gradientStyle = {
  background:
    'linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))',
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',
  height: '100vh',
};

const Login = () => {
  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen">
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full md:w-96 border-none">
          <div className="flex flex-col gap-2 p-0 w-full">
            <img src={Mbflogo} alt="Mobifone" style={{ maxWidth: '28%' }} />
            <div className="mx-auto mt-5">
              <FullLogo />
            </div>
            <p className="text-center mb-5 mt-5">Login to VDI - CloudDC</p>
            <AuthLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
