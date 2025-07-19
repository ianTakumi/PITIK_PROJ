import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.245:5000/",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
