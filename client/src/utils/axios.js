import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "http://172.20.10.3:5000/",
  baseURL: "http://192.168.1.244:5000/",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
