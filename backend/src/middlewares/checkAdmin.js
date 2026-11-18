import dotenv from 'dotenv';

dotenv.config();

const checkUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        next();
    } else {
        return res.status(403).json({ message: "Not Allowed. Users only."});
    }
}

const checkAdmin = (req,res,next) => {
    if(req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
}

const checkAdminPW = (req,res,next) => {
    try {
        const { role, adminPassword } = req.body;
        if(!role || role === 'user') {
            req.body.role = 'user';
            return next();
        }

        if(role || role === 'admin') {
            const storedAdminPw = process.env.ADMIN_PW;

            if (!adminPassword || adminPassword !== storedAdminPw) {
                return res.status(403).json({ message: 'Invalid admin password. Authorization failed.' });
            }

            req.body.role = 'admin';
            return next();
        }

        req.body.role = 'user';
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error during admin verification.' })
    }
}

export {checkUser, checkAdmin, checkAdminPW};