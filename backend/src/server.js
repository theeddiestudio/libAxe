import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/database.js';
import bookRoutes from './routes/books.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import reqRoutes from './routes/request.routes.js'
import loanRoutes from './routes/loan.routes.js';
import notifRoutes from './routes/notification.routes.js'
import rateLimiter from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.json());
app.use(rateLimiter);

app.use('/api/books', bookRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/requests', reqRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/login', authRoutes);

app.use((_, res) => {
    res.status(404).json({message: 'Route not found.'});
})


app.use((error, _, res, next) => {
    if(res.headerSent) return next(error);

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body is not valid JSON.'});
    }

    console.log("Unhandled error", error);
    res.status(500).json({message: 'Something went wrong on the server.'});
})

connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    })
})