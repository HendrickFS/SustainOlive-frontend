import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {  Login } from './pages/Login'
import { Home } from './pages/Home'
import { Models } from './pages/Models'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/models" element={<Models />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
