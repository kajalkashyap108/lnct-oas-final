import { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { auth, db, collection, getDocs, query, where } from "../firebase";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserDashboard = () => {
  const [userResults, setUserResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("useEffect triggered");
    const fetchData = async () => {
      try {
        const userResultsQuery = query(
          collection(db, "results"),
          where("userId", "==", auth.currentUser.uid)
        );
        const userResultsSnapshot = await getDocs(userResultsQuery);
        const userResultsList = userResultsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("User results:", userResultsList);
        setUserResults(userResultsList);
      } catch (err) {
        console.error("Error fetching results:", err.message);
        setError(err.message);
      }
    };

    if (auth.currentUser) {
      console.log("Fetching results for user:", auth.currentUser.uid);
      fetchData();
    } else {
      console.log("No authenticated user");
      setError("User not authenticated");
    }
  }, []); // Empty dependency array to prevent re-renders

  // Prepare data for user's scores chart
  const userScoresData = {
    labels: userResults.map((result) => result.testTitle || `Test ${result.testId}`),
    datasets: [
      {
        label: "Your Score",
        data: userResults.map((result) => {
          const percentage = result.total > 0 ? (result.score / result.total) * 100 : 0;
          return Number(percentage.toFixed(2)); // Ensure 100% for perfect scores
        }),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  console.log("Chart data:", userScoresData);

  return (
    <Box sx={{ p: 3, maxWidth: "100%", overflow: "hidden" }}>
      <Typography variant="h4" gutterBottom>
        Your Performance
      </Typography>
      <Paper sx={{ p: 3, maxWidth: "100%", height: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Your Test Scores
        </Typography>
        {error ? (
          <Typography color="error">Error: {error}</Typography>
        ) : userResults.length === 0 ? (
          <Typography>No results available.</Typography>
        ) : (
          <Box sx={{ height: "400px", width: "100%", position: "relative" }}>
            <Bar
              data={userScoresData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Your Test Scores (%)" },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y}%`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserDashboard;