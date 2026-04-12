export interface MenuItem {
  readonly id: string
  readonly name: string
  readonly priceVnd: number
  readonly categoryId: string
  readonly imageUrl: string
  readonly tags: readonly string[]
}

export interface CartLine {
  readonly menuItemId: string
  readonly name: string
  readonly unitPriceVnd: number
  readonly quantity: number
  readonly imageUrl: string
  /** Ghi chú dòng (gửi lên POST đơn) */
  readonly lineNote: string
}
