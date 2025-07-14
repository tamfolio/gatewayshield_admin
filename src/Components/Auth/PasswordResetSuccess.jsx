export const PasswordResetSuccessStep = ({setCurrentStep}) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isAuthenticated={false} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-8">
              <img src="/assets/Logomark.svg" alt="" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Password reset
            </h2>
            <p className="text-gray-600 mb-2">
              Your password has been successfully reset.
            </p>
            <p className="text-gray-600">Click below to log in magically.</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );