import React, { useState } from "react";
import SignIn from "./Login";
import Navbar from "../Navbar";
import { SignUpOtp } from "./Otp";
import { EmailVerified } from "./EmailVerified";
import { SetNewPassword } from "./SetPassword";
import { PasswordResetSuccess } from "./PasswordResetComplete";

function LoginCentral() {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div>
      <Navbar />
      {currentPage === 1 && <SignIn setCurrentPage={setCurrentPage} />}
      {currentPage === 2 && <SignUpOtp setCurrentPage={setCurrentPage}/>}
      {currentPage === 3 && <EmailVerified setCurrentPage={setCurrentPage}/>}
      {currentPage === 4 && <SetNewPassword setCurrentPage={setCurrentPage}/>}
      {currentPage === 5 && <PasswordResetSuccess setCurrentPage={setCurrentPage}/>}
    </div>
  );
}

export default LoginCentral;
