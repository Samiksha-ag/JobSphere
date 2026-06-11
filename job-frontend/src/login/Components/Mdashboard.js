import { useSelector } from "react-redux";
import AdminScreen from "../../AdminScreen";
import Login from "./Login";
import ProviderScreen from "../../ProviderScreen";
import JobSeekerScreen from "../../JobSeekerScreen";
import jwtDecode from "jwt-decode";

function Mdashboard() {
  // Subscribe to the auth token in the store so this component re-renders
  // when the user logs in or out.
  useSelector((state) => state.authToken);

  const authToken = localStorage.getItem("token");

  if (authToken) {
    try {
      const redAuthToken = jwtDecode(authToken);
      if (redAuthToken.role === "Admin") {
        return <AdminScreen />;
      }
      if (redAuthToken.role === "Job Provider") {
        return <ProviderScreen />;
      }
      if (redAuthToken.role === "User") {
        return <JobSeekerScreen />;
      }
    } catch (err) {
      // Malformed/corrupted token in storage — clear it and fall back to Login
      localStorage.removeItem("token");
    }
  }
  return (
    <>
      <Login />
    </>
  );
}

export default Mdashboard;
