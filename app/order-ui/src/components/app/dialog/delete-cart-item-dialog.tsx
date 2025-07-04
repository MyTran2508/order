import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, TriangleAlert } from 'lucide-react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
} from '@/components/ui'
import { IOrderItem } from '@/types'
import { useCartItemStore } from '@/stores'
import { showErrorToast } from '@/utils'
import { VOUCHER_TYPE } from '@/constants'

interface DialogDeleteCartItemProps {
  cartItem: IOrderItem
}

export default function DeleteCartItemDialog({
  cartItem,
}: DialogDeleteCartItemProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const { removeCartItem, cartItems, removeVoucher } = useCartItemStore()

  const handleDelete = (cartItemId: string) => {
    setIsOpen(false)
    removeCartItem(cartItemId)
  }

  // use useEffect to check if subtotal is less than minOrderValue of voucher
  useEffect(() => {
    if (cartItems) {
      const { orderItems, voucher } = cartItems

      // Tính tổng tiền GỐC (chỉ trừ promotion nếu có, KHÔNG trừ voucher)
      const subtotalBeforeVoucher = orderItems.reduce((acc, item) => {
        const original = item.originalPrice ?? item.price
        const promotionDiscount = item.promotionDiscount ?? 0
        return acc + ((original ?? 0) - promotionDiscount) * item.quantity
      }, 0)

      // Nếu không phải SAME_PRICE_PRODUCT thì mới cần check
      const shouldCheckMinOrderValue = voucher?.type !== VOUCHER_TYPE.SAME_PRICE_PRODUCT

      if (shouldCheckMinOrderValue && subtotalBeforeVoucher < (voucher?.minOrderValue || 0)) {
        removeVoucher()
        showErrorToast(1004)
        setIsOpen(false)
      }
    }
  }, [cartItems, removeVoucher])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 size={20} className="text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[22rem] rounded-md sm:max-w-[32rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <TriangleAlert />
            {t('order.deleteItem')}
          </DialogTitle>
          <DialogDescription className={`p-2 bg-red-100 rounded-md dark:bg-transparent text-destructive`}>
            {tCommon('common.deleteNote')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex items-center gap-4 mt-4">
            <Label htmlFor="name" className="leading-5 text-left">
              {t('order.deleteContent')} <strong>{cartItem.name}</strong>
              {t('order.deleteContent2')}
            </Label>
          </div>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(cartItem.id)} // Truyền vào đúng id của orderItem
          >
            {tCommon('common.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
