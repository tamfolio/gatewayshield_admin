import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { userRequest } from "../../../requestMethod";
import useAccessToken from "../../../Utils/useAccessToken";
import { data, Link } from "react-router-dom";
import { extractDate, extractTime } from "../../../Utils/dateUtils";
import { useNavigate } from "react-router-dom";

const CrimeDetailsSection = ({
  selectedLga,
  setSelectedLga,
  crimeData = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const token = useAccessToken();
  const [loading, setLoading] = useState(true);
  const [CrimeDetails, setCrimeDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCrimeDetails = async () => {
      try {
        const res = await userRequest(token).get(`/crimeMap/all`);
        setCrimeDetails(res.data.data.crimeMaps[selectedLga]?.crimes);
        console.log(CrimeDetails);
      } catch (error) {
        console.error("❌ Failed to fetch incident:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && selectedLga) {
      fetchCrimeDetails();
    }
  }, [token, selectedLga]);

  const dataToUse = CrimeDetails?.length > 0 ? crimeData : CrimeDetails;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(dataToUse?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = dataToUse?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  console.log(currentPageData);

  return (
    selectedLga && (
      <div className="w-full max-w-6xl mx-auto mt-8 bg-white border-solid border-[1px]  shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">{selectedLga}</h3>
        </div>

        {/* Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-600">
                  <th className="pb-3 pr-4">Crime Type</th>
                  <th className="pb-3 pr-4">Date Reported</th>
                  <th className="pb-3 pr-4">Last updated</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {CrimeDetails?.map((crime) => (
                  <tr
                    key={crime.incidentId}
                    className="border-t border-gray-100"
                  >
                    {/* <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(crime.priority)}`}></div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{crime.location}</div>
                        <div className="text-xs text-gray-500">{crime.description}</div>
                      </div>
                    </div>
                  </td> */}
                    <td className="py-3 pr-4 text-sm text-gray-800">
                      {crime.crimetype}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">
                      {extractDate(crime.dateReported)}{" "}
                      {extractTime(crime.dateReported)}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">
                    {extractDate(crime.lastUpdated)}{" "}
                      {extractTime(crime.lastUpdated)}
                    </td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <Link to={`/dashboard/reports/sos/${crime.incidentId}`}>
                          View More
                        </Link>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {getVisiblePages().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-sm rounded ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Show dots and last page if needed */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-400 px-1">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 text-sm rounded text-gray-600 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default CrimeDetailsSection;
