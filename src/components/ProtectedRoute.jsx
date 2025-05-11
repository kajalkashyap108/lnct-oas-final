import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db, getDoc, doc } from "../firebase";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children, role }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserRole(userDoc.exists() ? userDoc.data().role : "user");
      }
      setLoading(false);
    };
    checkUserRole();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }

  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

export default ProtectedRoute;