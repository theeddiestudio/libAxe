import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { closeUserStreams } from '../lib/sse.js';

const checkLogin = (req,res) => {
    try {
        if(req.session.userId) {
            return res.status(200).json({isLogged: true});
        } else {
            return res.status(200).json({isLogged: false});
        }
    } catch (error) {
        res.status(500).json({message: "Error during login checking."})
    }
}

const loginUser = async (req,res) => {
    try {
        const {identifier, password} = req.body;

        if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier.trim() || !password) {
            return res.status(400).json({ message: "Username or email and password are required." });
        }

        const trimmed = identifier.trim();
        const query = trimmed.includes('@')
            ? { email: trimmed.toLowerCase()}
            : { username: trimmed};

        const user = await User.findOne(query).select('+password');

        if(!user) {
            return res.status(404).json({message: "User not found"})
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(403).json({message: "Password Incorrect"});
        }

        req.session.userId = user._id;
        res.status(201).json({message: "User logged in"});
    } catch (error) {
        res.status(500).json({message: "Error during login."})
    }
}

const logoutUser = async (req, res) => {
    try {
        const userId = req.session.userId;
        req.session.destroy((error) => {
            if(error) {
                console.log("Error while logout", error);
                return res.status(500).json({message: "Could not logout"});
            }
            closeUserStreams(userId);
            res.clearCookie('connect.sid');
            return res.status(200).json({message: "User logged out successfully"});
        })
    } catch (error) {
        res.status(500).json({ message: 'Error during logout.'})
    }
}

const registerUser = async (req,res) => {
    try {
        const {username, email, password, role} = req.body;

        const trimmedUsername = username.trim();        
        const trimmedEmail = email.trim().toLowerCase();        

        const usernameDB = await User.findOne({username: trimmedUsername});
        const emailDB = await User.findOne({email: trimmedEmail});
        
        if(emailDB) {
            return res.status(400).json({ message: 'Email already registered.' });
        }
        
        if(usernameDB) {
            return res.status(400).json({ message: 'Username already taken.' });
        }
        
        const hashPw = await bcrypt.hash(password, 12);
        const newUser = new User({
            username: trimmedUsername,
            email: trimmedEmail,
            password: hashPw,
            role
        });

        await newUser.save();
        req.session.userId = newUser._id;
        return res.status(201).json({message: "User Registered"});
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'User already exists.' });
        res.status(500).json({message: 'Error during registration.'});
    }
}

export {loginUser, logoutUser, registerUser , checkLogin};