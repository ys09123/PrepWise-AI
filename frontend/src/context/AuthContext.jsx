import { supabase } from "../lib/supabase";
import { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext({})

export const useAuth = ()=> useContext(AuthContext)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    // Tracks whether auth has been resolved at least once.
    // Prevents the loading spinner from re-appearing on every token refresh or sign-out.
    const initialized = useRef(false)

    useEffect(()=> {
        // onAuthStateChange fires immediately with INITIAL_SESSION on mount,
        // giving us the cached session without a separate getSession() call.
        // This is the Supabase-recommended single-source-of-truth pattern.
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session)=> {
            setUser(session?.user ?? null)
            if (!initialized.current) {
                setLoading(false)
                initialized.current = true
            }
        })
        return ()=> subscription.unsubscribe();
    }, []);

    const signUp = async(email, password, name) => {
        const {data, error} = await supabase.auth.signUp({
            email,
            password, 
            options: {
                data: {name}
            }
        })
        return {data, error};
    }

    const signIn = async(email, password) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password, 
        })
        return {data, error};
    }

    const signOut = async() => {
        const {error} = await supabase.auth.signOut()
        return {error};
    }

    const value = {user, signUp, signIn, signOut, loading}

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

