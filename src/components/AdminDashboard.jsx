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
  const [generationMessage, setGenerationMessage] = useState("");
  const [numQuestions, setNumQuestions] = useState(5); // Default to 5 questions
  const [questionType, setQuestionType] = useState("General Knowledge"); // Default question type
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

  const generateAIQuestions = async () => {
    try {
      // Attempt to get API key from environment variable
      let apiKey = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY;

      // Fallback to prompt if environment variable is not set
      if (!apiKey) {
        apiKey = prompt("Gemini API key not found in environment variables. Please enter your Google Gemini API key:");
        if (!apiKey) {
          throw new Error("API key is required to generate questions.");
        }
      }

      // Validate number of questions
      if (numQuestions < 1 || numQuestions > 20) {
        throw new Error("Please enter a number of questions between 1 and 20.");
      }

      // Validate question type
      if (!questionType.trim()) {
        throw new Error("Please specify the type of questions to generate.");
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${numQuestions} ${questionType} quiz questions. Each question should have a text, 4 options, and the index of the correct answer (0-3). Return *only* a JSON array with no additional text, e.g., [{"text": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correctAnswer": 2}, ...].`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000 // Increased to handle more questions
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      // Log the raw response for debugging
      console.log("Raw Gemini API response:", generatedText);
      console.log("Response length:", generatedText.length);

      // Enhanced cleaning to ensure valid JSON
      let cleanedText = generatedText
        .replace(/```json\n?/, '') // Remove ```json at the start
        .replace(/\n?```/, '')      // Remove ``` at the end
        .replace(/^\s*|\s*$/g, '')  // Remove leading/trailing whitespace
        .replace(/\n/g, '')         // Remove newlines
        .replace(/^\[|\]$/g, '');   // Remove outer brackets if they cause issues

      // Attempt to parse, with fallback to extract JSON portion
      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(`[${cleanedText}]`); // Ensure it's wrapped as an array
      } catch (jsonError) {
        console.error("JSON parsing failed. Raw cleaned text:", cleanedText);
        console.error("Error position context:", cleanedText.substring(Math.max(0, 3226 - 50), Math.min(cleanedText.length, 3226 + 50)));
        throw new Error(`Invalid JSON format: ${jsonError.message} at position ${jsonError.position || 'unknown'}`);
      }

      // Validate the parsed questions
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error("Invalid response format: Expected a non-empty array of questions.");
      }

      parsedQuestions.forEach((q, index) => {
        if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid question format at index ${index}: ${JSON.stringify(q)}`);
        }
      });

      setQuestions(parsedQuestions);
      setGenerationMessage(`${numQuestions} ${questionType} questions generated successfully using Gemini API!`);
      setTimeout(() => setGenerationMessage(""), 3000);
    } catch (err) {
      console.error("Error details:", err);
      setGenerationMessage(`Error generating questions: ${err.message}`);
      setTimeout(() => setGenerationMessage(""), 3000);
    }
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "tests"), {
        title: testTitle,
        duration,
        questions,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
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
    <Box sx={{ p: 3, maxWidth: "100%", overflowX: "hidden" }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Button variant="outlined" onClick={handleSignOut}>
          Sign Out
        </Button>
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
      <Box mt={2}>
        <Typography variant="subtitle1">Questions</Typography>
        <Box display="flex" gap={2} mt={1}>
          <TextField
            label="Number of Questions"
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            sx={{ width: "150px" }}
            inputProps={{ min: 1, max: 20 }}
          />
          <TextField
            label="Question Type (e.g., Science, History)"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" onClick={generateAIQuestions}>
            Generate Questions
          </Button>
        </Box>
      </Box>
      {generationMessage && (
        <Typography color={generationMessage.includes("Error") ? "error.main" : "success.main"} mt={1}>
          {generationMessage}
        </Typography>
      )}
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
              {q.options.map((opt, i) => (
                <MenuItem key={i} value={i}>{opt ? opt : `Option ${i + 1}`}</MenuItem>
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
        disabled={
          !testTitle ||
          duration <= 0 ||
          questions.length === 0 ||
          questions.some((q) => !q.text || q.options.some((o) => !o))
        }
      >
        Publish Test
      </Button>
      <Divider sx={{ my: 2 }} />
      <Button variant="contained" onClick={() => navigate("/results")}>
        View All Results
      </Button>
    </Box>
  );
};

export default AdminDashboard;