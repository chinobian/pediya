import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MesaView } from './pages/MesaView'
import { AdminLayout } from './components/AdminLayout'
import { AdminView } from './pages/AdminView'
import { AdminMenu } from './pages/AdminMenu'
import { AdminMesas } from './pages/AdminMesas'
import { AdminQR } from './pages/AdminQR'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mesa/1" replace />} />
        <Route path="/mesa/:numero" element={<MesaView />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminView />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="mesas" element={<AdminMesas />} />
          <Route path="qr" element={<AdminQR />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
