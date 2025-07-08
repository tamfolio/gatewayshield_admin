import React from "react";
import { CheckCircle, TriangleAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UploadFailureModal = ({ failureModal, handleFailureModal }) => {
  const navigate = useNavigate();

  const handleStayOnPage = () => {
    handleFailureModal();
  };

  const handleGoToDashboard = () => {
    handleFailureModal();
    navigate("/dashboard/users/add");
  };

  return (
    <>
      {failureModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#101828B2] bg-opacity-70 transition-opacity"
            onClick={handleFailureModal}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto">
              <button
                onClick={handleFailureModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="px-6 pt-8 pb-6 sm:px-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0C7] mb-6">
                  <TriangleAlert className="h-8 w-8 text-[#DC6803]" />
                </div>

                <h3 className="text-center text-xl font-semibold text-gray-900 mb-3">
                  Upload Failed
                </h3>
                <h3 className="text-center text-md font-mornal text-gray-500 mb-6">
                  File too Large
                </h3>
               
                <div className="flex gap-2 ">
                  <button
                    onClick={handleStayOnPage}
                    className="w-1/2 bg-white border border-[#D5D7DA] text-[#414651] py-3 px-4 rounded-lg font-medium hover:bg-blue-100"
                  >
                   Cancel
                  </button>

                  <button
                    onClick={handleGoToDashboard}
                    className="w-1/2 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-300"
                  >
                   Re Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadFailureModal;
