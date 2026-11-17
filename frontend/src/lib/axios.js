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

export {loginApi, userApi, booksApi};