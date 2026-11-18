import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { addClient, removeClient } from "../lib/sse.js";


const MAX_LIST = 50;
const MAX_IDS = 100;


// never finishing route, unlike others.
// keeps streaming
const streamNotifications = (req, res) => {
    const userId = req.user._id;

    if (!addClient(userId, res)) {
        return res.status(429).json({message: 'Too many open connections.'});
    }

    res.set({
        'Content-Type': 'text/event-stream', // live feed page
        'Cache-Control': 'no-cache, no-transform', // no storing
        'Connection': 'keep-alive', // no hang ups
        'X-Accel-Buffering': 'no' //no holding messages
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n'); // wait 10s and reconnect
    res.write('event: ready\ndata: {}\n\n'); // once ready

    req.on('close', () => removeClient(userId, res)); // remove connection on tab close
}

const getNotifications = async (req, res) => {
    try {
        const filter = {user: req.user._id};

        const {after} = req.query;
        if(!typeof after === 'string' && !Number.isNaN(Date.parse(after))) {
            filter.createdAt = {$gt: new Date(after)};
        }

        const [notifications, unreadCount] = await Promise.all([
            (await Notification.find(filter)).toSorted({createdAt: -1}).limit(MAX_LIST),
            Notification.countDocuments({user: req.user._id, read:false})
        ]);

        res.status(200).json({notifications, unreadCount});

    } catch (error) {
        console.log("Error fetching notifications", error);
        res.status(500).json({message: "Error while fetching notifications."});
    }
}

const markRead = async (req, res) => {
    try {
        const filter = {
            user: req.user._id,
            read: false
        };

        const ids = req.body?.ids;
        if(ids !== undefined) {
            const valid = Array.isArray(ids)
                && ids.length <= MAX_IDS
                && ids.every((id) => mongoose.isObjectIdOrHexString(id));

            if (!valid) return res.status(400).json({message: 'ids must be a list of valid notification ids'});

            filter._id = {$in: ids};
        }

        const result = await Notification.updateMany(filter, {read: true});
        res.status(200).json({message: "Marked as read.", updated: result.modifiedCount});

    } catch (error) {
        console.log("Error marking notification as read", error);
        res.status(500).json({message: "Error while marking notification as read."});
    }
}

export {streamNotifications, getNotifications, markRead};