import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

const Login = () => {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({
    show: false,
    message: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "JobSphere - Login";
  }, []);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      setBackendErrors({ show: false, message: "" });
      axios
        .post("http://localhost:8080/auth/login", inputs)
        .then((res) => {
          const token = res.data.token;
          dispatch({ type: "SETAUTHTOKEN", data: token });
        })
        .catch((err) => {
          setBackendErrors({
            show: true,
            message: "Incorrect Email or Password",
          });
        });
    }
  };

  const validate = () => {
    let isValid = true;
    let error = {};
    if (!inputs["email"]) {
      isValid = false;
      error["email"] = "Please enter your email address.";
    }
    if (!inputs["password"]) {
      isValid = false;
      error["password"] = "Please enter your password.";
    }
    if (typeof inputs["password"] !== "undefined") {
      if (inputs["password"].length < 6) {
        isValid = false;
        error["password"] = "Password must be at least 6 characters.";
      }
    }
    setErrors(error);
    return isValid;
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      flexDirection: "column",
    },
    navbar: {
      padding: "16px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoText: {
      color: "white",
      fontSize: "24px",
      fontWeight: "800",
      margin: 0,
      letterSpacing: "1px",
    },
    logoSpan: {
      color: "#4cc9f0",
    },
    navTagline: {
      color: "#a0aec0",
      fontSize: "14px",
    },
    mainContent: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "40px",
      width: "100%",
      maxWidth: "420px",
      boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    },
    cardHeader: {
      textAlign: "center",
      marginBottom: "32px",
    },
    emoji: {
      fontSize: "48px",
      marginBottom: "12px",
    },
    cardTitle: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#1a1a2e",
      margin: "0 0 8px 0",
    },
    cardSubtitle: {
      color: "#718096",
      fontSize: "14px",
      margin: 0,
    },
    errorBox: {
      background: "#fff5f5",
      border: "1px solid #fc8181",
      color: "#c53030",
      padding: "12px 16px",
      borderRadius: "10px",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "14px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontWeight: "600",
      color: "#2d3748",
      marginBottom: "8px",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "15px",
      outline: "none",
      transition: "border 0.2s",
      boxSizing: "border-box",
      color: "#2d3748",
    },
    errorText: {
      color: "#e53e3e",
      fontSize: "12px",
      marginTop: "4px",
    },
    forgotLink: {
      display: "block",
      textAlign: "right",
      color: "#4361ee",
      fontSize: "13px",
      textDecoration: "none",
      marginBottom: "20px",
    },
    loginBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      letterSpacing: "0.5px",
      marginBottom: "20px",
      transition: "opacity 0.2s",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#e2e8f0",
    },
    dividerText: {
      color: "#a0aec0",
      fontSize: "13px",
    },
    signupText: {
      textAlign: "center",
      color: "#718096",
      fontSize: "14px",
      marginBottom: "12px",
    },
    signupBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #06d6a0, #028a5b)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      letterSpacing: "0.5px",
    },
    footer: {
      textAlign: "center",
      color: "#a0aec0",
      fontSize: "13px",
      marginTop: "24px",
    },
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "28px" }}>🔍</span>
          <h1 style={styles.logoText}>
            Job<span style={styles.logoSpan}>Sphere</span>
          </h1>
        </div>
        <div style={styles.navTagline}>Your Career, Your World 🌐</div>
      </nav>

      {/* Main */}
      <div style={styles.mainContent}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.emoji}>👤</div>
            <h2 style={styles.cardTitle}>Welcome Back!</h2>
            <p style={styles.cardSubtitle}>Login to your JobSphere account</p>
          </div>

          {/* Error */}
          {backendErrors.show && (
            <div style={styles.errorBox}>⚠️ {backendErrors.message}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📧 Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="Enter your email"
                value={inputs.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p style={styles.errorText}>⚠️ {errors.email}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🔒 Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={inputs.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p style={styles.errorText}>⚠️ {errors.password}</p>
              )}
            </div>

            <Link to="/Reset" style={styles.forgotLink}>
              Forgot Password?
            </Link>

            <button type="submit" style={styles.loginBtn}>
              🚀 Log In to JobSphere
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine}></div>
            </div>

            <p style={styles.signupText}>Don't have an account?</p>
            <Link to="/Register">
              <button type="button" style={styles.signupBtn}>
                ✨ Create New Account
              </button>
            </Link>
          </form>
        </div>

        <p style={styles.footer}>© 2024 JobSphere — Find Your Dream Job 🚀</p>
      </div>
    </div>
  );
};

export default Login;