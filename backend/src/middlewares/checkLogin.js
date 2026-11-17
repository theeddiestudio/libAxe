import User from '../models/User.js';

const isLogged = async (req, res, next) => {
    if(!req.session.userId) {
        return res.status(401).json({message: "User has not logged in"});
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({message: "No such user found"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error authenticating user" , error);
        next(error);
    }
}

const isNotLogged = async (req, res, next) => {
    if(req.session.userId) {
        return res.status(401).json({message: "User already logged in"});
    }

    next();
}

const validateRegistration = (req, res, next) => {
    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({message: "All fields are required."})
    }

    const usernameRegex = /^[A-Za-z][A-Za-z0-9_.-]{4,19}$/;
    if (!usernameRegex.test(username.trim())) {
        return res.status(400).json({message: "Enter a valid username."});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email.trim())) {
        return res.status(400).json({message: "Enter a valid email address."})
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,16}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: "Password must be 8-16 characters with a capital letter and a number." 
        });
    }

    next();
}

export {isLogged , isNotLogged, validateRegistration};