import { supabase } from "../lib/supabase";
import { createContext, useContext, useState, useEffect } from 'react'

//stores the authentication information globally
const AuthContext = createContext({})

//access authContext from anywhere in react componant tree
export const useAuth = ()=> useContext(AuthContext)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=> {
        //check active session (if I am already logged in or not)
        supabase.auth.getSession().then(({data: {session}}) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        //Listen for auth changes (keep track of my log in log out)
        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session)=> {
            setUser(session?.user ?? null)
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

