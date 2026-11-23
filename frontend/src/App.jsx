import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Profile from "./pages/Profile.jsx"
import Admin from "./pages/Admin.jsx"
import Show from "./pages/Show.jsx"
import NotFound from "./pages/NotFound.jsx"
import GuestRoutes from "./protectedRoutes/GuestRoutes.jsx"
import UnauthorizedRoutes from "./protectedRoutes/UnauthorizedRoutes.jsx"
import { Routes, Route } from "react-router"

const App = () => {
  return (
    <div className="relative h-full w-full">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <GuestRoutes>
            <Login />
          </GuestRoutes>
        } />
        <Route path="/profile" element={
          <UnauthorizedRoutes role='user'>
            <Profile />
          </UnauthorizedRoutes>
        } />
        <Route path="/admin" element={
          <UnauthorizedRoutes role='admin'>
            <Admin />
          </UnauthorizedRoutes>
        } />
        <Route path="/books/:id" element={<Show />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
