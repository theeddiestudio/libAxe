import { Link } from "react-router";
import { BookOpenIcon, MenuIcon, UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NavLinks from "./NavLinks.jsx";
import ToggleTheme from "./ToggleTheme.jsx";
import LoginBtn from "./LoginBtn.jsx";

const Navbar = () => {
  const {isLogged, user} = useAuth();

  return (
    <div className="bg-base-100 borber-b border-base-content/10 sticky top-0 z-30">
      <div className="navbar mx-auto max-w-6xl px-4">

        {/* Left side */}
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <BookOpenIcon className="size-6 mt-0.5 text-primary" />
            <span>LibAxe</span>
          </Link>
        </div>

        {/* Center side */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal gap-1">
            <NavLinks />
          </ul>
        </div>

        {/* Right side */}
        <div className="navbar-end gap-2">
          <ToggleTheme />
          {isLogged && user && (
            <Link to='/profile' className="hidden md:flex items-center gap-w text-sm">
              <UserIcon className="size-4" />
              <span className="max-w-28 truncate">{user.username}</span>
            </Link>
          )}
          <div className="hidden md:block">
            {isLogged ? <LoginBtn type="out" /> : <LoginBtn />}
          </div>
          <div className="dropdown dropdown-end md:hidden">
            <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open Menu">
              <MenuIcon className="size-5" />
            </button>
            <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-40 mt-3 w-52 p-2 shadow">
              <NavLinks />
              <li className="mt-2">
                {isLogged ? <LoginBtn type="out" /> : <LoginBtn />}
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Navbar;