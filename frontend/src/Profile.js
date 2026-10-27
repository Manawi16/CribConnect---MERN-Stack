import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fakeFetchUserRole = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { role: 'tenant' } });
    }, 300);
  });
};

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const fetchUserRole = async () => {
      try {
        const res = await fakeFetchUserRole();
        //const role = res.data.role?.toLowerCase();
        const role = "tenant";

        if (role === "landlord" || role === "tenant") {
          navigate(`/profileredirect?role=${role}`);
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [navigate]);

  return loading ? <div>Loading...</div> : null;
}

export default Profile;