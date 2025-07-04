import _ from 'lodash'
import { useEffect } from 'react'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { Button, ScrollArea } from '@/components/ui'
import { QuantitySelector } from '@/components/app/button'
import { CartNoteInput, CustomerSearchInput, OrderNoteInput } from '@/components/app/input'
import { useCartItemStore } from '@/stores'
import { CreateCustomerDialog, CreateOrderDialog } from '@/components/app/dialog'
import { calculateCartItemDisplay, calculateCartTotals, formatCurrency, showErrorToast, showToast } from '@/utils'
import { OrderTypeSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { StaffVoucherListSheet } from '@/components/app/sheet'
import { VOUCHER_TYPE } from '@/constants'

export function CartContent() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation(['toast'])
  const { removeVoucher, getCartItems } = useCartItemStore()
  const removeCartItem = useCartItemStore((state) => state.removeCartItem)

  const cartItems = getCartItems()

  const displayItems = calculateCartItemDisplay(
    cartItems,
    cartItems?.voucher || null
  )

  const cartTotals = calculateCartTotals(displayItems, cartItems?.voucher || null)
  // Kiểm tra voucher validity cho SAME_PRICE_PRODUCT
  useEffect(() => {
    if (cartItems?.voucher && cartItems.voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      const voucherProductSlugs = cartItems.voucher.voucherProducts?.map(vp => vp.product.slug) || []
      const hasValidProducts = cartItems.orderItems.some(item => voucherProductSlugs.includes(item.slug))

      if (!hasValidProducts) {
        showErrorToast(143422)
        removeVoucher()
      }
    }
  }, [cartItems, removeVoucher])

  // use useEffect to check if subtotal is less than minOrderValue of voucher
  useEffect(() => {
    if (cartItems && cartItems.voucher) {
      const { voucher, orderItems } = cartItems

      // Nếu không phải SAME_PRICE_PRODUCT thì mới cần check
      const shouldCheckMinOrderValue = voucher.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT

      if (shouldCheckMinOrderValue) {
        // Tính subtotal trực tiếp từ orderItems sau promotion, không sử dụng calculations để tránh circular dependency
        const subtotalAfterPromotion = orderItems.reduce((total, item) => {
          const original = item.originalPrice || item.price
          const afterPromotion = (original || 0) - (item.promotionDiscount || 0)
          return total + afterPromotion * item.quantity
        }, 0)

        if (subtotalAfterPromotion < (voucher.minOrderValue || 0)) {
          removeVoucher()
          showErrorToast(1004)
        }
      }
    }
  }, [cartItems, removeVoucher])

  const handleRemoveCartItem = (id: string) => {
    removeCartItem(id)
  }

  // check if customer info is removed, then check if voucher.isVerificationIdentity is true, then show toast
  useEffect(() => {
    const hasNoCustomerInfo = !cartItems?.ownerFullName && !cartItems?.ownerPhoneNumber
    const isPrivateVoucher = cartItems?.voucher?.isVerificationIdentity === true

    if (hasNoCustomerInfo && isPrivateVoucher) {
      showToast(tToast('toast.voucherVerificationIdentity'))
      removeVoucher()
    }
  }, [
    cartItems?.ownerFullName,
    cartItems?.ownerPhoneNumber,
    cartItems?.voucher?.isVerificationIdentity,
    tToast,
    removeVoucher
  ])

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col z-30 fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:w-[26%] xl:w-[25%] shadow-lg overflow-hidden bg-background transition-all duration-300"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 p-2 backdrop-blur-sm shrink-0 bg-background/95">
        <div className='flex items-center'>
          {cartItems?.orderItems && cartItems?.orderItems?.length > 0 && cartItems?.ownerFullName === '' && cartItems?.ownerPhoneNumber === '' && (
            <CreateCustomerDialog />
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-0 scrollbar-hidden">
        {/* Order type and customer selection */}
        <div className="grid grid-cols-1 gap-2 p-2 backdrop-blur-sm xl:pr-2 bg-background/95">
          <OrderTypeSelect />
          <CustomerSearchInput />
        </div>

        {/* Selected Table */}
        {/* {cartItems?.type === OrderTypeEnum.AT_TABLE && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 text-sm border-b bg-muted/50"
          >
            {cartItems?.table ? (
              <div className='flex items-center gap-2'>
                <p className="text-muted-foreground">{t('menu.selectedTable')}</p>
                <span className="px-3 py-1 font-medium text-white rounded-full shadow-sm bg-primary/90">
                  {t('menu.tableName')} {cartItems?.tableName}
                </span>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                {t('menu.noSelectedTable')}
              </p>
            )}
          </motion.div>
        )} */}
        <div className="flex flex-col gap-2 p-2">
          <AnimatePresence>
            {cartItems && cartItems?.orderItems?.length && cartItems?.orderItems?.length > 0 ? (
              cartItems?.orderItems?.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col gap-1 p-2 transition-colors border rounded-lg border-primary/80 group bg-primary/10"
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className='flex items-center justify-between'>
                      <div className='flex items-end gap-1'>
                        <span className="text-[13px] xl:text-sm font-semibold truncate max-w-[9rem] xl:max-w-[15rem]">{item.name}</span>
                      </div>
                      <span className="text-[14px]">
                        {`${formatCurrency((displayItems.find(di => di.slug === item.slug)?.finalPrice ?? 0) * item.quantity)}`}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className="text-[10px] text-muted-foreground">
                        ({item.size.toUpperCase()})
                      </span>
                      <QuantitySelector cartItem={item} />
                      <Button
                        title={t('common.remove')}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={18} className='icon text-destructive' />
                      </Button>
                    </div>
                  </div>
                  <CartNoteInput cartItem={item} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[12rem] gap-2 text-muted-foreground"
              >
                <div className="p-2 rounded-full bg-muted/30">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium">{tCommon('common.noData')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer - Payment */}
      {cartItems && cartItems?.orderItems?.length && cartItems?.orderItems?.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="z-10 p-2 border-t backdrop-blur-sm shrink-0 bg-background/95"
        >
          <div className='space-y-1'>
            <div className="flex flex-col">
              <OrderNoteInput order={cartItems} />
              <StaffVoucherListSheet />
            </div>
            <div>
              {cartItems?.voucher && (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {t('order.usedVoucher')}:
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold border rounded-full border-primary bg-primary/20 text-primary">
                        -{`${formatCurrency(cartTotals.voucherDiscount)}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* {cartItems?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex items-center w-full gap-2 px-3 py-2 border rounded-lg bg-primary/10 border-primary/40">
                  <span className='text-sm text-muted-foreground'>
                    {t('order.usedVoucher')}:
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full text-primary bg-primary/10">
                    -{`${formatCurrency(discount)}`}
                  </span>
                </div>
              </div>
            )} */}

            <div className="space-y-1 text-sm">
              {/* <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground xl:text-sm">{t('menu.total')}</span>
                <span className='text-xs font-medium xl:text-sm'>{`${formatCurrency(subTotal || 0)}`}</span>
              </div> */}

              {/* {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs italic text-green-600">
                    {t('order.voucher')}
                  </span>
                  <span className="text-xs italic text-green-600">
                    - {`${formatCurrency(discount)}`}
                  </span>
                </div>
              )} */}

              <div className="flex flex-col w-full gap-2 text-sm text-muted-foreground">
                {/* Tổng giá gốc */}
                <div className="flex justify-between">
                  <span>{t('order.subtotalBeforeDiscount')}</span>
                  <span>{formatCurrency(cartTotals.subTotalBeforeDiscount)}</span>
                </div>

                {/* Giảm giá khuyến mãi (promotion) */}
                {cartTotals.promotionDiscount > 0 && (
                  <div className="flex justify-between italic text-yellow-600">
                    <span>{t('order.promotionDiscount')}</span>
                    <span>-{formatCurrency(cartTotals.promotionDiscount)}</span>
                  </div>
                )}

                {/* Tổng giảm giá voucher */}
                {cartTotals.voucherDiscount > 0 && (
                  <div className="flex justify-between italic text-green-600">
                    <span>{t('order.voucherDiscount')}</span>
                    <span>-{formatCurrency(cartTotals.voucherDiscount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 font-semibold border-t text-md">
                  <span>{t('order.totalPayment')}</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotals.finalTotal)}</span>
                </div>
              </div>
              <div className='flex items-center justify-end'>
                <CreateOrderDialog
                  disabled={!cartItems || (cartItems.type === OrderTypeEnum.AT_TABLE && !cartItems.table)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
