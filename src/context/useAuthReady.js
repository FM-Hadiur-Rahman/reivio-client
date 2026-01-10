// context/useAuthReady.js
import { useAuth } from "./AuthContext";

const useAuthReady = () => {
  const { loading } = useAuth();
  return !loading;
};

export default useAuthReady;
