import React from 'react';
import { useSelector } from 'react-redux';
import UserHub from '../user-profile/UserHub';

const ProfilePage = () => {
  const userName = useSelector((state) => state.user?.currentUser?.admin);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <UserHub userName={userName} />
    </div>
  );
};

export default ProfilePage;