import axios from 'axios';

const BASE_URL = "http://localhost:3000/api/";

const loginApi = axios.create({
    baseURL: `${BASE_URL}login`,
    withCredentials: true
})

const userApi = axios.create({
    baseURL: `${BASE_URL}profile`,
    withCredentials: true
})

const booksApi = axios.create({
    baseURL: `${BASE_URL}books`,
    withCredentials: true
})

const loansApi = axios.create({
    baseURL: `${BASE_URL}loans`,
    withCredentials: true
})

const requestsApi = axios.create({
    baseURL: `${BASE_URL}requests`,
    withCredentials: true
})

const notificationsApi = axios.create({
    baseURL: `${BASE_URL}notifications`,
    withCredentials: true
})

const STREAM_URL = `${BASE_URL}notifications/stream`

export {loginApi, userApi, booksApi, loansApi, requestsApi, notificationsApi, STREAM_URL};