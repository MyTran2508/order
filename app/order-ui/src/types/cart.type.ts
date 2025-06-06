import { ICartItem, OrderTypeEnum, ITable, IUserInfo, IVoucher } from '@/types'

export interface ICartItemStore {
  cartItems: ICartItem | null
  lastModified: number | null
  isHydrated: boolean
  getCartItems: () => ICartItem | null
  addCustomerInfo: (owner: IUserInfo) => void
  removeCustomerInfo: () => void
  addApprovalBy: (approvalBy: string) => void
  addCartItem: (item: ICartItem) => void
  updateCartItemQuantity: (id: string, quantity: number) => void
  addNote: (id: string, note: string) => void
  addOrderNote: (note: string) => void
  addOrderType: (orderType: OrderTypeEnum) => void
  addTable: (table: ITable) => void
  removeTable: () => void
  addPaymentMethod: (paymentMethod: string) => void
  removeCartItem: (cartItemId: string) => void
  addVoucher: (voucher: IVoucher) => void
  removeVoucher: () => void
  clearCart: () => void
}
