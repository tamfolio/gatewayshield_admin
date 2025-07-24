import React from "react";

const ReportExportTemplate = ({ incident, pastHistory, auditTrail }) => {
  return (
    <div className="report-container">
      {/* SOS Header Card */}
      <div className="card">
        <h3>Incident Report</h3>
        <p><strong>ID:</strong> {incident?.incidentId}</p>
        <p><strong>Date:</strong> {incident?.datePublished}</p>
        <p><strong>Status:</strong> {incident?.incidentStatus}</p>
        <p><strong>Type:</strong> {incident?.incidentType}</p>
        <p><strong>Station:</strong> {incident?.station?.name}</p>
      </div>

      {/* Citizen Report */}
      <div className="card">
        <h4>Citizen Report</h4>
        <p className="paragraph">
          {incident?.description || "No description provided."}
        </p>
      </div>

      {/* Past SOS History */}
      <div className="card">
        <h4>Past SOS History</h4>
        {Array.isArray(pastHistory) && pastHistory.length > 0 ? (
          pastHistory.map((item, idx) => (
            <div key={idx} className="paragraph">
              #{item.id?.slice(-6)} — {item.incidentType}, {item.datePublished}
            </div>
          ))
        ) : (
          <p className="paragraph">No past SOS history available.</p>
        )}
      </div>

      {/* Audit Trail */}
      <div className="card">
        <h4>Audit Trail</h4>
        {Array.isArray(auditTrail) && auditTrail.length > 0 ? (
          auditTrail.map((item, idx) => (
            <div key={idx} className="paragraph">
              #{item.id?.slice(-6)} — {item.incidentStatus} at {item.datePublished}
            </div>
          ))
        ) : (
          <p className="paragraph">No audit trail available.</p>
        )}
      </div>
    </div>
  );
};

export default ReportExportTemplate;
