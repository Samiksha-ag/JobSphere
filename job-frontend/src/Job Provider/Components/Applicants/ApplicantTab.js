import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SpinnerComponent from "../../../components/UI/SpinnerComponent";
import Config from "../../../config/Config.json";

let jobdata = [];

const ManageTab = () => {
  const [jobData, setJobData] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${Config.SERVER_URL + "provider/jobs"}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        const data = response.data.jobs;
        setShowSpinner(false);
        jobdata = [...data];
        setJobData(data);
      })
      .catch((err) => {
        setShowSpinner(false);
        console.log(err);
      });
  }, []);

  const searchJobHandler = (event) => {
    setJobData(
      jobdata.filter((job) =>
        job.title.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  const styles = {
    page: { padding: "30px", background: "#f0f4f8", minHeight: "100vh" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: { fontSize: "24px", fontWeight: "800", color: "#1a1a2e", margin: 0 },
    searchInput: {
      padding: "12px 20px",
      borderRadius: "50px",
      border: "2px solid #e2e8f0",
      fontSize: "14px",
      outline: "none",
      width: "280px",
    },
    table: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    thead: { background: "linear-gradient(135deg, #1a1a2e, #0f3460)" },
    th: { padding: "16px 20px", color: "white", fontWeight: "600", fontSize: "14px", textAlign: "left" },
    td: { padding: "16px 20px", borderBottom: "1px solid #f0f4f8", fontSize: "14px", color: "#2d3748" },
    viewBtn: {
      background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
    },
    badge: {
      background: "#ebf8ff",
      color: "#2b6cb0",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "600",
    },
    emptyBox: { textAlign: "center", padding: "80px", color: "#718096" },
    emptyEmoji: { fontSize: "60px", marginBottom: "16px" },
    emptyText: { fontSize: "20px", fontWeight: "600", color: "#2d3748" },
  };

  return (
    <div style={styles.page}>
      {showSpinner && <SpinnerComponent />}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Manage Applicants</h2>
        <input
          type="text"
          placeholder="🔍 Search jobs..."
          style={styles.searchInput}
          onChange={searchJobHandler}
        />
      </div>

      {/* Table */}
      {jobData.length > 0 ? (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>💼 Job Title</th>
              <th style={styles.th}>📋 Total Applicants</th>
              <th style={styles.th}>⭐ Shortlisted</th>
              <th style={styles.th}>🔍 Action</th>
            </tr>
          </thead>
          <tbody>
            {jobData.map((jobItem) => (
              <tr key={jobItem._id}>
                <td style={styles.td}>
                  <strong>{jobItem.title}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>
                    {jobItem.applicants ? jobItem.applicants.length : 0} Applied
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: "#f0fff4", color: "#276749" }}>
                    {jobItem.shortlisted ? jobItem.shortlisted.length : 0} Shortlisted
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`/manage-applicants/${jobItem._id}`)}
                  >
                    👁️ View Applicants
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={styles.emptyBox}>
          <div style={styles.emptyEmoji}>👥</div>
          <p style={styles.emptyText}>No applicants yet!</p>
          <p>Post jobs to start receiving applications</p>
        </div>
      )}
    </div>
  );
};

export default ManageTab;