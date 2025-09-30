import { useState } from 'react';
import { authAPI, healthCheck } from '../services/api';

export default function APITest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await healthCheck();
      setResult(`? Health Check: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`? Health Check Failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        userType: "donor"
      };
      const response = await authAPI.register(userData);
      setResult(`? Registration: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`? Registration Failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const credentials = {
        email: "test@example.com",
        password: "password123"
      };
      const response = await authAPI.login(credentials);
      setResult(`? Login: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`? Login Failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <h3 className="font-bold mb-2">API Debug Test</h3>
      <div className="flex gap-2 mb-4">
        <button onClick={testHealth} disabled={loading} className="bg-blue-500 text-white px-3 py-1 rounded">
          Test Health
        </button>
        <button onClick={testRegister} disabled={loading} className="bg-green-500 text-white px-3 py-1 rounded">
          Test Register
        </button>
        <button onClick={testLogin} disabled={loading} className="bg-purple-500 text-white px-3 py-1 rounded">
          Test Login
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {result && (
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
