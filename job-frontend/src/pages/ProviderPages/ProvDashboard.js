import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import Config from "../../config/Config.json";
import { useNavigate } from "react-router-dom";

const COLORS = ["#4361ee", "#06d6a0", "#f72585", "#ffd60a", "#4cc9f0", "#7209b7"];

export default function ProvDashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ jobsCount: 0, applicantsCount: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${Config.SERVER_URL + "provider/dashboard-stats"}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setStats(res.data.stats);
        setLoading(false);
      })
      .catch((er) => {
        setLoading(false);
        console.log(er);
      });

    axios
      .get(`${Config.SERVER_URL + "provider/dashboard-recents"}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setJobs(res.data.recentJobs);
      })
      .catch((err) => console.log(err));

    document.title = "JobSphere - Dashboard";
  }, [token]);

  const categoryData = jobs.reduce((acc, job) => {
    const found = acc.find((item) => item.name === job.category);
    if (found) found.value++;
    else acc.push({ name: job.category || "Other", value: 1 });
    return acc;
  }, []);

  const monthlyData = [
    { month: "Jan", jobs: 0 },
    { month: "Feb", jobs: 0 },
    { month: "Mar", jobs: 0 },
    { month: "Apr", jobs: 0 },
    { month: "May", jobs: 0 },
    { month: "Jun", jobs: jobs.length },
  ];

  const applicationTrend = [
    { day: "Mon", applications: 0 },
    { day: "Tue", applications: 0 },
    { day: "Wed", applications: 1 },
    { day: "Thu", applications: 0 },
    { day: "Fri", applications: stats.applicantsCount },
    { day: "Sat", applications: 0 },
    { day: "Sun", applications: 0 },
  ];

  const styles = {
    page: { background: "#f0f4f8", minHeight: "100vh", padding: "30px" },
    header: { marginBottom: "30px" },
    headerTitle: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 4px 0" },
    headerSubtitle: { color: "#718096", fontSize: "14px", margin: 0 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" },
    statCard: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "16px" },
    statIcon: { fontSize: "40px", width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" },
    statInfo: { flex: 1 },
    statNumber: { fontSize: "32px", fontWeight: "800", color: "#1a1a2e", margin: 0 },
    statLabel: { color: "#718096", fontSize: "13px", margin: 0 },
    chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" },
    chartCard: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    chartTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" },
    fullWidthChart: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "30px" },
    tableCard: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    tableTitle: { fontSize: "18px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    viewAllBtn: { background: "linear-gradient(135deg, #4361ee, #3a0ca3)", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "12px 16px", background: "#f7fafc", color: "#4a5568", fontWeight: "600", fontSize: "13px", textAlign: "left", borderBottom: "2px solid #e2e8f0" },
    td: { padding: "14px 16px", borderBottom: "1px solid #f0f4f8", fontSize: "14px", color: "#2d3748" },
    badge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#ebf8ff", color: "#2b6cb0" },
    loadingBox: { textAlign: "center", padding: "80px", color: "#718096", fontSize: "18px" },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>⏳ Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 Recruiter Dashboard</h1>
        <p style={styles.headerSubtitle}>
          Welcome back! Here's what's happening with your jobs today.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: "#ebf8ff" }}>💼</div>
          <div style={styles.statInfo}>
            <p style={styles.statNumber}>{stats.jobsCount}</p>
            <p style={styles.statLabel}>Total Jobs Posted</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: "#f0fff4" }}>👥</div>
          <div style={styles.statInfo}>
            <p style={styles.statNumber}>{stats.applicantsCount}</p>
            <p style={styles.statLabel}>Total Applicants</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: "#fff5f5" }}>⭐</div>
          <div style={styles.statInfo}>
            <p style={styles.statNumber}>0</p>
            <p style={styles.statLabel}>Shortlisted</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: "#fffff0" }}>📈</div>
          <div style={styles.statInfo}>
            <p style={styles.statNumber}>
              {stats.jobsCount > 0
                ? Math.round((stats.applicantsCount / stats.jobsCount) * 10) / 10
                : 0}
            </p>
            <p style={styles.statLabel}>Avg. Applicants/Job</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={styles.chartsGrid}>

        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>📊 Monthly Job Postings</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="jobs" fill="#4361ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <p style={styles.chartTitle}>🥧 Jobs by Category</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: "60px", color: "#718096" }}>
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div style={styles.fullWidthChart}>
        <p style={styles.chartTitle}>📈 Application Trend This Week</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={applicationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#06d6a0"
              strokeWidth={3}
              dot={{ fill: "#06d6a0", r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Jobs Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>
          <span>🕐 Recent Jobs</span>
          <button style={styles.viewAllBtn} onClick={() => navigate("/manage-jobs")}>
            View All Jobs →
          </button>
        </div>
        {jobs.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Job Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Posted On</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td style={styles.td}><strong>{job.title}</strong></td>
                  <td style={styles.td}>{job.category}</td>
                  <td style={styles.td}>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}><span style={styles.badge}>✅ Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
            No recent jobs. Click "View All Jobs" to post a job!
          </div>
        )}
      </div>

    </div>
  );
}