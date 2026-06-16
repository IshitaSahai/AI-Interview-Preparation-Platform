import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link, useLocation } from 'react-router'
import {useAuth} from '../hooks/useAuth'
// import { useNavigate } from 'react-router'

const Login=()=>{
    const location = useLocation();

const from = location.state?.from?.pathname || "/";
    const {loading,handleLogin}=useAuth()
    const navigate=useNavigate()

    const [email, setEmail]=useState("")
    const [password, setPassword]=useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({email,password})
        navigate(from, { replace: true });
    }

    if(loading){
        return (<main><h1>Loading.......</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
<div className="input-group">
    <label htmlFor="email">Email</label>
    <input 
    onChange={(e) => {setEmail(e.target.value)}}
    type="email" id='email' name='email' placeholder='Enter email address' />
</div>
<div className="input-group">
    <label htmlFor="email">Password</label>
    <input
    onChange={(e) => {setPassword(e.target.value)}}
    type="password" id='password' name='password' placeholder='Enter password' />
</div>
<button className='button primary-button'>Login</button>
                </form>

                  <p>Don't have an account?" <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    )
}

export default Login