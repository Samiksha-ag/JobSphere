import { useSelector } from "react-redux";
import AdminScreen from "../../AdminScreen";
import Login from "./Login";
import ProviderScreen from "../../ProviderScreen";
import JobSeekerScreen from "../../JobSeekerScreen";
import jwtDecode from "jwt-decode";

function Mdashboard() {
  // const dispatch = useDispatch();
  const selectauthToken = (rootstate) => rootstate.authToken;

  const authToken = localStorage.getItem("token");
  const redToken = useSelector(selectauthToken);

  // if(redToken == {}){
  //   if(authToken){
  //     dispatch({type:"SETAUTHTOKEN",data:authToken});
  //   }
  // }

  // if (authToken !== null && redAuthToken == {}) {
  //   dispatch({ type: "SETAUTHTOKEN", data: authToken });
  // }

  if (authToken) {
    try {
      const redAuthToken = jwtDecode(authToken);
      // console.log("lol", decoded);
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
