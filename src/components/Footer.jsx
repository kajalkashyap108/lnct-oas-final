import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: "auto", // Push footer to bottom of flex container
        backgroundColor: (theme) => theme.palette.grey[200],
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: (theme) => theme.palette.divider,
        width: "100%",
        position: "relative",
        zIndex: 1000, // Ensure footer is above content
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Test App. All rights reserved.
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Link
          href="/contact"
          color="inherit"
          underline="hover"
          sx={{ mx: 1 }}
        >
          Contact
        </Link>
        <Link
          href="/privacy"
          color="inherit"
          underline="hover"
          sx={{ mx: 1 }}
        >
          Privacy Policy
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;