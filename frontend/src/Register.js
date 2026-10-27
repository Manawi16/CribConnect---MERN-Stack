import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const userRole = query.get("role") || localStorage.getItem("userRole");
    if (userRole) {
      setRole(userRole);
      localStorage.setItem("userRole", userRole);
    } else {
      navigate("/"); // fallback if no role found
    }
  }, [location]);

  const handleGoogleRegister = async () => {
    // Edited by manawi
    // window.location.href = `/auth/google/signup/signup?role=${role}`;
    //     const res=await axios.get(`http://localhost:5000/api/auth/google/signup?role=${role}`);
    //     console.log(res);
  };

  const handlePhoneRegister = (e) => {
    e.preventDefault();
    // Handle form validation and send data to backend
   };
   

  return (
    <div className="register-page">
      <h1>Register as a {role}</h1>
      <button onClick={handleGoogleRegister}>Register with Google</button>
      <form onSubmit={handlePhoneRegister}>
        <input type="tel" placeholder="Enter Phone Number" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
