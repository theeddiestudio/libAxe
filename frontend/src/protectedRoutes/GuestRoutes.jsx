import { Navigate } from "react-router";
import Loader from "../components/Loader"
import { useAuth } from "../context/AuthContext.jsx";
import { homeFor } from "../lib/utils.js";

const GuestRoutes = ({ children }) => {
    const { isLogged, user } = useAuth();

    if (isLogged === null) return <Loader full />
    return isLogged ? <Navigate to={homeFor(user)} replace /> : children;
}

export default GuestRoutes;