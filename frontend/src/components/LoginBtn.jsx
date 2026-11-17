import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { LogInIcon, LogOutIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginApi } from '../lib/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

const LoginBtn = ({ type }) => {
  
    const [loading, setLoading] = useState(false);

    const {clearAuth} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (loading) return;
        if (!window.confirm("Are you sure you want to logout?")) return;
        setLoading(true);

        try {
            await loginApi.delete('/');
            clearAuth();
            toast.success("Logout Successful");
            navigate("/login");
        } catch (error) {
            console.log("Eror on logout:" , error);
            if (error.response?.status === 429) {
                toast.error("Too many requests", { duration: 4000, icon: "💀" });
            } else {
                toast.error("Could not logout!");
            }
        } finally {
            setLoading(false);
        }

    }

    if ( type === 'out') return (
        <button className='btn btn-outline btn-sm' onClick={handleLogout} disabled={loading} >
            <LogOutIcon className='size-4' />
            <span>{loading ? "Loading..." : "Logout"}</span>
        </button>
    )

    return (
        <Link to="/login" className='btn btn-primary btn-sm'>
            <LogInIcon className='size-4' />
            <span>Login</span>
        </Link>
    )
}

export default LoginBtn
