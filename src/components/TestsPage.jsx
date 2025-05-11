import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { db, collection, getDocs } from "../firebase";

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsSnapshot = await getDocs(collection(db, "tests"));
        const testsList = testsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched tests:", testsList);
        setTests(testsList);
      } catch (err) {
        console.error("Error fetching tests:", err.message);
      }
    };
    fetchTests();
  }, []);

  const handleTakeTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Tests
      </Typography>
      {tests.length === 0 ? (
        <Typography>No tests available.</Typography>
      ) : (
        <List>
          {tests.map((test) => (
            <ListItem key={test.id} divider>
              <ListItemText primary={test.title} />
              <Button
                variant="contained"
                onClick={() => handleTakeTest(test.id)}
              >
                Take Test
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TestsPage;