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
  ZoomIn,
  X,
} from "lucide-react";
import AuditTrailSection from "./AuditTrail";
import ExportReportModal from "./ExportReportModal";
import CloseTicketModal from "./CloseTicketModal";
import AssignTicketModal from "./AssignTicketModal";
import ExportTicketSuccessModal from "./ReportExportedSuccessModal";
import TicketAssignedSuccessModal from "./TicketAssignedSuccessModal";
import CloseTicketConfirmModal from "./ConfirmCloseTicketModal";
import RejectTicketGeneralModal from "./RejectTicketGeneralModal";
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
import PastHistorySOS from "./PastTrailHistory.jsx";
import ReportExportTemplate from "./ReportExportTemplate.jsx";
import { toast } from "react-toastify";

function GeneralDetails() {
  const { id } = useParams();
  const reportRef = useRef();
  const [activeTab, setActiveTab] = useState("Citizen Report");
  const [selectedReports, setSelectedReports] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [incident, setIncident] = useState([]);
  const [pastHistory, setPastHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);
  const [closureReasons, setClosureReasons] = useState([]);
  const [exportSuccessModal, setExportSuccessModal] = useState(false);
  const [closeTicketModal, setCloseTicketModal] = useState(false);
  const [assignTicketModal, setAssignTicketModal] = useState(false);
  const [assignTicketSuccessModal, setAssignTicketSuccessModal] =
    useState(false);
  const [confirmCloseTicketModal, setConfirmCloseTicketModal] = useState(false);
  const [rejectTicketModal, setRejectTicketModal] = useState(false);
  const [markingAsTreated, setMarkingAsTreated] = useState(false);
  const [puttingOnHold, setPuttingOnHold] = useState(false);

  // Image modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Role detection
  const adminRolesList = useSelector((state) => state.user?.adminRoles);
  const userRoleId = useSelector(
    (state) => state.user?.currentUser?.admin?.roleId
  );
  console.log(userRoleId);
  const userName = useSelector((state) => state.user?.currentUser?.admin);

  // Update the modal handlers
  const openMediaModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setMediaModalOpen(true);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
    setMediaModalOpen(false);
  };

  // Enhanced Images Gallery Component that handles both images and videos
// Fixed Enhanced Images Gallery Component that handles both images and videos
const MediaGallery = ({ images }) => {
  if (!images || images.length === 0) {
    return null;
  }

  // Function to check if a file is a video
  const isVideo = (url) => {
    const videoExtensions = [
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".webm",
      ".mkv",
    ];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  // Function to get media type for display
  const getMediaType = (url) => {
    return isVideo(url) ? "video" : "image";
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Incident Media
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((mediaUrl, index) => {
          const mediaType = getMediaType(mediaUrl);

          return (
            <div
              key={index}
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
              onClick={() => openMediaModal(mediaUrl)} // FIXED: Use openMediaModal instead of openImageModal
            >
              {mediaType === "video" ? (
                <>
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 hidden">
                    <div className="text-center">
                      <Play className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">Video failed to load</span>
                    </div>
                  </div>
                  {/* Video overlay indicator */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white bg-opacity-80 rounded-full p-2">
                      <Play className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={mediaUrl}
                    alt={`Incident image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png"; // Fallback image
                      e.target.alt = "Image failed to load";
                    }}
                  />
                </>
              )}

              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>

              {/* Media type badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {mediaType === "video" ? "Video" : "Image"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  // Enhanced Image Modal Component that handles both images and videos
  const MediaModal = ({ isOpen, mediaUrl, onClose }) => {
    if (!isOpen) return null;

    const isVideo = (url) => {
      const videoExtensions = [
        ".mp4",
        ".avi",
        ".mov",
        ".wmv",
        ".flv",
        ".webm",
        ".mkv",
      ];
      return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
    };

    const mediaType = isVideo(mediaUrl) ? "video" : "image";

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-screen p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error("Video failed to load:", mediaUrl);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={mediaUrl}
              alt="Incident media enlarged"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    );
  };
  // Get the current user's role name by matching roleId with adminRoles
  const getCurrentUserRole = () => {
    if (!adminRolesList || !userRoleId) return null;
    const role = adminRolesList.find((role) => role.id === userRoleId);
    return role ? role.name : null;
  };

  const currentUserRole = getCurrentUserRole();

  // Image modal handlers
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageModalOpen(false);
  };

  const handleExportModal = () => {
    setExportModal(!exportModal);
  };

  const handleCloseTicketModal = () => {
    setCloseTicketModal(!closeTicketModal);
  };

  const handleAssignTicketModal = () => {
    setAssignTicketModal(!assignTicketModal);
  };

  const handleAssignTicketSuccessModal = () => {
    setAssignTicketSuccessModal(!assignTicketSuccessModal);
  };

  const handleExportSuccessModal = () => {
    setExportSuccessModal(!exportSuccessModal);
  };

  const handleConfirmCloseTicketModal = () => {
    setConfirmCloseTicketModal(!confirmCloseTicketModal);
  };

  const handleRejectTicketModal = () => {
    setRejectTicketModal(!rejectTicketModal);
  };

  const handleRejectTicketSuccess = () => {
    console.log("Ticket rejected successfully");
  };

  const handleMarkAsTreatedModal = async () => {
    if (!incident?.assignedStation || incident?.slaStatus === "Treated") {
      return;
    }

    setMarkingAsTreated(true);

    try {
      const requestBody = {
        incidentId: id,
        stationId: incident.assignedStation,
      };

      const res = await userRequest(token).patch(
        `/incident/mark-as-treated/${id}`,
        requestBody
      );

      // Check for the message instead of success
      if (res.data.message) {
        console.log("Incident marked as treated successfully");
        toast.success(res.data.message); // Show the success message
        fetchIncident(); // This should now run
      }
    } catch (error) {
      console.error("❌ Failed to mark incident as treated:", error);
      toast.error("Failed to mark incident as treated");
    } finally {
      setMarkingAsTreated(false);
    }
  };

  const handlePutOnHoldModal = async () => {
    if (!incident?.assignedStation || incident?.slaStatus === "OnHold") {
      return;
    }

    setPuttingOnHold(true);

    try {
      const requestBody = {
        incidentId: id,
        stationId: incident.assignedStation,
      };

      const res = await userRequest(token).patch(
        `/incident/put-on-hold/${id}`,
        requestBody
      );

      // Check for the message instead of success
      if (res.data.message) {
        console.log("Incident put on hold successfully");
        toast.success(res.data.message); // Show the success message
        fetchIncident();
      }
    } catch (error) {
      console.error("❌ Failed to put incident on hold:", error);
      toast.error("Failed to put incident on hold");
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

  // const getStations = async () => {
  //   try {
  //     const res = await userRequest(token).get(`/incident/${id}/stations`);
  //     setStations(res.data.data.stations);
  //   } catch (error) {
  //     console.error("❌ Failed to fetch incident:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchAdminRoles = async () => {
  //   try {
  //     const res = await userRequest(token).get(
  //       "/options/adminRoles/all"
  //     );

  //     setAdminRoles(res.data?.data?.adminRoles || []);
  //   } catch (err) {
  //     console.error("❌ Failed to fetch admin roles:", err);
  //   }
  // };

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
      const res = await userRequest(token).get(`/incident/${id}`);
      setIncident(res.data.data.incident);
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
          `/incident/${id}/pastReport?page=1&size=10`
        );
        setPastHistory(res.data.data.incidents.data);
      } catch (error) {
        console.error("❌ Failed to fetch incident:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAuditTrail = async () => {
      try {
        const res = await userRequest(token).get(
          `/incident/getAuditLogs/${id}`
        );
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
      getPossibleStations();
    }
  }, [id, token]);

  useEffect(() => {
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
                  General
                </div>
              </div>

              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {incident?.incidentType}
                </h3>
                <p className="text-gray-600 text-sm">{incident?.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-6 text-sm text-gray-500 px-5 mt-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 ${getAvatarColor(
                    incident?.user?.name
                  )} rounded-full flex items-center justify-center text-xs font-bold text-white`}
                >
                  {getAvatarInitial(incident?.user?.name)}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Reported By</div>
                  <div className="font-medium">{incident.user?.name}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Date Reported</div>
                <div className="font-medium">
                  {extractDate(incident.datePublished)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Time</div>
                <div className="font-medium">
                  {extractTime(incident.datePublished)}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Incident Type</div>
                <div className="font-medium">{incident.incidentType}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">SLA Status</div>
                <div className="font-medium">{incident.slaStatus}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Channel</div>
                <div className="font-medium">{incident.channel}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Priority</div>
                <div className="font-medium">{incident.priority}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Images Gallery Component
  const ImagesGallery = ({ images }) => {
    if (!images || images.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Incident Images
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group cursor-pointer  rounded-lg overflow-hidden aspect-square"
              onClick={() => openImageModal(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Incident image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png"; // Fallback image
                  e.target.alt = "Image failed to load";
                }}
              />
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Image Modal Component
  const ImageModal = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-screen p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <img
            src={imageUrl}
            alt="Incident image enlarged"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  // Function to render buttons based on role
  // Function to render buttons based on role - UPDATED VERSION
  const renderActionButtons = () => {
    const isIncidentInProgress = () => {
      const status = incident?.incidentStatus?.toLowerCase();
      return status === "new" || status === "inprogress";
    };

    // Check if incident is treated or closed
    const isIncidentTreated =
      incident?.incidentStatus?.toLowerCase() === "treated";
    const isIncidentClosed =
      incident?.incidentStatus?.toLowerCase() === "closed";

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

    // Disable assign button if incident is treated OR closed
    const isAssignDisabled = isIncidentTreated || isIncidentClosed;

    // Disable close button if incident is already closed
    const isCloseDisabled = isIncidentClosed;

    switch (currentUserRole) {
      case "Command Centre supervisor":
        return (
          <div className="space-y-3">
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isAssignDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleAssignTicketModal}
              disabled={isAssignDisabled}
              title={
                isIncidentTreated
                  ? "Cannot assign a treated incident"
                  : isIncidentClosed
                  ? "Cannot assign a closed incident"
                  : ""
              }
            >
              {isIncidentTreated
                ? "Treated"
                : isIncidentClosed
                ? "Closed"
                : incident?.assignedStation
                ? "Reassign Ticket"
                : "Assign Ticket"}
            </button>
            <button
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50"
              onClick={handleRejectTicketModal}
            >
              Reject Ticket
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
      case "Admin":
        return (
          <div className="space-y-3">
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isAssignDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleAssignTicketModal}
              disabled={isAssignDisabled}
              title={
                isIncidentTreated
                  ? "Cannot assign a treated incident"
                  : isIncidentClosed
                  ? "Cannot assign a closed incident"
                  : ""
              }
            >
              {isIncidentTreated
                ? "Treated"
                : isIncidentClosed
                ? "Closed"
                : "Assign Ticket"}
            </button>
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isCloseDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={handleCloseTicketModal}
              disabled={isCloseDisabled}
              title={isIncidentClosed ? "Incident is already closed" : ""}
            >
              {isIncidentClosed ? "Already Closed" : "Close Ticket"}
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
      {/* Image Modal */}
      <MediaModal
        isOpen={mediaModalOpen}
        mediaUrl={selectedMedia}
        onClose={closeMediaModal}
      />

      <div style={{ display: "none" }}>
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
      {closeTicketModal && (
        <CloseTicketModal
          handleCloseTicketModal={handleCloseTicketModal}
          closureReasons={closureReasons}
          handleConfirmCloseTicketModal={handleConfirmCloseTicketModal}
        />
      )}
      {assignTicketModal && (
        <AssignTicketModal
          handleAssignTicketModal={handleAssignTicketModal}
          stations={stations}
          handleAssignTicketSuccessModal={handleAssignTicketSuccessModal}
          assignedStation={incident.assignedStation}
        />
      )}
      {exportSuccessModal && (
        <ExportTicketSuccessModal
          handleExportSuccessModal={handleExportSuccessModal}
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
      {rejectTicketModal && (
        <RejectTicketGeneralModal
          handleRejectTicketModal={handleRejectTicketModal}
          handleRejectTicketSuccess={handleRejectTicketSuccess}
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
          <div className="lg:col-span-2 space-y-6" ref={reportRef}>
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
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">
                        Report Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {incident?.description}
                      </p>
                    </div>

                    {/* Images Section */}
                    {incident?.incidentImages &&
                      incident.incidentImages.length > 0 && (
                        <MediaGallery images={incident.incidentImages} />
                      )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Past SOS History" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <PastHistorySOS pastHistory={pastHistory} />
              </div>
            )}

            {activeTab === "Audit Trail" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <AuditTrailSection auditTrail={auditTrail} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons - Now Role Based */}
            {renderActionButtons()}

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Reported By</label>
                    <div className="font-medium">
                      {incident?.user?.name || "John Doe"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Phone Number
                    </label>
                    <div className="font-medium">
                      {incident?.user?.phoneNumber || "+234 81 34456666"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date Created
                    </label>
                    <div className="font-medium">
                      {extractDate(incident?.datePublished) || "16th May, 2025"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Submission Time
                    </label>
                    <div className="font-medium">
                      {extractTime(incident?.datePublished) || "8:00am"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="font-medium">
                      {incident?.incidentStatus ||
                        "Report received and under review"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <div className="font-medium text-sm">
                      {incident?.address || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                    <div className="font-medium">
                      {incident?.station?.formation || "Lorem Ipsum"}
                    </div>
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

export default GeneralDetails;
