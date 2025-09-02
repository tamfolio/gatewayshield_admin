import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Square,
  Phone,
  MapPin,
  Clock,
  User,
  Star,
  FileText,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import ExportReportModal from "./ExportReportModal";
import CloseSosTicketModal from "./CloseSosTicketModal";
import AssignTicketSosModal from "./AssignTicketSosModal";
import ExportTicketSuccessModal from "./ReportExportedSuccessModal";
import TicketAssignedSuccessModal from "./TicketAssignedSuccessModal";
import CloseTicketConfirmModal from "./ConfirmCloseTicketModal";
import { userRequest } from "../../../requestMethod";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAvatarInitial,
  getAvatarColor,
  extractDate,
  extractTime,
  statusColorMap,
} from "../../../Utils/dateUtils";
import PastHistorySOS from "./PastSosTrailHistory.jsx";
import AuditTrailSectionSos from "./AuditrailSos.jsx";
import ReportExportTemplate from "./ReportExportTemplate.jsx";
import RejectTicketGeneralModal from "./RejectTicketSosModal.jsx";
import { toast } from "react-toastify";

function SosDetails() {
  const { id } = useParams();
  const reportRef = useRef();
  const [activeTab, setActiveTab] = useState("Citizen Report");
  const [selectedReports, setSelectedReports] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [incident, setIncident] = useState([]);
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [closureReasons, setClosureReasons] = useState([]);
  const [exportSosSuccessModal, setExportSosSuccessModal] = useState(false);
  const [closeSosTicketModal, setCloseSosTicketModal] = useState(false);
  const [assignTicketSosModal, setAssignTicketSosModal] = useState(false);
  const [rejectTicketModal, setRejectTicketModal] = useState(false);
  const [assignTicketSuccessModal, setAssignTicketSuccessModal] =
    useState(false);
  const [confirmCloseTicketModal, setConfirmCloseTicketModal] = useState(false);
  const [markingAsTreated, setMarkingAsTreated] = useState(false);
  const [puttingOnHold, setPuttingOnHold] = useState(false);

  // Role detection
  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  const userRoleId = useSelector(
    (state) => state.user?.currentUser?.admin?.roleId
  );
  const userName = useSelector((state) => state.user?.currentUser?.admin);

  // Get the current user's role name by matching roleId with adminRoles
  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find((role) => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();

  const handleExportModal = () => {
    setExportModal(!exportModal);
  };

  const handleCloseSosTicketModal = () => {
    setCloseSosTicketModal(!closeSosTicketModal);
  };

  const handleAssignSosTicketModal = () => {
    setAssignTicketSosModal(!assignTicketSosModal);
  };

  const handleAssignSosTicketSuccessModal = () => {
    setAssignTicketSuccessModal(!assignTicketSuccessModal);
  };

  const handleAssignTicketSuccessModal = () => {
    setAssignTicketSuccessModal(!assignTicketSuccessModal);
  };

  const handleExportSosSuccessModal = () => {
    setExportSosSuccessModal(!exportSosSuccessModal);
  };

  const handleConfirmCloseTicketModal = () => {
    setConfirmCloseTicketModal(!confirmCloseTicketModal);
  };

  const handleRejectTicketSuccess = () => {
    // Refresh incident data after rejection
    fetchIncident(); // Use the external fetchIncident function
    console.log("Ticket rejected successfully - data refreshed");
  };

  // handlers for new buttons
  const handleReassignTicketModal = () => {
    // You'll need to implement this modal
    console.log("Reassign ticket modal");
  };

  const handleRejectTicketModal = () => {
    setRejectTicketModal(!rejectTicketModal);
  };

  const handleMarkAsTreatedModal = async () => {
    if (markingAsTreated) return; // Prevent double clicks

    if (incident?.incidentStatus?.toLowerCase() !== "inprogress") {
      console.log("Cannot mark as treated - status is not 'inprogress'");
      return;
    }

    setMarkingAsTreated(true);

    try {
      const payload = {
        statusId: "01JY9RYDSKAQ06JZGDT85EJRCC", // Mark as treated status ID
      };

      const res = await userRequest(token).patch(
        `sos/updateStatus/${id}`,
        payload
      );

      console.log("✅ SOS marked as treated successfully", res.data);
      toast.success("SOS marked as treated successfully!");

      // Call success callback if provided
      if (handleRejectTicketSuccess) {
        handleRejectTicketSuccess();
      }

      // Refresh the incident data
      fetchIncident();
    } catch (err) {
      console.error("❌ Error marking SOS as treated:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to mark SOS as treated. Please try again.";

      toast.error(errorMessage);
    } finally {
      setMarkingAsTreated(false);
    }
  };

  const handlePutOnHoldModal = async () => {
    if (puttingOnHold) return; // Prevent double clicks

    if (incident?.incidentStatus?.toLowerCase() !== "inprogress") {
      console.log("Cannot put on hold - status is not 'inprogress'");
      return;
    }

    setPuttingOnHold(true);

    try {
      const payload = {
        statusId: "01JY9RYDSKAQ06JZGDT85EJRDD", // Put on hold status ID
      };

      const res = await userRequest(token).patch(
        `sos/updateStatus/${id}`,
        payload
      );

      console.log("✅ SOS put on hold successfully", res.data);
      toast.success("SOS put on hold successfully!");

      // Call success callback if provided
      if (handleRejectTicketSuccess) {
        handleRejectTicketSuccess();
      }

      // Refresh the incident data
      fetchIncident();
    } catch (err) {
      console.error("❌ Error putting SOS on hold:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to put SOS on hold. Please try again.";

      toast.error(errorMessage);
    } finally {
      setPuttingOnHold(false);
    }
  };

  const token = useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const getPossibleStations = async () => {
    try {
      const res = await userRequest(token).get(
        `/admin/get/all?roleid=01K0Q73GECFSBSNXDQ8TQCGEPZ`
      );
      setStations(res.data.data.admins);
    } catch (error) {
      console.error("❌ Failed to fetch incident:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClosureReasons = async () => {
    try {
      const res = await userRequest(token).get(`incident/closureReasons/all`);
      setClosureReasons(res.data.data);
    } catch (error) {
      console.error("❌ Failed to fetch incident:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncident = async () => {
    try {
      const res = await userRequest(token).get(`/sos/${id}`);
      setIncident(res.data.data.sos);
    } catch (error) {
      console.error("❌ Failed to fetch incident:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPastHistory = async () => {
      try {
        const res = await userRequest(token).get(
          `/sos/${id}/pastReport?page=1&size=10`
        );
        setPastHistory(res?.data?.data?.incidents?.data);
      } catch (error) {
        console.error("❌ Failed to fetch incident:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAuditTrail = async () => {
      try {
        const res = await userRequest(token).get(`/sos/getAuditLogs/${id}`);
        setAuditTrail(res.data.data);
      } catch (error) {
        console.error("❌ Failed to fetch incident:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchIncident();
      fetchPastHistory();
      fetchAuditTrail();
    }
  }, [id, token]);

  useEffect(() => {
    getPossibleStations();
    getClosureReasons();
  }, []);

  const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase()?.replace(/\s/g, "_");
    const color = statusColorMap[normalizedStatus] || "bg-gray-400";

    return (
      <div className="flex items-center space-x-2">
        <div
          className={`w-full ${color} text-white text-xs font-medium px-3 py-1 text-center`}
        >
          {status}
        </div>
      </div>
    );
  };

  const ReportCard = ({ incident }) => {
    return (
      <div className="block bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden pb-3 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-start">
          <div className="flex flex-col w-full">
            <div className="flex">
              <div className="flex flex-col bg-white">
                <div className="flex bg-[#E9EAEB] items-center justify-center">
                  <div className="bg-[#E9EAEB] px-3 py-2 text-sm font-medium text-gray-600">
                    {incident?.id}
                  </div>
                </div>
                <StatusBadge
                  status={incident?.incidentStatus}
                  color={incident?.statusColor}
                />
                <div className="bg-gray-600 text-white text-xs font-medium px-3 py-1 text-center">
                  SOS
                </div>
              </div>

              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {incident?.incidentType}
                </h3>
                <p className="text-gray-600 text-sm">
                  {incident?.description || incident?.comment}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-start gap-10 space-x-6 text-sm text-gray-500 px-5 mt-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 ${getAvatarColor(
                    incident?.user || "Contact Center"
                  )} rounded-full flex items-center justify-center text-xs font-bold text-white`}
                >
                  {getAvatarInitial(
                    typeof incident?.user === "string" && incident?.user
                      ? incident?.user
                      : "Contact Center"
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Reported By</div>
                  <div className="font-medium">
                    {incident?.user || "Contact Center"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Date Reported</div>
                <div className="font-medium">
                  {extractDate(incident?.datePublished)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Time</div>
                <div className="font-medium">
                  {extractTime(incident?.datePublished)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Channel</div>
                <div className="font-medium">{incident?.channel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderActionButtons = () => {
  // Check incident status
  const isIncidentTreated =
    incident?.incidentStatus?.toLowerCase() === "treated";
  const isIncidentClosed =
    incident?.incidentStatus?.toLowerCase() === "closed";
  const isIncidentInProgress = () => {
    const status = incident?.incidentStatus?.toLowerCase();
    return status === "new" || status === "inprogress";
  };

  // Check assignment status (like SOS)
  const isAlreadyAssigned = incident?.assignedStation;

  // Button availability logic
  const isMarkAsTreatedDisabled =
    !incident?.assignedStation ||
    incident?.slaStatus === "Treated" ||
    !isIncidentInProgress() ||
    markingAsTreated;

  const isPutOnHoldDisabled =
    !incident?.assignedStation ||
    incident?.slaStatus === "OnHold" ||
    !isIncidentInProgress() ||
    puttingOnHold;

  // Disable assign button ONLY if treated OR closed (allow reassignment if assigned + inprogress)
  const isAssignDisabled = isIncidentTreated || isIncidentClosed;

  // Close ticket is only active if incident status is "treated"
  const isCloseDisabled = !isIncidentTreated;

  // UPDATED: Disable reject button if ticket is treated, in progress, or already rejected
  const isRejectDisabled =
    isIncidentTreated ||
    incident?.incidentStatus?.toLowerCase() === "inprogress" ||
    incident?.incidentStatus?.toLowerCase() === "rejected";

  // Determine button text for assign/reassign
  const getAssignButtonText = () => {
    if (isIncidentTreated) return "Treated";
    if (isIncidentClosed) return "Closed";
    if (isAlreadyAssigned && isIncidentInProgress()) return "Reassign Ticket";
    if (isAlreadyAssigned) return "Already Assigned";
    return "Assign Ticket";
  };

  switch (currentUserRole) {
    // MERGED ROLE: Admin now handles both Admin and Command Centre supervisor functionality
    // UPDATED: Added Mark as Treated and Put On Hold buttons for Admin role
    case "Admin":
      return (
        <div className="space-y-3">
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isAssignDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleAssignSosTicketModal}
            disabled={isAssignDisabled}
            title={
              isIncidentTreated
                ? "Cannot assign a treated incident"
                : isIncidentClosed
                ? "Cannot assign a closed incident"
                : ""
            }
          >
            {getAssignButtonText()}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isMarkAsTreatedDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white text-[#3538CD] hover:bg-[#DDE7FF]"
            }`}
            onClick={handleMarkAsTreatedModal}
            disabled={isMarkAsTreatedDisabled}
            title={
              !isIncidentInProgress()
                ? "Incident must be 'New' or 'In Progress' to mark as treated"
                : !incident?.assignedStation
                ? "Incident must be assigned to a station"
                : incident?.slaStatus === "Treated"
                ? "Incident is already marked as treated"
                : ""
            }
          >
            {markingAsTreated
              ? "Marking..."
              : incident?.incidentStatus === "treated"
              ? "Treated"
              : "Mark as Treated"}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isPutOnHoldDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#EEF4FF] text-[#3538CD] hover:bg-[#DDE7FF]"
            }`}
            onClick={handlePutOnHoldModal}
            disabled={isPutOnHoldDisabled}
            title={
              !isIncidentInProgress()
                ? "Incident must be 'New' or 'In Progress' to put on hold"
                : !incident?.assignedStation
                ? "Incident must be assigned to a station"
                : incident?.slaStatus === "OnHold"
                ? "Incident is already on hold"
                : ""
            }
          >
            {puttingOnHold ? "Putting On Hold..." : "Put On Hold"}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isRejectDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={handleRejectTicketModal}
            disabled={isRejectDisabled}
            title={
              isIncidentTreated
                ? "Cannot reject a treated incident"
                : incident?.incidentStatus?.toLowerCase() === "inprogress"
                ? "Cannot reject an incident that is in progress"
                : incident?.incidentStatus?.toLowerCase() === "rejected"
                ? "Incident is already rejected"
                : ""
            }
          >
            {incident?.incidentStatus?.toLowerCase() === "rejected" 
              ? "Already Rejected" 
              : isRejectDisabled 
              ? "Cannot Reject" 
              : "Reject Ticket"}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isCloseDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={handleCloseSosTicketModal}
            disabled={isCloseDisabled}
            title={
              !isIncidentTreated
                ? "Incident must be 'treated' before it can be closed"
                : ""
            }
          >
            {isIncidentClosed
              ? "Already Closed"
              : isCloseDisabled
              ? "Cannot Close"
              : "Close Ticket"}
          </button>
          <button
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
            onClick={handleExportModal}
          >
            Export Report
          </button>
        </div>
      );

    case "Command Centre Agent":
      return (
        <div className="space-y-3">
          <button
            className="w-full bg-[#444CE7] border border-gray-300 text-white py-2 px-4 rounded-lg font-medium"
            onClick={handleExportModal}
          >
            Export Report
          </button>
        </div>
      );

    case "Police Station":
      return (
        <div className="space-y-3">
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isMarkAsTreatedDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleMarkAsTreatedModal}
            disabled={isMarkAsTreatedDisabled}
            title={
              !isIncidentInProgress()
                ? "Incident must be 'New' or 'In Progress' to mark as treated"
                : !incident?.assignedStation
                ? "Incident must be assigned to a station"
                : incident?.slaStatus === "Treated"
                ? "Incident is already marked as treated"
                : ""
            }
          >
            {markingAsTreated
              ? "Marking..."
              : incident?.incidentStatus === "treated"
              ? "Treated"
              : "Mark as Treated"}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isPutOnHoldDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#EEF4FF] text-[#3538CD] hover:bg-[#DDE7FF]"
            }`}
            onClick={handlePutOnHoldModal}
            disabled={isPutOnHoldDisabled}
            title={
              !isIncidentInProgress()
                ? "Incident must be 'New' or 'In Progress' to put on hold"
                : !incident?.assignedStation
                ? "Incident must be assigned to a station"
                : incident?.slaStatus === "OnHold"
                ? "Incident is already on hold"
                : ""
            }
          >
            {puttingOnHold ? "Putting On Hold..." : "Put On Hold"}
          </button>
          <button
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
            onClick={handleExportModal}
          >
            Export Report
          </button>
        </div>
      );

    case "Super Admin":
      return (
        <div className="space-y-3">
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isAssignDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            onClick={handleAssignSosTicketModal}
            disabled={isAssignDisabled}
            title={
              isIncidentTreated
                ? "Cannot assign a treated incident"
                : isIncidentClosed
                ? "Cannot assign a closed incident"
                : ""
            }
          >
            {getAssignButtonText()}
          </button>
          <button
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isCloseDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={handleCloseSosTicketModal}
            disabled={isCloseDisabled}
            title={
              !isIncidentTreated
                ? "Incident must be 'treated' before it can be closed"
                : ""
            }
          >
            {isIncidentClosed
              ? "Already Closed"
              : isCloseDisabled
              ? "Cannot Close"
              : "Close Ticket"}
          </button>
          <button
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
            onClick={handleExportModal}
          >
            Export Report
          </button>
        </div>
      );

    default:
      return (
        <div className="space-y-3">
          <button
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
            onClick={handleExportModal}
          >
            Export Report
          </button>
        </div>
      );
  }
};
  const tabs = ["Citizen Report", "Past SOS History", "Audit Trail"];

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
        }}
      >
        <div ref={reportRef}>
          <ReportExportTemplate
            incident={incident}
            pastHistory={pastHistory}
            auditTrail={auditTrail}
          />
        </div>
      </div>

      {exportModal && (
        <ExportReportModal
          handleExportModal={handleExportModal}
          reportRef={reportRef}
        />
      )}
      {closeSosTicketModal && (
        <CloseSosTicketModal
          handleCloseSosTicketModal={handleCloseSosTicketModal}
          closureReasons={closureReasons}
          handleConfirmCloseTicketModal={handleConfirmCloseTicketModal}
        />
      )}
      {assignTicketSosModal && (
        <AssignTicketSosModal
          handleAssignSosTicketModal={handleAssignSosTicketModal}
          stations={stations}
          handleAssignSosTicketSuccessModal={handleAssignSosTicketSuccessModal}
          handleAssignTicketSuccessModal={handleAssignTicketSuccessModal}
        />
      )}
      {exportSosSuccessModal && (
        <ExportTicketSuccessModal
          handleExportSosSuccessModal={handleExportSosSuccessModal}
        />
      )}

      {rejectTicketModal && (
        <RejectTicketGeneralModal
          id={id}
          token={token}
          handleRejectTicketModal={handleRejectTicketModal}
          handleRejectTicketSuccess={handleRejectTicketSuccess}
        />
      )}
      {assignTicketSuccessModal && (
        <TicketAssignedSuccessModal
          handleAssignTicketSuccessModal={handleAssignTicketSuccessModal}
        />
      )}
      {confirmCloseTicketModal && (
        <CloseTicketConfirmModal
          handleConfirmCloseTicketModal={handleConfirmCloseTicketModal}
        />
      )}
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <span>Dashboard</span>
          <span className="mx-2">&gt;</span>
          <span>User Management</span>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900">SOS</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* SOS Header Card */}
            <div className="space-y-4">
              <ReportCard incident={incident} />
            </div>

            {/* Tabs */}
            <div className="pb-0">
              <nav className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                      activeTab === tab
                        ? "bg-[#D5D7DA] text-[#414651] border-b-2 border-gray-200"
                        : "text-[#414651] hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            {activeTab === "Citizen Report" && (
              <>
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {incident?.description ||
                          incident?.comment ||
                          "No description Attached"}
                      </p>
                    </div>
                  </div>
                </div>
                {incident?.audio && (
                  <AudioPlayer
                    src={incident?.audio}
                    onPlay={(e) => console.log("Playing")}
                    controls
                  />
                )}
              </>
            )}

            {activeTab === "Past SOS History" && (
              <div className="bg-white rounded-lg shadow-sm border">
                {activeTab === "Past SOS History" && (
                  <PastHistorySOS pastHistory={pastHistory} />
                )}
              </div>
            )}
            {activeTab === "Audit Trail" && (
              <div className="bg-white rounded-lg shadow-sm border">
                {activeTab === "Audit Trail" && (
                  <AuditTrailSectionSos auditTrail={auditTrail} />
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {renderActionButtons()}

            {/* Contact Information */}
            {/* <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Reported By</label>
                    <div className="font-medium">John Doe</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Phone Number
                    </label>
                    <div className="font-medium">+234 81 34456666</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date Created
                    </label>
                    <div className="font-medium">16th May, 2025</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Submission Time
                    </label>
                    <div className="font-medium">8:00am</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="font-medium">
                      Report received and under review
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Citizen Feedback */}
            {/* <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Citizen Feedback
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">
                      Rating Given
                    </label>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Station Name
                    </label>
                    <div className="font-medium">Lorem Ipsum</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Citizen Feedback
                    </label>
                    <div className="text-sm text-gray-700 mt-1">
                      Dolor enim eu tortor urna sed duis nulla. Aliquam
                      vestibulum, nulla odio nisl vitae. In aliquet pellentesque
                      aenean hac vestibulum turpis mi bibendum diam. Tempor
                      integer aliquam in vitae malesuada fringilla. Elit nisl in
                      eleifend sed nisl. Pulvinar at orci, proin imperdiet
                      commodo consectetur convallis risus.
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Non pellentesque congue eget consectetur turpis.
                  </div>
                  <div className="text-sm text-gray-700">
                    Sapien, dictum molestie sem tempor. Diam elit, orci,
                    tincidunt aenean tempus. Quis velit eget ut tortor tellus.
                    Sed vel, congue felis elit erat nam nibh orci.
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date of Rating
                    </label>
                    <div className="font-medium">16th May, 2025</div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Internal Note */}
            {/* <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Internal Note
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">User</label>
                    <div className="font-medium">Name Surname</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Notes</label>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                      Dolor enim eu tortor urna sed duis nulla. Aliquam
                      vestibulum, nulla odio nisl vitae. In aliquet pellentesque
                      aenean hac vestibulum turpis mi bibendum diam. Tempor
                      integer aliquam in
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Closure Note */}
            {/* <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Closure Note</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Time</label>
                    <div className="font-medium">8:00am</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">User</label>
                    <div className="font-medium">Name Surname</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Notes</label>
                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                      Dolor enim eu tortor urna sed duis nulla. Aliquam
                      vestibulum, nulla odio nisl vitae. In aliquet pellentesque
                      aenean hac vestibulum turpis mi bibendum diam. Tempor
                      integer aliquam in
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default SosDetails;
