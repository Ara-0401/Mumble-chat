import axios from "axios"

const instance= axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
    withCredentials:true
})

let authToken=null

 export  function setAuthToken (token){

    authToken= token
}

// instance.interceptors.request.use((config)=>{
//     if(!authToken) return config

//    config.headers.Authorization= `Bearer ${authToken}`
//    return config

// })

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken")
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    response=>response,

    async error=>{
        const originalRequest=error.config

       if(
    error.response &&
    error.response.status === 401 &&
    !originalRequest._retry &&
    originalRequest.url !== "/api/auth/refreshToken"
){     originalRequest._retry=true
            const res= await instance.post("/api/auth/refreshToken")

            const newAccessToken=res.data.accessToken

            localStorage.setItem("accessToken",newAccessToken)

            originalRequest.headers.Authorization=`Bearer ${newAccessToken}`

            return instance(originalRequest)
        }
        return Promise.reject(error)
    }
)

export default instance