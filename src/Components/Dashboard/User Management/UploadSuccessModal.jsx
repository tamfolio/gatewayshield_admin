import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadSuccessModal = ({successModal, handleSuccessModal}) => {
    const navigate = useNavigate();





  const handleStayOnPage = () => {
    handleSuccessModal();
  };

  const handleGoToDashboard = () => {
        navigate('/dashboard')
  };

  return (
    <>
      {successModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#101828B2] bg-opacity-70 transition-opacity"
            onClick={handleSuccessModal}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-sm sm:max-w-md mx-auto">
              <button
                onClick={handleSuccessModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="px-6 pt-8 pb-6 sm:px-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FADF] mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">
                     Upload successfully
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={handleStayOnPage}
                    className="w-full bg-blue-50 text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-blue-100"
                  >
                    Stay on Page
                  </button>

                  <button
                    onClick={handleGoToDashboard}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Redirect to Dashboard
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

export default UploadSuccessModal;
