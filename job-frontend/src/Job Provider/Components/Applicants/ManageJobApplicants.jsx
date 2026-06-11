import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SpinnerComponent from "../../../components/UI/SpinnerComponent";
import ManageApplicantItem from "./ManageApplicantItem";

let applicantsdata = [];

const ManageJobApplicants = () => {
  const [applicantsData, setApplicantsData] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);
  const [action, setAction] = useState(false);

  const params = useParams();
  const jobId = params.jobId;
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`http://localhost:8080/provider/view-applicants/${jobId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        const data = response.data.applicants;
        setShowSpinner(false);
        applicantsdata = [...data];
        setApplicantsData(data);
      })
      .catch((err) => {
        setShowSpinner(false);
        console.log(err);
      });
  }, [jobId, action, token]);

  const searchApplicantHandler = (event) => {
    setApplicantsData(
      applicantsdata.filter((applicant) =>
        applicant.userId.name
          .toLowerCase()
          .includes(event.target.value.toLowerCase())
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
    statsRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "24px",
    },
    statCard: {
      background: "white",
      borderRadius: "12px",
      padding: "16px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "800",
      color: "#1a1a2e",
      margin: 0,
    },
    statLabel: { color: "#718096", fontSize: "13px", margin: 0 },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    thead: {
      background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
    },
    th: {
      padding: "16px 20px",
      color: "white",
      fontWeight: "600",
      fontSize: "14px",
      textAlign: "left",
    },
    emptyBox: {
      textAlign: "center",
      padding: "80px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    },
    emptyEmoji: { fontSize: "60px", marginBottom: "16px" },
    emptyText: { fontSize: "20px", fontWeight: "600", color: "#2d3748" },
    emptySubtext: { color: "#718096", fontSize: "14px" },
  };

  const shortlisted = applicantsData.filter(a => a.status === "Shortlisted").length;
  const rejected = applicantsData.filter(a => a.status === "Rejected").length;

  return (
    <div style={styles.page}>
      {showSpinner && <SpinnerComponent />}

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Applicant Management</h2>
        <input
          type="text"
          placeholder="🔍 Search applicants..."
          style={styles.searchInput}
          onChange={searchApplicantHandler}
        />
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>📋</span>
          <div>
            <p style={styles.statNumber}>{applicantsData.length}</p>
            <p style={styles.statLabel}>Total Applied</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>⭐</span>
          <div>
            <p style={styles.statNumber}>{shortlisted}</p>
            <p style={styles.statLabel}>Shortlisted</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={{ fontSize: "24px" }}>❌</span>
          <div>
            <p style={styles.statNumber}>{rejected}</p>
            <p style={styles.statLabel}>Rejected</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {applicantsData.length > 0 ? (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>👤 Applicant Name</th>
              <th style={styles.th}>📊 Status</th>
              <th style={styles.th}>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicantsData.map((applicantItem) => (
              <ManageApplicantItem
                key={applicantItem._id}
                applicantItem={applicantItem}
                setAction={setAction}
                token={token}
              />
            ))}
          </tbody>
        </table>
      ) : (
        !showSpinner && (
          <div style={styles.emptyBox}>
            <div style={styles.emptyEmoji}>👥</div>
            <p style={styles.emptyText}>No applicants yet!</p>
            <p style={styles.emptySubtext}>
              Applicants will appear here once they apply for this job.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default ManageJobApplicants;