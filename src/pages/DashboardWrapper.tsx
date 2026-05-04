import { Navigate } from "react-router-dom";
import { isExhibitorAuthenticated } from "@/lib/exhibitorAuth";

const DashboardWrapper = () => {
  if (isExhibitorAuthenticated()) {
    return <Navigate to="/exhibitor/panel" replace />;
  }

  // Non-exhibitors should not see a dashboard — redirect to homepage
  return <Navigate to="/" replace />;
};

export default DashboardWrapper;
