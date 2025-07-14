
export const CheckEmailStep = ({email,otp,handleOtpChange,handleOtpKeyDown,setCurrentStep}) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-8">
              <img src="/assets/Logomark.svg" alt="" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-600">
              We sent an OTP to {email || "olivia@untitledui.com"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    digit ? "border-blue-500 text-blue-600" : "border-gray-300"
                  }`}
                  maxLength={1}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Verify email
            </button>

            <div className="text-center">
              <span className="text-gray-600">Didn't receive the email? </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Click to resend
              </button>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );