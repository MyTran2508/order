import { PaymentMethod } from '@/constants'
import { IBranch } from './branch.type'
import { ICatalog } from './catalog.type'
import { IUserInfo } from './user.type'

export interface IAuthStore {
  slug?: string
  token?: string
  refreshToken?: string
  expireTime?: string
  expireTimeRefreshToken?: string
  authorities?: string[]
  isRefreshing?: boolean
  isAuthenticated: () => boolean
  setSlug: (slug: string) => void
  setToken: (token: string) => void
  setRefreshToken: (refreshToken: string) => void
  setExpireTime: (expireTime: string) => void
  setExpireTimeRefreshToken: (expireTimeRefreshToken: string) => void
  setIsRefreshing: (isRefreshing: boolean) => void
  setLogout: () => void
}

export interface IBranchStore {
  branch?: IBranch
  setBranch: (branch?: IBranch) => void
  removeBranch: () => void
}

export interface ICatalogStore {
  catalog?: ICatalog
  setCatalog: (catalog?: ICatalog) => void
  removeCatalog: () => void
}

export interface IProductNameStore {
  productName?: string
  setProductName: (productName?: string) => void
  removeProductName: () => void
}

export interface IRequestDishStore {
  requestQueueSize: number
  incrementRequestQueueSize: () => void
  decrementRequestQueueSize: () => void
}

export interface IThemeStore {
  theme: string
  setTheme: (theme: string) => void
  getTheme: () => string
}

export interface IUserStore {
  userInfo: IUserInfo | null
  setUserInfo: (userInfo: IUserInfo) => void
  isVerifyingEmail: boolean
  isVerifyingPhoneNumber: boolean
  emailVerificationStatus: {
    expiresAt: string // ISO string timestamp when OTP expires
    slug?: string // verification slug from response
  } | null
  phoneNumberVerificationStatus: {
    expiresAt: string // ISO string timestamp when OTP expires
    slug?: string // verification slug from response
  } | null
  setPhoneNumberVerificationStatus: (
    emailVerificationStatus: {
      expiresAt: string // ISO string timestamp when OTP expires
    } | null,
  ) => void
  setEmailVerificationStatus: (
    emailVerificationStatus: {
      expiresAt: string // ISO string timestamp when OTP expires
      slug?: string // verification slug from response
    } | null,
  ) => void
  getEmailVerificationStatus: () => {
    expiresAt: string // ISO string timestamp when OTP expires
    slug?: string // verification slug from response
  } | null
  getPhoneNumberVerificationStatus: () => {
    expiresAt: string // ISO string timestamp when OTP expires
    slug?: string // verification slug from response
  } | null
  getUserInfo: () => IUserInfo | null
  getIsVerifyingEmail: () => boolean
  getIsVerifyingPhoneNumber: () => boolean
  setIsVerifyingEmail: (isVerifyingEmail: boolean) => void
  setIsVerifyingPhoneNumber: (isVerifyingPhoneNumber: boolean) => void
  removeUserInfo: () => void
  clearUserData: () => void
}

export interface IPaymentMethodStore {
  paymentMethod: PaymentMethod
  setPaymentMethod: (paymentMethod: PaymentMethod) => void
  orderSlug: string
  setOrderSlug: (orderSlug: string) => void
  qrCode: string
  setQrCode: (qrCode: string) => void
  paymentSlug: string
  setPaymentSlug: (paymentSlug: string) => void
  clearPaymentData: () => void
  clearStore: () => void
}

export interface IPaymentStore {
  paymentMethod: PaymentMethod
  setPaymentMethod: (paymentMethod: PaymentMethod) => void
  orderSlug: string
  setOrderSlug: (orderSlug: string) => void
  qrCode: string
  setQrCode: (qrCode: string) => void
  paymentSlug: string
  setPaymentSlug: (paymentSlug: string) => void
  clearStore: () => void
}
