// src/hooks/useAccessToken.js
import { useSelector } from "react-redux";

const useAccessToken = () => {
  return useSelector(
    (state) => state.user?.currentUser?.tokens?.access?.token
  );
};

export default useAccessToken;
