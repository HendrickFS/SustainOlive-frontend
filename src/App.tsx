import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {  Login } from './pages/Login'
import { Home } from './pages/Home'
import { Models } from './pages/Models'
import { NewModelPage } from './pages/NewModelPage';
import { EditModelPage } from './pages/EditModelPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { ModelsDataPage } from './pages/ModelsDataPage';
import { AllEventsPage } from './pages/AllEventsPage';
import { DeviceListPage } from './pages/DeviceListPage';
import { DeviceDataPage } from './pages/DeviceDataPage';
import { DeviceEventsPage } from './pages/DeviceEventsPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/new-model" element={<NewModelPage />} />
        <Route path="/edit-model/:thingId" element={<EditModelPage />} />
        <Route path="/model-info/:thingId" element={<ModelInfoPage />} />
        <Route path="/models-data" element={<ModelsDataPage />} />
        <Route path="/all-events" element={<AllEventsPage />} />
        <Route path="/devices" element={<DeviceListPage />} />
        <Route path="/device-data/:thingId" element={<DeviceDataPage />} />
        <Route path="/device-events/:thingId" element={<DeviceEventsPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
