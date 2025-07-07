// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayoutWrapper = Loadable(lazy(() => import('../layouts/full/FullLayoutWrapper')));
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Home
const HomePage = Loadable(lazy(() => import('../views/home/Home')));

// Profile
const Profile = Loadable(lazy(() => import('../views/details/Profile')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// management
const Users = Loadable(lazy(() => import('../views/tables/User')));
const Groups = Loadable(lazy(() => import('../views/tables/Groups')));
const Desktops = Loadable(lazy(() => import('../views/tables/Desktop')));
const MyDesktops = Loadable(lazy(() => import('../views/tables/MyDesktop')));

//add form
const AddUserForm = Loadable(lazy(() => import('../views/addForm/AddUserForm')));
const AddGroupForm = Loadable(lazy(() => import('../views/addForm/AddGroupForm')));
const AddDesktopForm = Loadable(lazy(() => import('../views/addForm/AddDesktopForm')));

//details
const UserDetails = Loadable(lazy(() => import('../views/details/UserDetail')));
const DesktopDetails = Loadable(lazy(() => import('../views/details/DesktopDetails')));
const GroupDetails = Loadable(lazy(() => import('../views/details/GroupDetails')));

// icons
const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const Router = [
  {
    path: '/',
    element: <FullLayoutWrapper />,
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <HomePage /> },

          { path: '/ui/:username/profile', exact: true, element: <Profile /> },

          { path: '/ui/dashboard', exact: true, element: <Dashboard /> },

          { path: '/ui/desktops', exact: true, element: <Desktops /> },
          { path: '/ui/myDesktops', exact: true, element: <MyDesktops /> },
          { path: '/ui/desktops/:desktopName', exact: true, element: <DesktopDetails /> },
          { path: '/ui/myDesktops/:desktopName', exact: true, element: <DesktopDetails /> },
          { path: '/ui/desktops/addDesktop', exact: true, element: <AddDesktopForm /> },

          { path: '/ui/users', exact: true, element: <Users /> },
          { path: '/ui/users/:username', exact: true, element: <UserDetails /> },
          { path: '/ui/users/addUser', exact: true, element: <AddUserForm /> },

          { path: '/ui/groups', exact: true, element: <Groups /> },
          { path: '/ui/groups/:groupName', exact: true, element: <GroupDetails /> },
          { path: '/ui/groups/addGroup', exact: true, element: <AddGroupForm /> },

          { path: '/icons/solar', exact: true, element: <Solar /> },
          { path: '*', element: <Navigate to="/auth/404" /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router, { basename: '/MobifoneVDI' });
export default router;
