import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const NavLinks = () => {
    const { isLogged } = useAuth();
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
            { isLogged && 
                <li>
                    <NavLink to="/profile" className={active}>
                        My Profile
                    </NavLink>
                </li>
            }
        </>
    )
}

export default NavLinks
