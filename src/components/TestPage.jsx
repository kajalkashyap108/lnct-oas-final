import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Paper, Alert
} from "@mui/material";
import { auth, db, getDoc, doc, addDoc, collection } from "../firebase";

const TestPage = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const testDoc = await getDoc(doc(db, "tests", testId));
        if (testDoc.exists()) {
          const testData = { id: testDoc.id, ...testDoc.data() };
          setTest(testData);
          setAnswers(new Array(testData.questions.length).fill(null));
          setTimeLeft(testData.duration * 60);
        } else {
          setError("Test not found.");
        }
      } catch (err) {
        setError("Error fetching test: " + err.message);
      }
    };
    fetchTest();
  }, [testId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswer = (qIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = Number(value);
    setAnswers(newAnswers);
  };

  // Submit test results
  const submitTest = async () => {
    if (!test || !auth.currentUser) return;
    try {
      let score = 0;
      test.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) score++;
      });

      // Save result to Firestore
      await addDoc(collection(db, "results"), {
        userId: auth.currentUser.uid,
        testId: test.id,
        testTitle: test.title,
        score,
        total: test.questions.length,
        answers,
        submittedAt: new Date(),
      });

      // Navigate to results page after successful save
      navigate("/results");
    } catch (err) {
      setError("Error submitting test: " + err.message);
    }
  };

  if (!test) {
    return (
      <Box>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading...</Typography>}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{test.title}</Typography>
      <Typography variant="h6">
        Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {test.questions.map((q, qIndex) => (
        <Paper key={qIndex} elevation={2} sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1">{qIndex + 1}. {q.text}</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[qIndex] ?? ""}
              onChange={(e) => handleAnswer(qIndex, e.target.value)}
            >
              {q.options.map((opt, oIndex) => (
                <FormControlLabel
                  key={oIndex}
                  value={oIndex}
                  control={<Radio />}
                  label={opt}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      ))}
      <Button
        variant="contained"
        onClick={submitTest}
        sx={{ mt: 2 }}
        disabled={answers.some((a) => a === null)}
      >
        Submit Test
      </Button>
    </Box>
  );
};

export default TestPage;