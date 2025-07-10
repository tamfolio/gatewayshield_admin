import React, { useState } from "react";
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
import AuditTrailSection from "./AuditTrail";
import ExportReportModal from "./ExportReportModal";
import CloseTicketModal from "./CloseTicketModal";
import AssignTicketModal from "./AssignTicketModal";
import ExportTicketSuccessModal from "./ReportExportedSuccessModal";
import TicketAssignedSuccessModal from "./TicketAssignedSuccessModal";
import CloseTicketConfirmModal from "./ConfirmCloseTicketModal";

function SosDetails() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("Citizen Report");
  const [selectedReports, setSelectedReports] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [exportSuccessModal, setExportSuccessModal] = useState(false);
  const [closeTicketModal, setCloseTicketModal] = useState(false);
  const [assignTicketModal, setAssignTicketModal] = useState(false);
  const [assignTicketSuccessModal, setAssignTicketSuccessModal] =
    useState(false);
  const [confirmCloseTicketModal, setConfirmCloseTicketModal] = useState(true);

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
  //   const [selectedAll, setSelectedAll] = useState(false);

  //   const handleSelectAll = () => {
  //     setSelectedAll(!selectedAll);
  //     if (!selectedAll) {
  //       setSelectedReports(reports.map((report) => report.id));
  //     } else {
  //       setSelectedReports([]);
  //     }
  //   };

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const reports = {
    id: "RI0005667",
    status: "New",
    statusColor: "bg-green-500",
    type: "SOS",
    heading: "SOS HEADING",
    summary: "Report summary goes here lorem ipsum dolor...",
    reportedBy: "Olivia Rhye",
    avatar: "👤",
    dateReported: "02-04-2025",
    time: "12:00 AM",
    channel: "Mobile",
  };

  const StatusBadge = ({ status, color }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-full ${color} text-white text-xs font-medium px-3 py-1 text-center`}
      >
        {status}
      </div>
    </div>
  );

  const ReportCard = ({ report }) => {
    return (
      <div className="block bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden pb-3 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-start">
          <div className="flex flex-col w-full">
            <div className="flex">
              <div className="w-32 flex flex-col bg-white">
                <div className="flex bg-gray-100 items-center justify-center">
                  <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                    #{report.id}
                  </div>
                </div>

                <StatusBadge
                  status={report.status}
                  color={report.statusColor}
                />
                <div className="bg-gray-600 text-white text-xs font-medium px-3 py-1 text-center">
                  {report.type}
                </div>
              </div>

              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {report.heading}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{report.summary}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 px-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                  {report.avatar}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Reported By</div>
                  <div className="font-medium">{report.reportedBy}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Date Reported</div>
                <div className="font-medium">{report.dateReported}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Time</div>
                <div className="font-medium">{report.time}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Channel</div>
                <div className="font-medium">{report.channel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = ["Citizen Report", "Past SOS History", "Audit Trail"];

  return (
    <>
      {exportModal && (
        <ExportReportModal handleExportModal={handleExportModal} />
      )}
      {closeTicketModal && (
        <CloseTicketModal handleCloseTicketModal={handleCloseTicketModal} />
      )}
      {assignTicketModal && (
        <AssignTicketModal handleAssignTicketModal={handleAssignTicketModal} />
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
              <ReportCard report={reports} />
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
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tab Content */}
              <div className="px-6 pb-6">
                {activeTab === "Citizen Report" && (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Dolor enim eu tortor urna sed duis nulla. Aliquam
                      vestibulum, nulla odio nisl vitae. In aliquet pellentesque
                      aenean hac vestibulum turpis mi bibendum diam. Tempor
                      integer aliquam in vitae malesuada fringilla. Elit nisl in
                      eleifend sed nisl. Pulvinar at orci, proin imperdiet
                      commodo consectetur convallis risus.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Dolor enim eu tortor urna sed duis nulla. Aliquam
                      vestibulum, nulla odio nisl vitae. In aliquet pellentesque
                      aenean hac vestibulum turpis mi bibendum diam. Tempor
                      integer aliquam in vitae malesuada fringilla. Elit nisl in
                      eleifend sed nisl. Pulvinar at orci, proin imperdiet
                      commodo consectetur convallis risus.
                    </p>
                  </div>
                )}
                {activeTab === "Past SOS History" && (
                  <div className="text-gray-700">
                    <p>Past SOS history content would go here...</p>
                  </div>
                )}
                {activeTab === "Audit Trail" && <AuditTrailSection />}
              </div>
            </div>

            {/* Audio Recording Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="space-y-4">
                  {/* First Recording */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        New Recording
                      </span>
                      <span className="text-sm text-gray-600">00:30</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full h-12 bg-gray-100 rounded flex items-center px-4">
                          <div className="w-full flex items-center justify-center space-x-1">
                            {[...Array(50)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-0.5 bg-gray-400 ${
                                  i < 25
                                    ? "h-2"
                                    : i < 35
                                    ? "h-4"
                                    : i < 45
                                    ? "h-6"
                                    : "h-3"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                      <button className="flex items-center space-x-2 text-blue-600 text-sm">
                        <Play className="w-4 h-4" />
                        <span>play recording</span>
                      </button>
                    </div>
                  </div>

                  {/* Second Recording */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        New Recording
                      </span>
                      <span className="text-sm text-gray-600">00:30</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full h-12 bg-gray-100 rounded flex items-center px-4">
                          <div className="w-full flex items-center justify-center space-x-1">
                            {[...Array(50)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-0.5 bg-gray-400 ${
                                  i < 20
                                    ? "h-3"
                                    : i < 30
                                    ? "h-5"
                                    : i < 40
                                    ? "h-4"
                                    : "h-2"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
                      <button className="flex items-center space-x-2 text-red-600 text-sm">
                        <Square className="w-4 h-4" />
                        <span>stop recording</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700">
                Assign Ticket
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50">
                Close Ticket
              </button>
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50">
                Export Report
              </button>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border">
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
            </div>

            {/* Citizen Feedback */}
            <div className="bg-white rounded-lg shadow-sm border">
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
            </div>

            {/* Internal Note */}
            <div className="bg-white rounded-lg shadow-sm border">
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
            </div>

            {/* Closure Note */}
            <div className="bg-white rounded-lg shadow-sm border">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SosDetails;
