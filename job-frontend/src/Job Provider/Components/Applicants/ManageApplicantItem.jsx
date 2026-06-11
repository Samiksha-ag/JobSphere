import axios from "axios";
import { useState } from "react";
import Chat from "../../../components/Chat";
import Config from "../../../config/Config.json";

const ApplicantItem = ({ setAction, ...props }) => {
  const applicantItemId = props.applicantItem._id;
  const token = props.token;
  const [showChat, setShowChat] = useState(false);

  const applicantUserId = props.applicantItem.userId._id;
  const applicantName = props.applicantItem.userId.name;

  const shortlistCandidateHandler = () => {
    axios
      .patch(
        `${Config.SERVER_URL + "provider/applicants/shortlist/" + applicantItemId}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      )
      .then(() => setAction((prev) => !prev))
      .catch((err) => console.log(err));
  };

  const rejectCandidateHandler = () => {
    axios
      .patch(
        `${Config.SERVER_URL + "provider/applicants/reject/" + applicantItemId}`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      )
      .then(() => setAction((prev) => !prev))
      .catch((err) => console.log(err));
  };

  const viewResumeHandler = () => {
    axios
      .get(
        `${Config.SERVER_URL + "provider/applicants/view-resume/" + applicantItemId}`,
        { headers: { Authorization: "Bearer " + token }, responseType: "blob" }
      )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileUrl = URL.createObjectURL(file);
        window.open(fileUrl);
      })
      .catch((err) => console.log(err));
  };

  const styles = {
    row: {
      borderBottom: "1px solid #f0f4f8",
    },
    td: {
      padding: "14px 16px",
      fontSize: "14px",
      color: "#2d3748",
      verticalAlign: "middle",
    },
    name: {
      fontWeight: "600",
      color: "#1a1a2e",
    },
    statusBadge: (status) => ({
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      background:
        status === "Shortlisted" ? "#f0fff4" :
        status === "Rejected" ? "#fff5f5" : "#ebf8ff",
      color:
        status === "Shortlisted" ? "#276749" :
        status === "Rejected" ? "#c53030" : "#2b6cb0",
    }),
    btn: {
      padding: "7px 14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      marginRight: "6px",
    },
    resumeBtn: {
      background: "#ebf8ff",
      color: "#2b6cb0",
    },
    shortlistBtn: {
      background: "#f0fff4",
      color: "#276749",
    },
    rejectBtn: {
      background: "#fff5f5",
      color: "#c53030",
    },
    chatBtn: {
      background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      color: "white",
    },
  };

  return (
    <>
      <tr style={styles.row}>
        <td style={styles.td}>
          <span style={styles.name}>
            👤 {props.applicantItem.userId.name}
          </span>
        </td>
        <td style={styles.td}>
          <span style={styles.statusBadge(props.applicantItem.status)}>
            {props.applicantItem.status === "Shortlisted" ? "⭐ Shortlisted" :
             props.applicantItem.status === "Rejected" ? "❌ Rejected" : "📋 Applied"}
          </span>
        </td>
        <td style={styles.td}>
          <button
            style={{ ...styles.btn, ...styles.resumeBtn }}
            onClick={viewResumeHandler}
          >
            📄 Resume
          </button>
          <button
            style={{ ...styles.btn, ...styles.shortlistBtn }}
            onClick={shortlistCandidateHandler}
            disabled={props.applicantItem.status === "Shortlisted"}
          >
            ⭐ Shortlist
          </button>
          <button
            style={{ ...styles.btn, ...styles.rejectBtn }}
            onClick={rejectCandidateHandler}
          >
            ❌ Reject
          </button>
          <button
            style={{ ...styles.btn, ...styles.chatBtn }}
            onClick={() => setShowChat(true)}
          >
            💬 Chat
          </button>
        </td>
      </tr>

      {/* Chat Window */}
      {showChat && (
        <Chat
          receiverId={applicantUserId}
          receiverName={applicantName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default ApplicantItem;