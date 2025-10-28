import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './routes/login';
import { ChakraBaseProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/useAuth';
import PrivateRoute from './components/private_routes';
import Register from './routes/register';
import Dashboard from './routes/Dashboard';
import RangerDashboard from './routes/RangerDashboard';
import Users from './routes/Users';
import Layout from './components/Layout'; // import the new Layout

function App() {
  return (
    <ChakraBaseProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Private routes with Sidebar + Header */}
            <Route path='/' element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path='/ranger' element={<PrivateRoute><RangerDashboard /></PrivateRoute>} />
            <Route path='/users' element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraBaseProvider>
  );
}

export default App;
