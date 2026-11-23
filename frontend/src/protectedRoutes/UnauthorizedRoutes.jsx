import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader"

const UnauthorizedRoutes = ({ children, role }) => {
    const { isLogged, user } = useAuth();

    if (isLogged === null) return <Loader full />
    if(!isLogged) return <Navigate to={"/login"} replace />
    if(role && user && user.role !== role) return <Navigate to={"/"} replace />
    return children;
}

export default UnauthorizedRoutes;