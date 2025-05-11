import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField, Button, Typography, Box, Paper, Alert, Tabs, Tab
} from "@mui/material";
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, db, doc, setDoc, getDoc } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userDoc = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userDoc);
      const role = userSnap.exists() ? userSnap.data().role : "user";
      navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        role: "user",
        email: userCredential.user.email,
      });
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userDoc = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userDoc);
      if (!userSnap.exists()) {
        await setDoc(userDoc, {
          role: "user",
          email: userCredential.user.email,
        });
      }
      const role = userSnap.exists() ? userSnap.data().role : "user";
      navigate(role === "admin" ? "/admin-dashboard" : "/user-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" align="center" gutterBottom>
          Test App
        </Typography>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={tab === 0 ? handleSignIn : handleSignUp}
          >
            {tab === 0 ? "Sign In" : "Sign Up"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleGoogleSignIn}
          >
            Sign In with Google
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;