import { useAuth } from "../context/AuthContext";

export default function AuthDebug() {
  const { user, token, loading } = useAuth();
  return (
    <pre style={{ padding: 16, background: "#111", color: "#0f0" }}>
      {JSON.stringify({ loading, hasToken: !!token, user }, null, 2)}
    </pre>
  );
}
