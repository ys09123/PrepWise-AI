import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {signIn} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async(e)=> {
    e.preventDefault()
    setError('')
    setLoading(true)

    const {error} = await signIn(email, password)

    if(error){
        setError(error.message)
        setLoading(false)
    }else {
        navigate('/dashboard')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className='flex flex-col md:flex-row w-full max-w-200 min-h-125 shadow-xl rounded-lg overflow-hidden'>
            
            <div className="w-full md:w-75 bg-[#84a98c] flex flex-col justify-center items-center p-8 text-center text-white">
                <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                <p className="mb-8 opacity-90">Don't have an account??</p>
                <Link 
                    to="/register" 
                    className="px-10 py-2 border-2 border-white rounded-full hover:bg-white hover:text-[#84a98c] transition-all font-bold uppercase text-xs tracking-widest"
                >
                    Register
                </Link>
            </div>

            <div className="w-full md:w-125 bg-white flex flex-col justify-center px-6 py-10 md:px-12">
                <h2 className="text-5xl text-[#2f3e46] font-bold mb-4">Login</h2>
                
                {error && (
                    <div className="text-red-500 mb-2.5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3.75">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#84a98c]"
                        />
                    </div>

                    <div className="mb-3.75">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#84a98c]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-2.5 bg-[#84a98c] text-white rounded font-medium hover:shadow-xl/30 disabled:bg-[#dad7cd] disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login