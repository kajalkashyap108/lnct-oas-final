import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Assignment as TestsIcon,
  BarChart as ResultsIcon,
  Logout as LogoutIcon,
  AddCircle as CreateTestIcon,
} from "@mui/icons-material";
import { auth, db, getDoc, doc } from "../firebase";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isExcludedRoute = location.pathname === "/" || location.pathname === "/login";

  console.log("Navbar rendering - isExcludedRoute:", isExcludedRoute, "Path:", location.pathname);
  console.log("Navbar - isAdmin:", isAdmin);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Auth state changed - User UID:", user.uid);
        console.log("User email:", user.email);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role || "user";
            console.log("Fetched role:", role);
            console.log("User doc data:", userDoc.data());
            setIsAdmin(role === "admin");
          } else {
            console.log("User document does not exist for UID:", user.uid);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Error fetching user role:", err.message);
          setIsAdmin(false);
        }
      } else {
        console.log("No authenticated user");
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsOpen(open);
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const drawerContent = (
    <Box sx={{ width: 250, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Test App</Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {!isAdmin ? (
          <>
            <ListItem button onClick={() => handleNavigation("/user-dashboard")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation("/tests")}>
              <ListItemIcon>
                <TestsIcon />
              </ListItemIcon>
              <ListItemText primary="Tests" />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={() => handleNavigation("/admin-dashboard")}>
            <ListItemIcon>
              <CreateTestIcon />
            </ListItemIcon>
            <ListItemText primary="Create Test" />
          </ListItem>
        )}
        <ListItem button onClick={() => handleNavigation("/results")}>
          <ListItemIcon>
            <ResultsIcon />
          </ListItemIcon>
          <ListItemText primary="Results" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && !isExcludedRoute && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Test App
          </Typography>
        </Toolbar>
      </AppBar>
      {!isExcludedRoute && (
        <Box component="nav">
          {isMobile ? (
            <Drawer
              anchor="left"
              open={isOpen}
              onClose={toggleDrawer(false)}
              variant="temporary"
              ModalProps={{ keepMounted: true }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            <Drawer
              anchor="left"
              variant="permanent"
              sx={{
                "& .MuiDrawer-paper": {
                  width: 250,
                  boxSizing: "border-box",
                  top: "64px",
                  height: "calc(100% - 64px)",
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}
        </Box>
      )}
    </>
  );
};

export default Navbar;