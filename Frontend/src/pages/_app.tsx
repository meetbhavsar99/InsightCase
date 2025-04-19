import ProtectedRoute from "@/components/ProtectedRoute";
import "@/styles/globals.css";

function MyApp({ Component, pageProps, router }) {
  const noAuthRequired = ["/login"];
  return noAuthRequired.includes(router.pathname) ? (
    <Component {...pageProps} />
  ) : (
    <ProtectedRoute>
      <Component {...pageProps} />
    </ProtectedRoute>
  );
}

export default MyApp;
