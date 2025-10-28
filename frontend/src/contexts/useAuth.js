import { createContext, useContext, useEffect, useState } from "react";
import { is_authenticated, register, login } from "../endpoint/api";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState({ is_admin: false, is_staff: false });

  const nav = useNavigate();
  const location = useLocation();

  // Load from localStorage on app start
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";
    const storedRole = JSON.parse(localStorage.getItem("userRole"));

    if (storedUsername && storedAuth) {
      setUsername(storedUsername);
      setIsAuthenticated(storedAuth);
      if (storedRole) setUserRole(storedRole);
    }
    setLoading(false);
  }, []);

  const get_authenticated = async () => {
    try {
      const success = await is_authenticated();
      setIsAuthenticated(success);

      if (!success) {
        // Clear localStorage if session expired
        localStorage.removeItem("username");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login_user = async (usernameInput, password) => {
    try {
      const data = await login(usernameInput, password);

      if (data.success) {
        setIsAuthenticated(true);
        setUsername(data.username);
        setUserRole({
          is_admin: data.is_admin,
          is_staff: data.is_staff,
        });

        // Save in localStorage
        localStorage.setItem("username", data.username);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "userRole",
          JSON.stringify({ is_admin: data.is_admin, is_staff: data.is_staff })
        );

        return {
          success: true,
          username: data.username,
          is_admin: data.is_admin,
          is_staff: data.is_staff,
        };
      }

      setIsAuthenticated(false);
      return { success: false };
    } catch (error) {
      setIsAuthenticated(false);
      nav("/login");
      return { success: false };
    }
  };

  const register_user = async (username, email, password, Cpassword) => {
    if (password === Cpassword) {
      try {
        await register(username, email, password);
        alert("Registration successful");
      } catch (error) {
        alert("Registration failed");
      }
    } else {
      alert("Password does not match");
    }
  };

  const logout_user = () => {
    // Clear everything on logout
    setIsAuthenticated(false);
    setUsername("");
    setUserRole({ is_admin: false, is_staff: false });
    localStorage.removeItem("username");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    nav("/login");
  };

  useEffect(() => {
    get_authenticated();
  }, [location.pathname]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        username,
        userRole,
        login_user,
        register_user,
        logout_user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
