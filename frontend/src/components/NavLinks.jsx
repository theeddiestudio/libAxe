import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const NavLinks = () => {
    const { isLogged, isAdmin } = useAuth();
    const active = ({ isActive }) => (
        isActive ? "menu-active" : ""
    );

    return (
        <>
            <li>
                <NavLink to="/" end className={active}>
                    Catalog
                </NavLink>
            </li>
            { isLogged && !isAdmin && 
                <li>
                    <NavLink to="/profile" className={active}>
                        My Profile
                    </NavLink>
                </li>
            }
            { isLogged && isAdmin &&
                <li>
                    <NavLink to="/admin" className={active}>
                        Admin
                    </NavLink>
                </li>
            }
        </>
    )
}

export default NavLinks
