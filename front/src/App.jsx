import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom'
import Navbar from './components/Navigation/Navbar'
import { AuthProvider, protectedRouteLoader } from './components/Auth/AuthProvider'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import User, { userLoader } from './pages/User'
import PageNotFound from './pages/PageNotFound'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

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
      <Route index element={<Home />}></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* protected */}
      <Route loader={protectedRouteLoader} errorElement={<Navigate to="/login" />}>
        <Route path="/user" element={<User />} loader={userLoader} />
      </Route>

      {/* page not found */}
      <Route path="*" element={<PageNotFound />} />
    </Route>
  )
)

function App() {
  return <RouterProvider router={router} />
}

export default App
