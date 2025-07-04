import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    CircleAlert,
    ShoppingCartIcon,
    Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
    RemoveOrderItemInUpdateOrderDialog,
} from '@/components/app/dialog'
import { ROUTE, VOUCHER_TYPE, publicFileURL } from '@/constants'
import { Button, ScrollArea } from '@/components/ui'
import { VoucherListSheetInUpdateOrder } from '@/components/app/sheet'
import { useIsMobile, useOrderBySlug, useUpdateOrderType } from '@/hooks'
import UpdateOrderSkeleton from '../skeleton/page'
import { ClientTableSelectInUpdateOrder, OrderTypeInUpdateOrderSelect } from '@/components/app/select'
import { ITable, OrderTypeEnum } from '@/types'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showToast } from '@/utils'
import { ClientMenuTabs } from '@/components/app/tabs'
import UpdateOrderQuantity from './components/update-quantity'
import { UpdateOrderItemNoteInput, UpdateOrderNoteInput } from './components'
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import { useOrderTypeStore } from '@/stores'
import ProductImage from '@/assets/images/ProductImage.png'

export default function ClientUpdateOrderPage() {
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    const { t } = useTranslation('menu')
    const { t: tVoucher } = useTranslation('voucher')
    const { t: tToast } = useTranslation('toast')
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data: order, isPending, refetch } = useOrderBySlug(slug as string)
    const { mutate: updateOrderType } = useUpdateOrderType()
    const { orderType, table, addOrderType, addTable, clearStore } = useOrderTypeStore()

    const [isExpired, setIsExpired] = useState<boolean>(false)

    useEffect(() => {
        if (order?.result) {
            addOrderType(order?.result.type as OrderTypeEnum)
            addTable(order?.result.table?.slug || "")
        }
    }, [order, addOrderType, addTable])

    const orderItems = order?.result
    const voucher = orderItems?.voucher || null

    const displayItems = calculateOrderItemDisplay(orderItems ? orderItems?.orderItems : [], voucher)

    const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

    const handleRemoveOrderItemSuccess = () => {
        refetch()
    }

    const handleUpdateOrderTypeSuccess = () => {
        refetch()
    }

    const handleUpdateOrderNoteSuccess = () => {
        refetch()
    }
    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
    }, [])

    // const handleClickPayment = () => {
    //     // Update order type
    //     let params: IUpdateOrderTypeRequest | null = null
    //     if (type === OrderTypeEnum.AT_TABLE) {
    //         params = { type: type, table: selectedTable?.slug || null, voucher: orderItems?.voucher?.slug || null }
    //     } else {
    //         params = { type: type, table: null, voucher: orderItems?.voucher?.slug || null }
    //     }
    //     updateOrderType({ slug: slug as string, params }, {
    //         onSuccess: () => {
    //             showToast(tToast('order.updateOrderTypeSuccess'))
    //             navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderItems?.slug}`)
    //             refetch()
    //         }
    //     })
    // }

    const handleClickPayment = () => {
        updateOrderType({ slug: slug as string, params: { type: orderType, table: table } }, {
            onSuccess: () => {
                clearStore()
                showToast(tToast('toast.updateOrderSuccess'))
                navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderItems?.slug}`)
            }
        })
    }
    if (isPending) { return <UpdateOrderSkeleton /> }

    if (isExpired) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-5">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px] sm:text-sm">
                        {t('order.noOrders')}
                    </p>
                    <NavLink to={ROUTE.CLIENT_MENU}>
                        <Button variant="default">
                            {t('order.backToMenu')}
                        </Button>
                    </NavLink>
                </div>
            </div>
        )
    }

    return (
        <div className={`container py-10`}>
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.updateOrder.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.updateOrder.title')} />
            </Helmet>
            <OrderCountdown createdAt={order?.result.createdAt || "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)"} setIsExpired={handleExpire} />
            {/* Order type selection */}
            {order?.result &&
                <div className="flex flex-col-reverse gap-4 lg:flex-row">
                    {/* Left content */}
                    <div className="w-full lg:w-3/5">
                        {/* Note */}
                        <div className="flex items-end justify-between">
                            <div className="flex items-center gap-1">
                                <CircleAlert size={14} className="text-destructive" />
                                <span className="text-xs italic text-destructive">
                                    {t('order.selectTableNote')}
                                </span>
                            </div>
                        </div>

                        {/* Menu & Table select */}
                        <ClientMenuTabs onSuccess={handleUpdateOrderTypeSuccess} />
                    </div>

                    {/* Right content */}
                    <div className="w-full sm:mt-8 lg:w-2/5">
                        <OrderTypeInUpdateOrderSelect typeOrder={orderType} />

                        {orderType === OrderTypeEnum.AT_TABLE &&
                            <div className='my-5'>
                                <ClientTableSelectInUpdateOrder tableOrder={orderItems?.table} orderType={orderType} onTableSelect={(table: ITable) => addTable(table.slug)} />
                            </div>
                        }
                        {/* Table list order items */}
                        <ScrollArea className="h-fit sm:h-[calc(60vh)] sm:pr-4">
                            <div className="sm:mt-5">
                                {!isMobile && (
                                    <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin bg-white border rounded-md dark:bg-transparent border-muted-foreground/40">
                                        <span className="col-span-2">{t('order.product')}</span>
                                        <span className="col-span-2 text-center">
                                            {t('order.quantity')}
                                        </span>
                                        <span className="col-span-2 text-center">
                                            {t('order.grandTotal')}
                                        </span>
                                        <span className="flex justify-center col-span-1">
                                            <Trash2 size={18} />
                                        </span>
                                    </div>)}

                                <div className="flex flex-col gap-2 border rounded-md">
                                    {orderItems?.orderItems.map((item) => (
                                        !isMobile ? (
                                            <div key={item.slug} className="grid items-center w-full gap-2 px-4 py-2 bg-white border rounded-md dark:bg-transparent border-muted-foreground/40">
                                                <div key={`${item.slug}`} className="grid flex-row items-center w-full grid-cols-8">
                                                    <div className="flex w-full col-span-3 gap-1">
                                                        <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:justify-center">
                                                            <div className="flex flex-col">
                                                                <span className="text-[14px] font-bold truncate sm:text-sm mb-2">
                                                                    {item.variant.product.name}
                                                                    <span className='text-muted-foreground'> - Size {item.variant.size.name.toLocaleUpperCase()}</span>
                                                                </span>
                                                                {(() => {
                                                                    const displayItem = displayItems.find(di => di.slug === item.slug)
                                                                    const original = item.variant.price || 0
                                                                    const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                                                                    const finalPrice = displayItem?.finalPrice || 0

                                                                    const isSamePriceVoucher =
                                                                        voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                                                        voucher?.voucherProducts?.some(vp => vp.product?.slug === item.variant.product.slug)

                                                                    const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                                                                    const displayPrice = isSamePriceVoucher
                                                                        ? finalPrice
                                                                        : hasPromotionDiscount
                                                                            ? priceAfterPromotion
                                                                            : original

                                                                    const shouldShowLineThrough =
                                                                        isSamePriceVoucher || hasPromotionDiscount

                                                                    const note = isSamePriceVoucher
                                                                        ? '(**)'
                                                                        : hasPromotionDiscount
                                                                            ? '(*)'
                                                                            : ''

                                                                    return (
                                                                        <div className="flex items-center gap-1">
                                                                            {shouldShowLineThrough && original !== finalPrice && (
                                                                                <span className="text-xs line-through text-muted-foreground">
                                                                                    {formatCurrency(original)}
                                                                                </span>
                                                                            )}
                                                                            <span className="font-bold text-primary">
                                                                                {formatCurrency(displayPrice)}
                                                                            </span>
                                                                            {note && <span className="text-sm">{note}</span>}
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-end justify-center h-full col-span-2">
                                                        <UpdateOrderQuantity orderItem={item} onSuccess={refetch} />
                                                    </div>
                                                    <div className="h-full col-span-2">
                                                        <span className="flex items-end justify-center h-full text-sm font-semibold text-primary">
                                                            {`${formatCurrency((item.subtotal || 0))}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end justify-center h-full col-span-1" >
                                                        <RemoveOrderItemInUpdateOrderDialog onSubmit={handleRemoveOrderItemSuccess} orderItem={item} totalOrderItems={orderItems?.orderItems.length || 0} />
                                                    </div>
                                                </div>
                                                <UpdateOrderItemNoteInput orderItem={item} />
                                            </div>
                                        ) : (
                                            <div key={item.slug} className="flex flex-col items-center w-full gap-4 p-3 bg-white border rounded-md dark:bg-transparent">
                                                <div className="flex items-center w-full h-24 gap-2">
                                                    {item.variant.product.image ? (
                                                        <img
                                                            src={publicFileURL + '/' + item.variant.product.image}
                                                            alt={item.variant.product.name}
                                                            className="object-cover w-20 rounded-md sm:w-36"
                                                        />
                                                    ) : (
                                                        <img src={ProductImage} alt={item.variant.product.name} className="object-cover w-20 rounded-md sm:h-24 sm:w-36 rounded-t-md" />
                                                    )}
                                                    <div className="flex flex-col justify-between w-full h-full gap-1">
                                                        <div className='flex flex-col'>
                                                            <div className='flex items-start justify-between w-full h-full'>
                                                                <div className='grid items-center justify-between w-full grid-cols-5'>
                                                                    <span className="col-span-4 text-sm font-bold truncate">
                                                                        {item.variant.product.name}
                                                                    </span>
                                                                    <div className='col-span-1'>
                                                                        <RemoveOrderItemInUpdateOrderDialog onSubmit={handleRemoveOrderItemSuccess} orderItem={item} totalOrderItems={orderItems?.orderItems.length || 0} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className='text-sm text-muted-foreground'>Size {item.variant.size.name.toLocaleUpperCase()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="relative inline-block text-xs sm:text-sm text-muted-foreground">
                                                                {(() => {
                                                                    const displayItem = displayItems.find(di => di.slug === item.slug)
                                                                    const original = item.variant.price || 0
                                                                    const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                                                                    const finalPrice = displayItem?.finalPrice || 0

                                                                    const isSamePriceVoucher =
                                                                        voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                                                        voucher?.voucherProducts?.some(vp => vp.product?.slug === item.variant.product.slug)

                                                                    const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                                                                    const displayPrice = isSamePriceVoucher
                                                                        ? finalPrice
                                                                        : hasPromotionDiscount
                                                                            ? priceAfterPromotion
                                                                            : original

                                                                    const shouldShowLineThrough =
                                                                        isSamePriceVoucher || hasPromotionDiscount

                                                                    const note = isSamePriceVoucher
                                                                        ? '(**)'
                                                                        : hasPromotionDiscount
                                                                            ? '(*)'
                                                                            : ''

                                                                    return (
                                                                        <div className="flex items-center gap-1">
                                                                            {shouldShowLineThrough && original !== finalPrice && (
                                                                                <span className="text-[0.5rem] line-through sm:text-sm">
                                                                                    {formatCurrency(original)}
                                                                                </span>
                                                                            )}
                                                                            <span className="font-bold text-primary">
                                                                                {formatCurrency(displayPrice)}
                                                                            </span>
                                                                            {note && <span className="text-sm">{note}</span>}
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </span>
                                                            <UpdateOrderQuantity orderItem={item} onSuccess={refetch} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <UpdateOrderItemNoteInput orderItem={item} />
                                            </div>
                                        )
                                    ))}
                                </div>
                                {/* order note */}
                                <div className="flex flex-col items-start gap-2 py-4 mt-4 border-t border-muted-foreground/40">
                                    <UpdateOrderNoteInput onSuccess={handleUpdateOrderNoteSuccess} order={orderItems} />
                                    <div className="w-full p-3 border rounded-md bg-primary/10 border-primary">
                                        <div className="flex items-start gap-2 text-sm text-primary">
                                            <div className="flex-1">
                                                <p className="text-xs text-primary">
                                                    <span className="font-extrabold">{t('order.voucher')}</span>
                                                </p>
                                                <ul className="mt-1 space-y-1 text-xs text-primary">
                                                    <li className="flex items-center gap-1">
                                                        <span className="font-bold text-primary">*</span>
                                                        <span>{t('order.promotionDiscount')}</span>
                                                    </li>
                                                    <li className="flex items-center gap-1">
                                                        <span className="font-bold text-primary">**</span>
                                                        <span>{t('order.itemLevelVoucher')}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <VoucherListSheetInUpdateOrder defaultValue={orderItems || undefined} onSuccess={refetch} />
                                <div>
                                    {orderItems?.voucher && (
                                        <div className="flex justify-start w-full">
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {t('order.usedVoucher')}:
                                                    </span>
                                                    <span className="px-3 py-1 text-xs font-semibold border rounded-full border-primary bg-primary/20 text-primary">
                                                        -{`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                                                    </span>
                                                </div>

                                                {/* Hiển thị nội dung chi tiết theo loại voucher */}
                                                <div className="mt-1 text-xs italic text-muted-foreground">
                                                    {(() => {
                                                        const voucher = orderItems?.voucher
                                                        if (!voucher) return null

                                                        switch (voucher.type) {
                                                            case VOUCHER_TYPE.PERCENT_ORDER:
                                                                return `${tVoucher('voucher.discountValue')}${voucher.value}% ${tVoucher('voucher.orderValue')}`

                                                            case VOUCHER_TYPE.FIXED_VALUE:
                                                                return `${tVoucher('voucher.discountValue')}${formatCurrency(voucher.value)} ${tVoucher('voucher.orderValue')}`

                                                            case VOUCHER_TYPE.SAME_PRICE_PRODUCT:
                                                                return `${tVoucher('voucher.samePrice')} ${formatCurrency(voucher.value)} ${tVoucher('voucher.forSelectedProducts')}`

                                                            default:
                                                                return ''
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end pt-4 mt-4 border-t border-muted-foreground/40">
                                    <div className="w-full space-y-1 sm:w-2/3">
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.total')}:</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                {/* {formatCurrency(orderItems ? orderItems.subtotal : 0)} */}
                                                {/* {formatCurrency(orderItems?.subtotal || 0)} */}
                                                {formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.promotionDiscount')}</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                - {formatCurrency(cartTotals?.promotionDiscount || 0)}
                                                {/* {formatCurrency(orderItems?.voucher ? (orderItems.subtotal * (orderItems.voucher.value || 0)) / 100 : 0)} */}
                                            </span>
                                        </div>
                                        <div className="flex justify-between w-full pb-4 border-b">
                                            <h3 className="text-sm italic font-medium text-green-500">
                                                {t('order.voucher')}
                                            </h3>
                                            <p className="text-sm italic font-semibold text-green-500">
                                                - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-5 pt-2 mt-4 border-t">
                                            <span className="col-span-3 text-lg font-bold">{t('order.subtotal')}:</span>
                                            <span className="col-span-2 font-semibold text-right text-md text-primary sm:text-2xl">
                                                {formatCurrency(cartTotals?.finalTotal || 0)}
                                            </span>
                                        </div>
                                        {/* <span className="text-xs text-muted-foreground">({t('order.vat')})</span> */}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {order?.result?.status === "pending" &&
                            <div className="flex justify-end w-full mt-4">
                                <Button
                                    className='w-full sm:w-1/2 lg:w-1/3'
                                    disabled={(orderType === OrderTypeEnum.AT_TABLE && !table) || orderItems?.orderItems.length === 0}
                                    onClick={handleClickPayment}>{t('order.continueToPayment')}</Button>
                            </div>}
                    </div>
                </div>
            }
        </div>
    )
}
