import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const Navbar1 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
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
      position: "sticky",
      top: 0,
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
      transition: "all 0.2s",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
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
      transition: "all 0.2s",
    },
  };

  return (
    <nav style={styles.navbar}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        <span style={{ fontSize: "24px" }}>🔍</span>
        <h1 style={styles.logoText}>
          Job<span style={styles.logoSpan}>Sphere</span>
        </h1>
      </Link>

      {/* Nav Links */}
      <div style={styles.navLinks}>
        <NavLink
          to="/user"
          style={styles.navLink}
        >
          👥 Users
        </NavLink>
        <NavLink
          to="/manageJobs"
          style={styles.navLink}
        >
          💼 Jobs
        </NavLink>
        <NavLink
          to="/Report"
          style={styles.navLink}
        >
          📊 Reports
        </NavLink>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        <span style={{ color: "#a0aec0", fontSize: "14px" }}>
          👤 Admin
        </span>
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar1;