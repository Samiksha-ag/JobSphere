import React from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import jwtDecode from "jwt-decode";

const Navigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authToken = localStorage.getItem("token");
  const redAuthToken = jwtDecode(authToken);

  const logoutHandler = () => {
    dispatch({ type: "CLEARAUTHTOKEN" });
    navigate("/", { replace: true });
  };

  const styles = {
    navbar: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "65px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
    },
    logoText: {
      color: "white",
      fontSize: "22px",
      fontWeight: "800",
      margin: 0,
      letterSpacing: "1px",
    },
    logoSpan: { color: "#4cc9f0" },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    navLink: {
      color: "#a0aec0",
      textDecoration: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
    },
    activeLink: {
      color: "white",
      textDecoration: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      background: "rgba(255,255,255,0.15)",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    username: {
      color: "white",
      fontSize: "14px",
      fontWeight: "600",
    },
    logoutBtn: {
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
      padding: "8px 18px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },
  };

  const getLinkStyle = ({ isActive }) =>
    isActive ? styles.activeLink : styles.navLink;

  return (
    <>
      <nav style={styles.navbar}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <span style={{ fontSize: "24px" }}>🔍</span>
          <h1 style={styles.logoText}>
            Job<span style={styles.logoSpan}>Sphere</span>
          </h1>
        </Link>

        {/* Nav Links based on role */}
        <div style={styles.navLinks}>
          {redAuthToken.role === "Admin" && (
            <>
              <NavLink to="/manage-users" style={getLinkStyle}>
                👥 Users
              </NavLink>
              <NavLink to="/manage-jobs" style={getLinkStyle}>
                💼 Jobs
              </NavLink>
              <NavLink to="/reports" style={getLinkStyle}>
                📊 Reports
              </NavLink>
            </>
          )}
          {redAuthToken.role === "Job Provider" && (
            <>
              <NavLink to="/manage-applicants" style={getLinkStyle}>
                👥 Applicants
              </NavLink>
              <NavLink to="/manage-jobs" style={getLinkStyle}>
                💼 Jobs
              </NavLink>
              <NavLink to="/provider-report" style={getLinkStyle}>
                📊 Reports
              </NavLink>
            </>
          )}
          {redAuthToken.role === "User" && (
            <>
              <NavLink to="/dashboard" style={getLinkStyle}>
                🔍 Apply
              </NavLink>
              <NavLink to="/appliedJobs" style={getLinkStyle}>
                📋 Applied Jobs
              </NavLink>
            </>
          )}
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          <span style={styles.username}>
            👤 {redAuthToken.userName}
          </span>
          <button style={styles.logoutBtn} onClick={logoutHandler}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Spacer to push content below fixed navbar */}
      <div style={{ height: "65px" }}></div>
    </>
  );
};

export default Navigation;