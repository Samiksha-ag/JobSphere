import jwtDecode from "jwt-decode";

function authTokenReducer(state = {}, action) {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
    case "SETAUTHTOKEN":
      // console.log("in reducer setauthtoken");
      // console.log(action.data);
      try {
        const decoded = jwtDecode(action.data);
        localStorage.setItem("token", action.data);
        return { ...decoded };
      } catch (err) {
        // Malformed token — do not persist it; keep state cleared
        localStorage.removeItem("token");
        return {};
      }

    case "CLEARAUTHTOKEN":
      localStorage.removeItem("token");
      return {};

    // Do something here based on the different types of actions
    default:
      // console.log("in reducer default");
      return { ...state };
  }
}
export default authTokenReducer;
