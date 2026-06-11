import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpinnerComponent from "../../components/UI/SpinnerComponent";

const Register = (props) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();

  let initialValues = {
    name: "",
    email: "",
    password: "",
    mobile: "",
    age: "",
    gender: "",
    qualification: "",
    experience: "",
    role: "User",
  };

  const formSubmitHandler = (values, setSubmitting) => {
    setShowSpinner(true);
    axios
      .post(`http://localhost:8080/auth/register`, { ...values })
      .then((res) => {
        setShowSpinner(false);
        toast.success(res.data.message);
        navigate("/login", { replace: true });
      })
      .catch((err) => {
        setShowSpinner(false);
        toast.error("Oops something went wrong");
        console.log(err);
      });
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
    logoText: {
      color: "white",
      fontSize: "24px",
      fontWeight: "800",
      margin: 0,
    },
    logoSpan: { color: "#4cc9f0" },
    navTagline: { color: "#a0aec0", fontSize: "14px" },
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
      maxWidth: "550px",
      boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    },
    cardHeader: { textAlign: "center", marginBottom: "32px" },
    emoji: { fontSize: "48px", marginBottom: "12px" },
    cardTitle: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 8px 0" },
    cardSubtitle: { color: "#718096", fontSize: "14px", margin: 0 },
    formRow: { display: "flex", gap: "16px", marginBottom: "16px" },
    formGroup: { marginBottom: "16px", flex: 1 },
    label: { display: "block", fontWeight: "600", color: "#2d3748", marginBottom: "6px", fontSize: "14px" },
    input: {
      width: "100%",
      padding: "11px 14px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      color: "#2d3748",
    },
    select: {
      width: "100%",
      padding: "11px 14px",
      border: "2px solid #e2e8f0",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      color: "#2d3748",
      background: "white",
    },
    errorText: { color: "#e53e3e", fontSize: "12px", marginTop: "4px" },
    radioGroup: { display: "flex", gap: "20px", marginTop: "8px" },
    radioLabel: { display: "flex", alignItems: "center", gap: "6px", color: "#2d3748", fontSize: "14px" },
    registerBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #06d6a0, #028a5b)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      marginBottom: "12px",
      marginTop: "8px",
    },
    backBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
    },
    footer: { textAlign: "center", color: "#a0aec0", fontSize: "13px", marginTop: "24px" },
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
          {showSpinner && <SpinnerComponent />}

          {/* Header */}
          <div style={styles.cardHeader}>
            <div style={styles.emoji}>✨</div>
            <h2 style={styles.cardTitle}>Create Account</h2>
            <p style={styles.cardSubtitle}>Join JobSphere and find your dream job!</p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={Yup.object({
              name: Yup.string().min(4, "Min 4 characters").max(25, "Max 25 characters").required("Name is required"),
              email: Yup.string().email("Invalid email").required("Email is required"),
              password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
              mobile: Yup.string().required("Mobile is required").matches(/^[0-9]+$/, "Digits only").min(10, "Must be 10 digits").max(10, "Must be 10 digits"),
              gender: Yup.string().required("Gender is required"),
              age: Yup.number().max(60, "Max age 60").min(18, "Min age 18").required("Age is required"),
              qualification: Yup.string().required("Qualification is required"),
              experience: Yup.string(),
              role: Yup.string(),
            })}
            onSubmit={(values, { setSubmitting }) => {
              formSubmitHandler({ ...props.userInfo, ...values }, setSubmitting);
            }}
          >
            {(formik) => (
              <Form>
                {/* Name + Email */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>👤 Full Name *</label>
                    <Field name="name">
                      {({ field }) => <input {...field} style={styles.input} placeholder="Your full name" />}
                    </Field>
                    {formik.errors.name && formik.touched.name && <p style={styles.errorText}>⚠️ {formik.errors.name}</p>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>📧 Email *</label>
                    <Field name="email">
                      {({ field }) => <input {...field} type="email" style={styles.input} placeholder="Your email" />}
                    </Field>
                    {formik.errors.email && formik.touched.email && <p style={styles.errorText}>⚠️ {formik.errors.email}</p>}
                  </div>
                </div>

                {/* Password + Mobile */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>🔒 Password *</label>
                    <Field name="password">
                      {({ field }) => <input {...field} type="password" style={styles.input} placeholder="Min 6 characters" />}
                    </Field>
                    {formik.errors.password && formik.touched.password && <p style={styles.errorText}>⚠️ {formik.errors.password}</p>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>📱 Mobile *</label>
                    <Field name="mobile">
                      {({ field }) => <input {...field} style={styles.input} placeholder="10 digit number" />}
                    </Field>
                    {formik.errors.mobile && formik.touched.mobile && <p style={styles.errorText}>⚠️ {formik.errors.mobile}</p>}
                  </div>
                </div>

                {/* Age + Gender */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>🎂 Age *</label>
                    <Field name="age">
                      {({ field }) => <input {...field} type="number" style={styles.input} placeholder="18-60" />}
                    </Field>
                    {formik.errors.age && formik.touched.age && <p style={styles.errorText}>⚠️ {formik.errors.age}</p>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>⚧ Gender *</label>
                    <div style={styles.radioGroup}>
                      <label style={styles.radioLabel}>
                        <Field type="radio" name="gender" value="Male" /> Male
                      </label>
                      <label style={styles.radioLabel}>
                        <Field type="radio" name="gender" value="Female" /> Female
                      </label>
                    </div>
                    {formik.errors.gender && formik.touched.gender && <p style={styles.errorText}>⚠️ {formik.errors.gender}</p>}
                  </div>
                </div>

                {/* Qualification + Experience */}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>🎓 Qualification *</label>
                    <Field name="qualification">
                      {({ field }) => (
                        <select {...field} style={styles.select}>
                          <option value="">Select</option>
                          <option value="Post Graduate">Post Graduate</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Diploma">Diploma</option>
                          <option value="High School">High School</option>
                        </select>
                      )}
                    </Field>
                    {formik.errors.qualification && formik.touched.qualification && <p style={styles.errorText}>⚠️ {formik.errors.qualification}</p>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>💼 Experience (yrs)</label>
                    <Field name="experience">
                      {({ field }) => (
                        <select {...field} style={styles.select}>
                          <option value="">Select</option>
                          <option value="0-2">0-2 years</option>
                          <option value="3-7">3-7 years</option>
                          <option value="7-10">7-10 years</option>
                          <option value="10-50">10+ years</option>
                        </select>
                      )}
                    </Field>
                  </div>
                </div>

                {/* Role */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>🏷️ Register As</label>
                  <Field name="role">
                    {({ field }) => (
                      <select {...field} style={styles.select}>
                        <option value="User">Applicant</option>
                        <option value="Job Provider">Recruiter</option>
                      </select>
                    )}
                  </Field>
                </div>

                {/* Buttons */}
                <button type="submit" style={styles.registerBtn}>
                  ✨ Create My Account
                </button>
                <Link to="/Login">
                  <button type="button" style={styles.backBtn}>
                    🚀 Back to Login
                  </button>
                </Link>
              </Form>
            )}
          </Formik>
        </div>
        <p style={styles.footer}>© 2024 JobSphere — Find Your Dream Job 🚀</p>
      </div>
    </div>
  );
};

export default Register;