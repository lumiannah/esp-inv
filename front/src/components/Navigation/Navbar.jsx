import { useLocation, Link } from 'react-router-dom'
import '../../styles/nav.css'

function Navbar() {
  const location = useLocation()

  const isActivePage = (page) => location.pathname.split('/')[1] === page

  return (
    <nav>
      <Link to="/" className={'nav-el hoverable ' + (isActivePage('') ? 'active' : '')}>
        Home
      </Link>
      <Link to="/devices" className={'nav-el hoverable ' + (isActivePage('devices') ? 'active' : '')}>
        Devices
      </Link>
      <Link to="/user" className={'nav-el hoverable ' + (isActivePage('user') ? 'active' : '')}>
        User
      </Link>
    </nav>
  )
}

export default Navbar
