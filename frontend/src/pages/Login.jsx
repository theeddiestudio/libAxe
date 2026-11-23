import { useState } from "react";
import { Link, useNavigate } from 'react-router';
import { ArrowLeftIcon, BookOpenIcon, LockIcon, MailIcon, ShieldCheckIcon, UserIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {loginApi} from '../lib/axios'
import {useAuth} from '../context/AuthContext';
import { getErrorMessage, validatePassword, validateUsername, PASSWORD_HINT, USERNAME_HINT, homeFor } from "../lib/utils";
import ToggleTheme from "../components/ToggleTheme"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {

    const [isNew, setIsNew] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    const { refreshAuth } = useAuth();
    const navigate = useNavigate();
    
    const validate = () => {
        if (!email.trim() || !password || (isNew && !username.trim())) {
            toast.error("All fields are required");
            return false;
        }
        
        if (isNew) {    
            if (!EMAIL_REGEX.test(email.trim())) {
                toast.error("Please enter a valid email address");
                return false;
            }

            const usernameError = validateUsername(username.trim());
            if (usernameError) {
                toast.error(usernameError);
                return false;
            }

            const passwordError = validatePassword(password);
            if (passwordError) {
                toast.error(passwordError);
                return false;
            }
            if (isAdmin && !adminPassword.trim()) {
                toast.error("Admin password required for admins");
                setIsAdmin(false);
                return false;
            }
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || !validate()) return;

        setLoading(true);
        try {
            if (isNew) {
                await loginApi.post("/", {
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    role: isAdmin ? "admin" : "user",
                    adminPassword : isAdmin ? adminPassword : undefined
                });
                toast.success("Registration successful")
            } else {
                await loginApi.put("/", {
                    identifier: email.trim(),
                    password
                })
                toast.success("Login Successful")
            }
            const loggedUser = await refreshAuth();
            navigate(homeFor(loggedUser), {replace: true});
        } catch (error) {
            console.log(isNew ? "Error on register:" : "Error on login", error);

            if(error.response?.status === 429) {
                toast.error("Too many requests", {duration: 4000, icon: "💀"});
            } else if (!error.response) {
                toast.error("Cannot reach the server");
            } else {
                toast.error(getErrorMessage(error, isNew ? "Registration failed" : "Login failed"));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-base-200">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4">
                <Link to={"/"} className="btn btn-ghost btn-sm">
                    <ArrowLeftIcon className="size-4" />
                    Back to Catalog
                </Link>
                <ToggleTheme />
            </div>

            <div className="mx-auto max-w-md px-4 py-8">
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">

                        <div className="flex flex-col items-center text-center">
                            <div className="rounded-xl bg-primary/10 p-3 mb-2">
                                <BookOpenIcon className="size-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-bold">
                                {isNew ? "Create your account" : "Welcome back"}
                            </h1>
                            <p className="text-sm opacity-70">
                                {isNew ? "Register to borrow books" : "Sign in to borrow and manage books."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">

                            {isNew && (
                                <div className="flex flex-col gap-1">
                                    <label className="input w-full">
                                        <UserIcon className="size-4 opacity-60" />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </label>
                                    {isNew && <p className="text-xs ml-1 opacity-60">{USERNAME_HINT}</p>}
                                </div>
                            )}

                            <label className="input w-full">
                                <MailIcon className="size-4 opacity-60" />
                                <input
                                    type={isNew ? "email" : "text"}
                                    placeholder={isNew ? "Email" : "Username or Email"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                            
                            <div className="flex flex-col gap-1">
                                <label className="input w-full">
                                    <LockIcon className="size-4 opacity-60" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="text-base-content/60 hover:text-base-content focus:outline-none"
                                        aria-label="Toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)} 
                                    >
                                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                    </button>
                                </label>
                                {isNew && <p className="text-xs ml-1 opacity-60">{PASSWORD_HINT}</p>}
                            </div>

                            {isNew && (
                                <>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                                        <input
                                            type="checkbox" 
                                            className="checkbox checkbox-primary checkbox-sm"
                                            checked={isAdmin}
                                            onChange={(e) => setIsAdmin(e.target.checked)}
                                        />
                                        Register as Admin
                                    </label>

                                    {isAdmin && (
                                        <label className="input w-full">
                                            <ShieldCheckIcon className="size-4 opacity-60" />
                                            <input
                                                type={showAdminPassword ? "text" : "password"}
                                                placeholder="Admin Password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="text-base-content/60 hover:text-base-content focus:outline-none"
                                                aria-label="Toggle password visibility"
                                                onClick={() => setShowAdminPassword(!showAdminPassword)} 
                                            >
                                                {showAdminPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                            </button>
                                        </label>
                                    )}
                                </>
                            )}

                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading
                                    ? <span className="loading loading-spinner loading-sm"></span>
                                    : isNew ? "Register" : "Login"
                                }
                            </button>
                        </form>

                        <div className="divider my-1"></div>

                        <label className="flex cursor-pointer items-center justify-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={isNew}
                                onChange={(e) => setIsNew(e.target.checked)}
                            />
                            New User?
                        </label>

                        <p className="text-center text-xs mt-2 opacity-60">
                            There is no password recovery, so make sure you remember your password.
                        </p>

                    </div>
                </div>
            </div>

        </div>
    )

}

export default Login;