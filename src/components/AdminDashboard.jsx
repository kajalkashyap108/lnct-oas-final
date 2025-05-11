import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography, Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Divider
} from "@mui/material";
import { auth, db, addDoc, collection } from "../firebase";

const AdminDashboard = () => {
  const [testTitle, setTestTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([{ text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "tests"), {
        title: testTitle,
        duration,
        questions,
        createdAt: new Date(),
      });
      alert("Test created successfully!");
      setTestTitle("");
      setDuration(30);
      setQuestions([{ text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    } catch (err) {
      alert("Error creating test: " + err.message);
    }
  };

  const handleSignOut = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button variant="outlined" onClick={handleSignOut}>Sign Out</Button>
      </Box>
      <Typography variant="h6">Create New Test</Typography>
      <TextField
        fullWidth
        label="Test Title"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Duration (minutes)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        margin="normal"
      />
      {questions.map((q, qIndex) => (
        <Box key={qIndex} mt={2} p={2} border={1} borderRadius={4}>
          <TextField
            fullWidth
            label={`Question ${qIndex + 1}`}
            value={q.text}
            onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
            margin="normal"
          />
          {q.options.map((opt, oIndex) => (
            <TextField
              key={oIndex}
              fullWidth
              label={`Option ${oIndex + 1}`}
              value={opt}
              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
              margin="normal"
            />
          ))}
          <FormControl fullWidth margin="normal">
            <InputLabel>Correct Answer</InputLabel>
            <Select
              value={q.correctAnswer}
              onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
            >
              {q.options.map((_, i) => (
                <MenuItem key={i} value={i}>{`Option ${i + 1}`}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ))}
      <Button variant="outlined" onClick={addQuestion} sx={{ mt: 2 }}>
        Add Question
      </Button>
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ mt: 2, ml: 2 }}
        disabled={!testTitle || questions.some(q => !q.text || q.options.some(o => !o))}
      >
        Publish Test
      </Button>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        onClick={() => navigate("/results")}
      >
        View All Results
      </Button>
    </Box>
  );
};

export default AdminDashboard;