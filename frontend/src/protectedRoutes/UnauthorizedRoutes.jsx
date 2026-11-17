import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader"

const UnauthorizedRoutes = ({ children }) => {
    const { isLogged } = useAuth();

    if (isLogged === null) return <Loader full />
    return isLogged ? children :<Navigate to={"/login"} replace />;
}

export default UnauthorizedRoutes;