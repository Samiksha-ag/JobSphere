import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Jobitem from "./Job_item";
import ApplyModal from "./ApplyModal";
import Config from "../config/Config.json";

let jobsData = [];

const Jobs = () => {
  const [modal, setModal] = useState(false);
  const [action, setAction] = useState(false);
  const [jobSet, setjobSet] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const closeModalHandler = () => setModal(false);

  const jobApply = (applyData) => {
    setModal(true);
    setjobSet(applyData);
  };

  const jobSearchHandler = (event) => {
    setJobs(
      jobsData.filter((job) =>
        job.title.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${Config.SERVER_URL + "user/jobsAvailable"}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        jobsData = response.data.jobs;
        setJobs(response.data.jobs);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [action]);

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f0f4f8",
      paddingBottom: "40px",
    },
    hero: {
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "50px 32px",
      textAlign: "center",
      marginBottom: "40px",
    },
    heroTitle: {
      color: "white",
      fontSize: "36px",
      fontWeight: "800",
      margin: "0 0 12px 0",
    },
    heroSubtitle: {
      color: "#a0aec0",
      fontSize: "16px",
      margin: "0 0 30px 0",
    },
    searchContainer: {
      maxWidth: "600px",
      margin: "0 auto",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      padding: "16px 24px 16px 50px",
      borderRadius: "50px",
      border: "none",
      fontSize: "16px",
      outline: "none",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      boxSizing: "border-box",
    },
    searchIcon: {
      position: "absolute",
      left: "18px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "20px",
    },
    statsBar: {
      display: "flex",
      justifyContent: "center",
      gap: "40px",
      padding: "20px 32px",
      background: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      marginBottom: "30px",
    },
    statItem: { textAlign: "center" },
    statNumber: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0f3460",
      margin: 0,
    },
    statLabel: { fontSize: "13px", color: "#718096", margin: 0 },
    jobsContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 32px",
    },
    sectionTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#1a1a2e",
      marginBottom: "20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "20px",
    },
    loadingBox: {
      textAlign: "center",
      padding: "80px",
      color: "#718096",
      fontSize: "18px",
    },
    emptyBox: { textAlign: "center", padding: "80px", color: "#718096" },
    emptyEmoji: { fontSize: "60px", marginBottom: "16px" },
    emptyText: { fontSize: "20px", fontWeight: "600", color: "#2d3748" },
    emptySubtext: { fontSize: "14px", color: "#718096", marginTop: "8px" },
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🚀 Find Your Dream Job</h1>
        <p style={styles.heroSubtitle}>
          Discover thousands of opportunities waiting for you
        </p>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            type="search"
            onChange={jobSearchHandler}
            placeholder="Search by job title, company, or skills..."
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <p style={styles.statNumber}>{jobs.length}</p>
          <p style={styles.statLabel}>Jobs Available</p>
        </div>
        <div style={styles.statItem}>
          <p style={styles.statNumber}>🏢</p>
          <p style={styles.statLabel}>Top Companies</p>
        </div>
        <div style={styles.statItem}>
          <p style={styles.statNumber}>⚡</p>
          <p style={styles.statLabel}>Quick Apply</p>
        </div>
      </div>

      {/* Jobs Grid */}
      <div style={styles.jobsContainer}>
        <h2 style={styles.sectionTitle}>
          💼 Available Positions ({jobs.length})
        </h2>

        {loading ? (
          <div style={styles.loadingBox}>⏳ Loading jobs for you...</div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyEmoji}>🔍</div>
            <p style={styles.emptyText}>No jobs found</p>
            <p style={styles.emptySubtext}>
              Try a different search term or check back later!
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((jobItem) => (
              <Jobitem key={jobItem._id} item={jobItem} jobApply={jobApply} />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ApplyModal
          job={jobSet}
          onOpen={modal}
          onClose={closeModalHandler}
          changes={setAction}
        />
      )}
    </div>
  );
};

export default Jobs;