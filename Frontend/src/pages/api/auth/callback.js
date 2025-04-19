import { useRouter } from "next/router";
import { useEffect } from "react";

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        if (response.ok) {
          router.push("/dashboard");
        } else {
          console.error("Authentication failed");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    handleCallback();
  }, [router]);

  return <p>Redirecting...</p>;
};

export default Callback;
