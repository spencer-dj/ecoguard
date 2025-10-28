import { VStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import styles from './login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login_user } = useAuth();
  const nav = useNavigate();

  const handleLogin = async () => {
    const res = await login_user(username, password);

    if (res.success) {
      if (res.is_admin) {
        nav('/');
      } else if (res.is_staff) {
        nav('/ranger');
      } else {
        nav('/user-dashboard');
      }
    } else {
      alert('Invalid username or password');
    }
  };

  const handleNav = () => {
    nav('/register');
  };

  return (
    <div className={styles.loginPageWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.headerSection}>
          <h2 className={styles.welcomeText}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to continue your conservation journey</p>
        </div>
        
        <VStack spacing={4} align="stretch">
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="username"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">Username</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <button className={styles.loginButton} onClick={handleLogin}>
            <span className={styles.buttonText}>Login</span>
            <div className={styles.buttonLoader}></div>
          </button>

          <Text className={styles.signupText}>
            Don&apos;t have an account?{' '}
            <span className={styles.signupLink} onClick={handleNav}>Sign up</span>
          </Text>
        </VStack>
      </div>
    </div>
  );
};

export default Login;