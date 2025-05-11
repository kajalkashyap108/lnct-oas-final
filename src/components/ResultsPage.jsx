import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography, Box, List, ListItem, ListItemText, Button, Divider, Alert, CircularProgress
} from "@mui/material";
import { auth, db, getDocs, collection, getDoc, doc, query, where } from "../firebase";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Check user role
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        const role = userDoc.exists() ? userDoc.data().role : "user";
        console.log("User role:", role); // Debug log
        setIsAdmin(role === "admin");

        // Fetch results
        let resultsQuery;
        if (role === "admin") {
          resultsQuery = collection(db, "results"); // Fetch all results for admin
        } else {
          resultsQuery = query(
            collection(db, "results"),
            where("userId", "==", auth.currentUser.uid)
          );
        }

        const querySnapshot = await getDocs(resultsQuery);
        const fetchedResults = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched results:", fetchedResults); // Debug log
        setResults(fetchedResults);

        // Fetch emails for admin view
        if (role === "admin") {
          const emailMap = { ...userEmails };
          for (const result of fetchedResults) {
            if (!emailMap[result.userId]) {
              try {
                const userDoc = await getDoc(doc(db, "users", result.userId));
                emailMap[result.userId] = userDoc.exists()
                  ? userDoc.data().email || "No Email"
                  : "Unknown User";
              } catch (err) {
                console.error(`Error fetching email for user ${result.userId}:`, err);
                emailMap[result.userId] = "Error Fetching Email";
              }
            }
          }
          console.log("Email Map:", emailMap); // Debug log
          setUserEmails(emailMap);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(`Error fetching results: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchResults();
    } else {
      setError("User not authenticated.");
      setLoading(false);
    }
  }, []); // Removed userEmails from dependencies to prevent infinite loop

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">Test Results</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {results.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No results found.</Typography>
      ) : (
        <List>
          {results.map((result) => (
            <Box key={result.id}>
              <ListItem>
                <ListItemText
                  primary={result.testTitle}
                  secondary={
                    <>
                      Score: {result.score}/{result.total} (
                      {((result.score / result.total) * 100).toFixed(2)}%)
                      {isAdmin &&
                        ` | Email: ${
                          userEmails[result.userId] || (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                          )
                        }`}
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}
      <Button
        variant="contained"
        onClick={() => navigate(isAdmin ? "/admin-dashboard" : "/user-dashboard")}
        sx={{ mt: 2 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ResultsPage;