import axios from "axios";

// Global response interceptor: on 401 (invalid/expired token),
// clear the stale token and send the user back to login.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/Login") {
        window.location.href = "/Login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
