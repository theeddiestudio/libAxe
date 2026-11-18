import User from "../models/User.js";

const MAX_QUERY_LENGTH = 50;
const MAX_WORDS = 5;

const escapeRegx = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchFilter = (text, fields) => {
    if (typeof text !== 'string') return null;

    const words = text
        .trim()
        .slice(0, MAX_QUERY_LENGTH)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, MAX_WORDS);
    
    if (words.length === 0) return null;

    return {
        $and: words.map((word) => {
            const regex = new RegExp(escapeRegx(word), 'i');
            return { $or: fields.map((f) => ({ [f]: regex}))};
        })
    }
}

const matchUsers = async (text) => {
    const userFilter = buildSearchFilter(text, ['username', 'email']);
    if(!userFilter) return null;

    const ids = await User.find(userFilter).distinct('_id');
    return {$in: ids};
}

export {buildSearchFilter, matchUsers};