
import React from "react";
import { Navigate } from "react-router-dom";

const Orders: React.FC = () => {
  // Redirect to the orders page
  return <Navigate to="/orders/list" replace />;
};

export default Orders;
