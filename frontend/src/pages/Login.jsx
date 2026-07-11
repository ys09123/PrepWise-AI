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

    try {
      const {error} = await signIn(email, password)
      if(error){
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#E5E5E5] rounded-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Welcome back</h1>
          <p className="text-sm text-[#999999] mt-1">Sign in to your account</p>
        </div>

        {error && (
          <p className="text-sm text-[#DC2626] mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-md bg-white placeholder:text-[#999999] focus:outline-none focus:border-[#18181B] transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-[#E5E5E5] rounded-md bg-white placeholder:text-[#999999] focus:outline-none focus:border-[#18181B] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register" className="text-sm text-[#555555] hover:text-[#111111] transition-colors">
            Don't have an account? Register →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login