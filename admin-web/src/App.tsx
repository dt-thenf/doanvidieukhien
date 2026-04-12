import { Navigate, Route, Routes } from 'react-router-dom'
import { PaymentQueuePage } from '@/pages/PaymentQueuePage'
import { TableOverviewPage } from '@/pages/TableOverviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TableOverviewPage />} />
      <Route path="/payment-queue" element={<PaymentQueuePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
