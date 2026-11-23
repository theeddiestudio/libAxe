import { Link } from "react-router"
import Navbar from "../components/Navbar"
const NotFound = () => {
    return (
        <>
        <Navbar />
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-base-200 px-4 text-center">
                <h1 className="text-6xl font-bold text-primary">404</h1>
                <p className="opacity-70">This page does not exist.</p>
            </div>
        </>
    )
}

export default NotFound
