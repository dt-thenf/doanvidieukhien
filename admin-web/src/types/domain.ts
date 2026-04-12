/** Khớp `dining_table.state` từ Pi (API). */
export type TableStateUi =
  | 'IDLE'
  | 'OPEN'
  | 'PAYMENT_REQUESTED'
  | 'SETTLED'

export interface TableOverviewRow {
  readonly id: string
  readonly label: string
  readonly state: TableStateUi
  readonly orderId: string | null
  readonly totalVnd: number
  readonly updatedAgo: string
}

export interface PaymentQueueRow {
  readonly tableLabel: string
  readonly tableCode: number
  readonly orderId: string
  readonly totalVnd: number
  readonly requestedAgo: string
  readonly paymentStatus: string
}

export interface OrderLinePreview {
  readonly name: string
  readonly note?: string
  readonly qty: number
}
