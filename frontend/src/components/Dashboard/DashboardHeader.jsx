import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const DashboardHeader = ({ user }) => {
  return (
    <header className="dashboard-header">
      <h1>Hello, {user.username}!</h1>
      <p>
        <FaMapMarkerAlt style={{ marginRight: '5px' }} /> 
        {user.location}
      </p>
    </header>
  );
};

export default DashboardHeader;
