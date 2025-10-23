import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

import { Login } from './pages/Login'
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
import { AlertsConfigPage } from './pages/AlertsConfigPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/models" element={<PrivateRoute><Models /></PrivateRoute>} />
        <Route path="/new-model" element={<PrivateRoute><NewModelPage /></PrivateRoute>} />
        <Route path="/edit-model/:thingId" element={<PrivateRoute><EditModelPage /></PrivateRoute>} />
        <Route path="/model-info/:thingId" element={<PrivateRoute><ModelInfoPage /></PrivateRoute>} />
        <Route path="/models-data" element={<PrivateRoute><ModelsDataPage /></PrivateRoute>} />
        <Route path="/all-events" element={<PrivateRoute><AllEventsPage /></PrivateRoute>} />
        <Route path="/devices" element={<PrivateRoute><DeviceListPage /></PrivateRoute>} />
        <Route path="/device-data/:thingId" element={<PrivateRoute><DeviceDataPage /></PrivateRoute>} />
        <Route path="/device-events/:thingId" element={<PrivateRoute><DeviceEventsPage /></PrivateRoute>} />
        <Route path="/alerts-config" element={<PrivateRoute><AlertsConfigPage /></PrivateRoute>} />
        <Route path="/user-management" element={<PrivateRoute><UserManagementPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
