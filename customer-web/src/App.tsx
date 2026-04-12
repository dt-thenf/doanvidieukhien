import { Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { TableSessionProvider } from '@/context/TableSessionContext'
import { CartPage } from '@/pages/CartPage'
import { MenuPage } from '@/pages/MenuPage'

export default function App() {
  return (
    <TableSessionProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/t/:tableCode" element={<MenuPage />} />
          <Route path="/t/:tableCode/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </TableSessionProvider>
  )
}
