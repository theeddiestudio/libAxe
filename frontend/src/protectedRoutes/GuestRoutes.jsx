import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader"

const GuestRoutes = ({ children }) => {
    const { isLogged } = useAuth();

    if (isLogged === null) return <Loader full />
    return isLogged ? <Navigate to={"/profile"} replace /> : children;
}

export default GuestRoutes;