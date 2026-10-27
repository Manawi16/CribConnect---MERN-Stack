// /pages/ProfileRedirect.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProfileRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const isNew = localStorage.getItem("isNewUser") === "true";
    const role = localStorage.getItem("role");

    if (!user) {
      navigate("/login"); // Not logged in
      return;
    }

    if (isNew) {
      localStorage.removeItem("isNewUser");

      if (role === "Landlord") {
        navigate("/LandlordForm");
      } else if (role === "Tenant") {
        navigate("/TenantForm");
      } else {
        navigate("/dashboard"); // fallback
      }
    } else {
      // This line ensures clicking Profile later still opens the form
      if (role === "Landlord") {
        navigate("/LandlordForm");
      } else if (role === "Tenant") {
        navigate("/TenantForm");
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  return null;
}

export default ProfileRedirect;
