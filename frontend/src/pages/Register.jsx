import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className='flex flex-col md:flex-row w-full max-w-[800px] shadow-2xl rounded-lg overflow-hidden bg-white'>
        <div className="w-full md:flex-1 flex flex-col justify-center px-6 py-10 md:px-12">
          <h2 className="text-4xl md:text-5xl text-[#2f3e46] font-bold mb-6">Register</h2>
          
          {error && (
            <div className="text-red-500 mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#84a98c] outline-none transition-all"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#84a98c] outline-none transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#84a98c] outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full p-3 bg-[#84a98c] text-white font-bold rounded hover:bg-[#6b8e73] disabled:bg-[#dad7cd] transition-all shadow-md active:scale-95"
            >
              {loading ? 'Creating account...' : 'REGISTER'}
            </button>
          </form>
        </div>

        {/* Right Side: Welcome Panel (Full width on mobile, 40% on desktop) */}
        <div className="w-full md:w-[320px] bg-[#84a98c] flex flex-col justify-center items-center p-10 text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Hello Friend!</h1>
          <p className="mb-8 opacity-90 text-sm">Enter your personal details and start your journey with us</p>
          <Link 
            to="/login" 
            className="px-10 py-2 border-2 border-white rounded-full hover:bg-white hover:text-[#84a98c] transition-all font-bold uppercase text-xs tracking-widest"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;