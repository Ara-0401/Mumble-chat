import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import {AuthProvider} from './Context/AuthContext.jsx'
import {UserProvider} from './Context/UserContext.jsx'
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <UserProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </UserProvider>
  </AuthProvider>
)
