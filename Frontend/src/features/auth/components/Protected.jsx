// import { useAuth } from "../hooks/useAuth";
// import React, { Children } from 'react';
// import { Navigate } from "react-router";

// const Protected=({children})=>{
//     const {loading,user}=useAuth()

//     if(loading){
//         return (<main><h1>Loading.......</h1></main>)
//     }
//     if(!user){
//         return <Navigate to={'/login'} />
//     }

//     return children
// }

// export default Protected

import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Protected = ({ children }) => {
    const { loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <main><h1>Loading...</h1></main>;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
};

export default Protected;