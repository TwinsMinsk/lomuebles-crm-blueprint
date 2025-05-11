
import React from "react";
import { Navigate } from "react-router-dom";

const Orders: React.FC = () => {
  // Redirect to the new orders page
  return <Navigate to="/orders" replace />;
};

export default Orders;
