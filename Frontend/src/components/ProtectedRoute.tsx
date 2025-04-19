import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const ProtectedRoute = ({ children }: any) => {
  const [loading, setLoading] = useState(true); // State for loading status
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for authentication status
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/auth/check",
        {
          withCredentials: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log("Authenticated:", response.status);
      if (response.status === 200) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error, "reserror");
      if (error.code === "ERR_NETWORK") {
        setIsAuthenticated(true); // User is authenticated
      }
      if (error.response?.status === 403) {
        console.log("User not authenticated. Redirecting...");
        router.push("/login");
      } else {
        console.error("Error during auth check:", error);
      }
    } finally {
      setLoading(false); // Stop loading after the check is complete
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Render loading screen if still loading
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, children won't be rendered
  if (!isAuthenticated) {
    return null; // Optionally render a placeholder
  }

  return <>{children}</>;
};

// Inline styles for spinner and loading screen
const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #ccc",
    borderTop: "5px solid #0070f3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#333",
    fontWeight: "bold" as const,
  },
};

// Add CSS animation for spinner
if (typeof window !== "undefined") {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(
    `@keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }`,
    styleSheet.cssRules.length
  );
}

export default ProtectedRoute;
