import axios from "axios"

const BASE_URL = 'http://127.0.0.1:8000/api/'
const LOGIN_URL = `${BASE_URL}token/`
const REFRESH_URL = `${BASE_URL}token/refresh/`
const NOTES_URL = `${BASE_URL}notes/`
const LOGOUT_URL = `${BASE_URL}logout/`
const AUTH_URL = `${BASE_URL}authenticated/`
const REGISTER_URL = `${BASE_URL}register/`
const MAPVIEW_URL = `${BASE_URL}mapview/`
const XGB_RESULTS_URL =  'http://127.0.0.1:8000/api/xgb-results/'
const IMAGE_RESULTS_URL = `${BASE_URL}image-results/`
const VALIDATE_POACHER_URL = `${BASE_URL}validate-poacher/`
const HISTORY_URL = `${BASE_URL}history/`
const USERS_URL = `${BASE_URL}users/`
const ADMIN_NOTIFICATION = `${BASE_URL}admin-notification/`
const RANGER_NOTIFICATION = `${BASE_URL}ranger-notification/`

export   const login = async (username, password) => {
    const response = await axios.post(LOGIN_URL,
        {username:username, password:password},
        { withCredentials: true}
    )
    return response.data
}

export const refresh_token = async () => {
    try {
        await axios.post(REFRESH_URL,
        {},
        {withCredentials: true}
    )
    return true
    } catch (error){
        return false
    }
}

export const get_notes = async() =>{
    try {
         const response = await axios.get(
            NOTES_URL,
            {withCredentials: true}
        )
        return response.data
    } 
    catch (error) {
        return call_refresh(error, axios.get(NOTES_URL, 
            { withCredentials: true }))
    }
}

const call_refresh = async (error, func) =>{
    if (error.response && error.response.status === 401){
        const tokenRefreshed = await refresh_token();
        if (tokenRefreshed){
            const retryResponse = await func();
            return retryResponse.data
        }
    }
    return false
}
export const logout = async () => {
    try{
        await axios.post(LOGOUT_URL,
            {},
            {withCredentials: true}
        )
        return true
    }
    catch (error) {
        return false
    }
    
}
export const is_authenticated = async () =>{
    try {
        await axios.post(AUTH_URL,
             {},
             {withCredentials: true})
        return true
    }
    catch (error) {
        return false
    }
}
export const register = async (username, email,  password) =>{
        const response = axios.post(REGISTER_URL,
        {username:username, email:email, password:password},
        {withCredentials: true}
    )
    return response.data
}
export const mapview = async() =>{
    try {
        const response = await axios.get(MAPVIEW_URL
    )
    return response.data
    } catch (error) {
        return call_refresh(error, ()=> 
        axios.get(MAPVIEW_URL)
    )
}
    
}

export const getXgbResults = async () => {
    const response = await axios.get(XGB_RESULTS_URL);
    return response.data;
}

export const getImageResults = async () => {
    const response = await axios.get(IMAGE_RESULTS_URL);
    return response.data;
}
export const validatePoacher = async (payload) => {
    const response = await axios.post(VALIDATE_POACHER_URL, payload)
    return response.data
}
export async function getLastPoachingDetections() {
  const response = await fetch(HISTORY_URL);
  if (!response.ok) throw new Error('Failed to fetch poaching history');
  return await response.json();
}
export const getUsers = async() => {
    const response = await fetch(USERS_URL)
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export const createUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

export const updateUser = async (id, userData) => {
  const res = await fetch(`${USERS_URL}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return true;
};

export const adminNot = async () => {
  const res = await fetch(ADMIN_NOTIFICATION);
  if (!res.ok) throw new Error("Failed to fetch admin notifications");
  return await res.json();
};

export const rangerNot = async () => {
    const res =  await fetch(RANGER_NOTIFICATION);
    if (!res.ok) throw new Error('Failed to fetch notification');
    return await res.json();
}