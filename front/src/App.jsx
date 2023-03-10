import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navigation/Navbar'
import { AuthProvider, protectedRouteLoader } from './components/Auth/AuthProvider'
import { deviceDataLoader, userDataLoader, userDevicesLoader } from './loaders/dataLoaders'
import { lazyPageLoader } from './loaders/lazyPageLoader'

const Root = () => {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </AuthProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      {/* public routes */}
      <Route index element={lazyPageLoader('Home')}></Route>
      <Route path="/login" element={lazyPageLoader('Login')} />
      <Route path="/register" element={lazyPageLoader('Register')} />
      <Route path="/forgot-password" element={lazyPageLoader('ForgotPassword')} />
      <Route path="/reset-password" element={lazyPageLoader('ResetPassword')} />

      {/* protected */}
      <Route loader={protectedRouteLoader} errorElement={lazyPageLoader('Login', { sessionExpired: true })}>
        <Route path="/devices" element={lazyPageLoader('Devices')} loader={userDevicesLoader} />
        <Route
          path="/devices/:id"
          element={lazyPageLoader('DeviceSettings')}
          loader={deviceDataLoader}
          errorElement={lazyPageLoader('PageNotFound')}
        />
        <Route path="/user" element={lazyPageLoader('User')} loader={userDataLoader} />
      </Route>

      {/* page not found */}
      <Route path="*" element={lazyPageLoader('PageNotFound')} />
    </Route>
  )
)

function App() {
  return <RouterProvider router={router} />
}

export default App
