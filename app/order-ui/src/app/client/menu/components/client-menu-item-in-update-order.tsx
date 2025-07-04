import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { IMenuItem, IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { AddNewOrderItemDialog } from '@/components/app/dialog'
import { ClientAddToCartDrawer } from '@/components/app/drawer'
import { useIsMobile } from '@/hooks'
import { PromotionTag } from '@/components/app/badge'

interface IClientMenuItemInUpdateOrderProps {
  onSuccess: () => void
  item: IMenuItem
}

export function ClientMenuItemInUpdateOrder({ onSuccess, item }: IClientMenuItemInUpdateOrderProps) {
  const { t } = useTranslation('menu')
  const isMobile = useIsMobile()

  const getPriceRange = (variants: IProduct['variants']) => {
    if (!variants || variants.length === 0) return null

    const prices = variants.map((v) => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      min: minPrice,
      max: maxPrice,
      isSinglePrice: minPrice === maxPrice,
    }
  }

  return (
    <div
      key={item.slug}
      className="flex flex-row sm:flex-col justify-between rounded-xl bg-white border transition-all duration-300 ease-in-out min-h-[8rem] sm:min-h-[16rem] dark:bg-transparent"
    >
      <NavLink
        to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.slug}`}
        className="flex flex-row w-full sm:flex-col"
      >
        <div className="relative items-center justify-center flex-shrink-0 w-24 h-full px-2 py-4 sm:p-0 sm:w-full sm:h-40">
          {item.product.image ? (
            <>
              <img
                src={`${publicFileURL}/${item.product.image}`}
                alt={item.product.name}
                className="object-cover w-full h-full rounded-xl p-1.5 sm:h-40"
              />
              {item?.product?.isLimit && !isMobile && (
                <span className="absolute z-50 px-3 py-1 text-xs text-white rounded-full bottom-3 left-3 bg-primary w-fit">
                  {t('menu.amount')} {item.currentStock}/{item.defaultStock}
                </span>
              )}
              {item.promotion && item.promotion.value > 0 && (
                <PromotionTag promotion={item.promotion} />
              )}
            </>
          ) : (
            <div className="w-full h-full rounded-t-md bg-muted/60" />
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 p-2">
          <div className="h-auto sm:h-fit">
            <h3 className="font-bold text-md sm:text-lg line-clamp-1">{item.product.name}</h3>
            {item?.product?.isLimit && isMobile && (
              <span className="px-3 py-1 mt-1 text-xs text-white rounded-full bg-primary w-fit">
                {t('menu.amount')} {item.currentStock}/{item.defaultStock}
              </span>
            )}
          </div>

          {item.product.variants.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                {item?.promotion?.value > 0 ? (
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-xs line-through sm:text-sm text-muted-foreground/70">
                      {(() => {
                        const range = getPriceRange(item.product.variants)
                        if (!range) return formatCurrency(0)
                        return formatCurrency(range.min)
                      })()}
                    </span>
                    <span className="text-sm font-bold sm:text-lg text-primary">
                      {(() => {
                        const range = getPriceRange(item.product.variants)
                        if (!range) return formatCurrency(0)
                        return formatCurrency(range.min * (1 - item.promotion.value / 100))
                      })()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold sm:text-lg text-primary">
                    {(() => {
                      const range = getPriceRange(item.product.variants)
                      if (!range) return formatCurrency(0)
                      return formatCurrency(range.min)
                    })()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-sm font-bold text-primary">
              {t('menu.contactForPrice')}
            </span>
          )}
        </div>
      </NavLink>

      <div className="flex items-end justify-end p-2 sm:w-full">
        {!item.isLocked && (item.currentStock > 0 || !item?.product?.isLimit) ? (
          isMobile ? (
            <ClientAddToCartDrawer product={item} onSuccess={onSuccess} isUpdateOrder={true} />
          ) : (
            <AddNewOrderItemDialog product={item} onSuccess={onSuccess} />
          )
        ) : (
          <Button
            className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full"
            disabled
          >
            {t('menu.outOfStock')}
          </Button>
        )}
      </div>
    </div>
  )
}
