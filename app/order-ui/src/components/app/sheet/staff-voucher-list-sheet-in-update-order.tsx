import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  CircleHelp,
  Copy,
  Ticket,
  TicketPercent,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Label,
  SheetFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Progress,
} from '@/components/ui'
import VoucherNotValid from '@/assets/images/chua-thoa-dieu-kien.svg'
import {
  useIsMobile,
  usePagination,
  usePublicVouchersForOrder,
  useSpecificPublicVoucher,
  useSpecificVoucher,
  useUpdateVoucherInOrder,
  useValidateVoucher,
  useVouchersForOrder,
} from '@/hooks'
import { formatCurrency, showErrorToast, showToast } from '@/utils'
import {
  IOrder,
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { useThemeStore, useUserStore } from '@/stores'
import { Role, VOUCHER_TYPE } from '@/constants'

interface IVoucherListSheetInUpdateOrderProps {
  defaultValue?: IOrder | undefined
  onSuccess?: () => void
}

export default function VoucherListSheetInUpdateOrder({
  defaultValue,
  onSuccess,
}: IVoucherListSheetInUpdateOrderProps) {
  const isMobile = useIsMobile()
  const { getTheme } = useThemeStore()
  const { t } = useTranslation(['voucher'])
  const { t: tToast } = useTranslation('toast')
  const { userInfo } = useUserStore()
  const { mutate: validateVoucher } = useValidateVoucher()
  const { mutate: updateVoucherInOrder } = useUpdateVoucherInOrder()
  const { pagination } = usePagination()
  const queryClient = useQueryClient()

  // States
  const [sheetOpen, setSheetOpen] = useState(false)
  const [localVoucherList, setLocalVoucherList] = useState<IVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<string>('')
  const [appliedVoucher, setAppliedVoucher] = useState<string>('')

  // Helper functions
  const isValidOwner = (owner?: IOrder['owner']) => {
    return owner?.phonenumber && owner.phonenumber !== 'default-customer'
  }

  const isCustomerRole = (owner?: IOrder['owner']) => {
    return owner?.role?.name === Role.CUSTOMER
  }

  const isCustomerOwner = sheetOpen && !!defaultValue?.owner &&
    isCustomerRole(defaultValue.owner) && isValidOwner(defaultValue.owner)

  // Computed values
  const subTotal = defaultValue?.orderItems.reduce((acc, item) => {
    const price = item.variant.price;
    const quantity = item.quantity;
    const discount = item.promotion ? item.promotion.value : 0;
    const itemTotal = price * quantity * (1 - discount / 100);
    return acc + itemTotal;
  }, 0) || 0;

  const voucherValue = defaultValue?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
    ? (defaultValue?.voucher?.value || 0) / 100 * subTotal
    : defaultValue?.voucher?.value || 0

  // Queries
  const { data: voucherList, refetch: refetchVoucherList } = useVouchersForOrder(
    isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }
      : undefined,
    !!sheetOpen
  )

  const { data: publicVoucherList, refetch: refetchPublicVoucherList } = usePublicVouchersForOrder(
    !isCustomerOwner
      ? {
        isActive: true,
        hasPaging: true,
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }
      : undefined,
    !!sheetOpen
  )

  const { data: specificVoucher, refetch: refetchSpecificVoucher } = useSpecificVoucher({
    code: selectedVoucher
  })

  const { data: specificPublicVoucher, refetch: refetchSpecificPublicVoucher } = useSpecificPublicVoucher({
    code: selectedVoucher
  })

  // Helper function for voucher removal
  const removeVoucherFromOrder = useCallback((errorCode?: number) => {
    if (!defaultValue?.slug) return;

    updateVoucherInOrder(
      { slug: defaultValue.slug, voucher: null },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          setSelectedVoucher('');
          setAppliedVoucher('');
          if (errorCode) showErrorToast(errorCode);
        },
      },
    );
  }, [defaultValue?.slug, updateVoucherInOrder, queryClient])

  // Effects
  // Validate voucher on owner phone change
  useEffect(() => {
    if (defaultValue?.voucher && !isValidOwner(defaultValue.owner) && defaultValue.voucher.isVerificationIdentity) {
      showErrorToast(1003);
      removeVoucherFromOrder(); // auto remove voucher when owner is not valid
    }
  }, [defaultValue?.voucher, defaultValue?.owner?.phonenumber, defaultValue?.owner, removeVoucherFromOrder])

  // Validate voucher on order items change
  useEffect(() => {
    if (defaultValue?.voucher && defaultValue?.orderItems) {
      const isValidAmount = defaultValue.voucher.minOrderValue <= subTotal;
      if (!isValidAmount) {
        removeVoucherFromOrder(1004);
      }
    }
  }, [defaultValue?.orderItems, defaultValue?.voucher, subTotal, removeVoucherFromOrder]);

  // Reset state when no voucher
  useEffect(() => {
    if (!defaultValue?.voucher) {
      setLocalVoucherList(voucherList?.result?.items || [])
      setSelectedVoucher('')
      setAppliedVoucher('')
    }
  }, [defaultValue?.voucher, voucherList?.result?.items])

  // Set selected voucher from default value
  useEffect(() => {
    if (defaultValue?.voucher) {
      setSelectedVoucher(defaultValue.voucher.code);
    }
  }, [defaultValue?.voucher]);

  // Refetch specific vouchers based on owner type
  useEffect(() => {
    if (specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher()
    }
  }, [specificVoucher?.result?.isPrivate, refetchSpecificVoucher])

  useEffect(() => {
    if (isValidOwner(defaultValue?.owner) && specificVoucher?.result?.isPrivate) {
      refetchSpecificVoucher();
    } else if (!isValidOwner(defaultValue?.owner) && specificPublicVoucher?.result) {
      refetchSpecificPublicVoucher();
    }
  }, [
    defaultValue?.owner?.phonenumber,
    specificVoucher?.result?.isPrivate,
    specificPublicVoucher?.result,
    refetchSpecificVoucher,
    refetchSpecificPublicVoucher,
    defaultValue?.owner,
  ]);

  // Add specific voucher to list
  useEffect(() => {
    const vouchers = isValidOwner(defaultValue?.owner)
      ? [specificVoucher?.result].filter((v): v is IVoucher => !!v)
      : [specificPublicVoucher?.result].filter((v): v is IVoucher => !!v);

    if (vouchers.length > 0) {
      setLocalVoucherList(prevList => {
        const newList = [...(prevList || [])];
        vouchers.forEach(voucher => {
          const existingIndex = newList.findIndex(v => v.slug === voucher.slug);
          if (existingIndex === -1) {
            newList.unshift(voucher);
          }
        });
        return newList;
      });
    }
  }, [defaultValue?.owner?.phonenumber, specificVoucher?.result, specificPublicVoucher?.result, defaultValue?.owner]);

  // Update local voucher list
  useEffect(() => {
    const baseList = (isCustomerRole(defaultValue?.owner) ? voucherList?.result.items : publicVoucherList?.result.items) || []
    let newList = [...baseList]

    // Add specific voucher if exists and not in list
    const specificVoucherToAdd = isValidOwner(defaultValue?.owner) ? specificVoucher?.result : specificPublicVoucher?.result;

    if (specificVoucherToAdd) {
      const existingIndex = newList.findIndex(v => v.slug === specificVoucherToAdd.slug)
      if (existingIndex === -1 && specificVoucherToAdd.code === selectedVoucher) {
        newList = [specificVoucherToAdd, ...newList]
      }
    }

    // Always keep the currently applied voucher in the list
    if (defaultValue?.voucher) {
      const appliedVoucherIndex = newList.findIndex(v => v.slug === defaultValue.voucher?.slug)
      if (appliedVoucherIndex === -1) {
        newList = [defaultValue.voucher, ...newList]
      }
    }

    setLocalVoucherList(newList)
  }, [
    defaultValue?.owner?.phonenumber,
    voucherList?.result?.items,
    publicVoucherList?.result?.items,
    specificVoucher?.result,
    specificPublicVoucher?.result,
    defaultValue?.voucher,
    selectedVoucher,
    defaultValue?.owner?.role?.name,
    defaultValue?.owner,
  ])

  // Helper functions for voucher operations
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    showToast(tToast('toast.copyCodeSuccess'))
  }

  const getBestVoucher = () => {
    if (!Array.isArray(localVoucherList)) return null

    const currentDate = new Date()
    const isOwnerValid = isValidOwner(defaultValue?.owner)

    const validVouchers = localVoucherList
      .filter((voucher) => {
        return voucher.isActive &&
          moment(currentDate).isSameOrAfter(moment(voucher.startDate)) &&
          moment(currentDate).isSameOrBefore(moment(voucher.endDate)) &&
          voucher.remainingUsage > 0 &&
          (!isOwnerValid ? voucher.isVerificationIdentity === false : true)
      })
      .sort((a, b) => {
        const endDateDiff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        if (endDateDiff !== 0) return endDateDiff
        if (a.minOrderValue !== b.minOrderValue) {
          return a.minOrderValue - b.minOrderValue
        }
        return b.value - a.value
      })

    return validVouchers.length > 0 ? validVouchers[0] : null
  }

  const isVoucherSelected = (voucherSlug: string) => {
    return (
      defaultValue?.voucher?.slug === voucherSlug ||
      selectedVoucher === voucherSlug ||
      appliedVoucher === voucherSlug
    )
  }

  const isVoucherValid = (voucher: IVoucher) => {
    const isValidAmount = voucher.minOrderValue <= subTotal
    const isRemainingUsage = voucher.remainingUsage > 0
    const sevenAmToday = moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
    const isValidDate = sevenAmToday.isSameOrBefore(moment(voucher.endDate))
    const isRequiredLogin = voucher.isVerificationIdentity
    const isUserLoggedIn = isValidOwner(defaultValue?.owner)
    const isIdentityValid = !isRequiredLogin || (isRequiredLogin && isUserLoggedIn)
    return isValidAmount && isValidDate && isRemainingUsage && isIdentityValid
  }

  const bestVoucher = getBestVoucher()

  const handleToggleVoucher = (voucher: IVoucher) => {
    const isSelected = isVoucherSelected(voucher.slug)
    const applyMessage = tToast('toast.applyVoucherSuccess')
    const removeMessage = tToast('toast.removeVoucherSuccess')

    const handleApplySuccess = (message: string, shouldCloseSheet = true) => {
      if (shouldCloseSheet) setSheetOpen(false)
      // refetch voucher list
      if (isCustomerOwner) {
        refetchVoucherList()
      } else {
        refetchPublicVoucherList()
      }
      showToast(message)
      onSuccess?.()
      setAppliedVoucher('')
    }

    // Remove voucher if selected
    if (isSelected) {
      if (defaultValue) {
        updateVoucherInOrder(
          { slug: defaultValue.slug, voucher: null },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['orders'] })
              setSelectedVoucher('')
              handleApplySuccess(removeMessage, false)
            },
          },
        )
      } else {
        setSelectedVoucher('')
        showToast(removeMessage)
      }
      return
    }

    // Apply voucher
    const validateVoucherParam: IValidateVoucherRequest = {
      voucher: voucher.slug,
      user: defaultValue?.owner?.slug || '',
    }

    const onValidated = () => {
      if (defaultValue) {
        updateVoucherInOrder(
          { slug: defaultValue.slug, voucher: voucher.slug },
          {
            onSuccess: () => {
              if (userInfo) {
                refetchVoucherList()
                setLocalVoucherList(voucherList?.result?.items || [])
              } else {
                refetchPublicVoucherList()
                setLocalVoucherList(publicVoucherList?.result?.items || [])
              }
              queryClient.invalidateQueries({ queryKey: ['orders'] })
              setSelectedVoucher(voucher.slug)
              handleApplySuccess(applyMessage)
            },
          },
        )
      } else {
        setSelectedVoucher(voucher.slug)
        handleApplySuccess(applyMessage)
      }
    }

    validateVoucher(validateVoucherParam, { onSuccess: onValidated })
  }

  const handleApplyVoucher = async () => {
    if (!selectedVoucher) return;

    if (appliedVoucher) {
      setAppliedVoucher('')
      return
    }

    const isOwnerValid = isValidOwner(defaultValue?.owner)
    // const specificVoucherData = isOwnerValid ? specificVoucher : specificPublicVoucher
    const refetchFunction = isOwnerValid ? refetchSpecificVoucher : refetchSpecificPublicVoucher

    const { data } = await refetchFunction();
    const voucher = data?.result;

    if (voucher) {
      const validateVoucherParam: IValidateVoucherRequest = {
        voucher: voucher.slug,
        user: isOwnerValid ? defaultValue?.owner?.slug || '' : '',
      };

      validateVoucher(validateVoucherParam, {
        onSuccess: () => {
          setSheetOpen(false);
          showToast(tToast('toast.applyVoucherSuccess'));
        },
      });
    } else {
      showErrorToast(1000);
    }
  };

  const getVoucherErrorMessage = (voucher: IVoucher) => {
    if (voucher.isVerificationIdentity && !isValidOwner(defaultValue?.owner)) {
      return t('voucher.needVerifyIdentity')
    }
    if (voucher.remainingUsage === 0) {
      return t('voucher.outOfStock')
    }
    if (moment(voucher.endDate).isBefore(moment().set({ hour: 7, minute: 0, second: 0, millisecond: 0 }))) {
      return t('voucher.expired')
    }
    if (voucher.minOrderValue > subTotal) {
      return t('voucher.minOrderNotMet')
    }
    return ''
  }

  const renderVoucherCard = (voucher: IVoucher, isBest: boolean) => {
    const usagePercentage = (voucher.remainingUsage / voucher.maxUsage) * 100
    const baseCardClass = `grid h-44 grid-cols-7 gap-2 p-2 rounded-md sm:h-40 relative
    ${isVoucherSelected(voucher.slug)
        ? `bg-${getTheme() === 'light' ? 'primary/10' : 'black'} border-primary`
        : `${getTheme() === 'light' ? 'bg-white' : 'border'}`
      }
    border border-muted-foreground/50
    ${voucher.remainingUsage === 0 && !isVoucherSelected(voucher.slug) ? 'opacity-50' : ''}
  `

    return (
      <div className={baseCardClass} key={voucher.slug}>
        {isBest && (
          <div className="absolute -top-0 -left-0 px-2 py-1 text-xs text-white rounded-tl-md rounded-br-md bg-primary">
            {t('voucher.bestChoice')}
          </div>
        )}
        <div
          className={`col-span-2 flex w-full items-center justify-center rounded-md ${isVoucherSelected(voucher.slug) ? `bg-${getTheme() === 'light' ? 'white' : 'black'}` : 'bg-muted-foreground/10'}`}
        >
          <Ticket size={56} className="text-primary" />
        </div>
        <div className="flex flex-col col-span-3 justify-between w-full">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground sm:text-sm">
              {voucher.title}
            </span>
            {voucher.type === VOUCHER_TYPE.PERCENT_ORDER ? (
              <span className="text-xs italic text-primary">
                {t('voucher.discountValue')}
                {voucher.value}% {t('voucher.orderValue')}
              </span>
            ) : (
              <span className="text-xs italic text-primary">
                {t('voucher.discountValue')}
                {formatCurrency(voucher.value)} {t('voucher.orderValue')}
              </span>
            )}
            <span className="flex gap-1 items-center text-sm text-muted-foreground">
              {voucher.code}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => handleCopyCode(voucher?.code)}
                    >
                      <Copy className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('voucher.copyCode')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="hidden text-muted-foreground/60 sm:text-xs">
              Cho đơn hàng từ {formatCurrency(voucher.minOrderValue)}
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {voucher.remainingUsage === 0
                  ? t('voucher.outOfStock')
                  : `${t('voucher.remainingUsage')}: ${voucher.remainingUsage}/${voucher.maxUsage}`}
              </span>
            </div>
            {voucher.remainingUsage > 0 && (
              <Progress value={usagePercentage} className="h-1" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {t('voucher.endDate')}:{' '}
            {moment(voucher.endDate).format('DD/MM/YYYY')}
          </span>
        </div>
        <div className="flex flex-col col-span-2 justify-between items-end">
          {!isMobile ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-2 h-8 text-muted-foreground"
                  >
                    <CircleHelp />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className={`w-[18rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
                >
                  <div className="flex flex-col gap-4 justify-between">
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">
                        {t('voucher.code')}
                      </span>
                      <span className="flex col-span-3 gap-1 items-center">
                        {voucher.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-4 h-4"
                          onClick={() => handleCopyCode(voucher?.code)}
                        >
                          <Copy className="w-4 h-4 text-primary" />
                        </Button>
                      </span>
                    </div>
                    <div className="grid grid-cols-5">
                      <span className="col-span-2 text-muted-foreground/70">
                        {t('voucher.endDate')}
                      </span>
                      <span className="col-span-3">
                        {moment(voucher.endDate).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground/70">
                        {t('voucher.condition')}
                      </span>
                      <ul className="col-span-3 pl-4 list-disc">
                        <li>
                          {t('voucher.minOrderValue')}:{' '}
                          {formatCurrency(voucher.minOrderValue)}
                        </li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 h-8 text-muted-foreground"
                >
                  <CircleHelp />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className={`mr-2 w-[20rem] p-4 bg-${getTheme() === 'light' ? 'white' : 'black'} rounded-md text-muted-foreground shadow-md`}
              >
                <div className="flex flex-col gap-4 justify-between">
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">
                      {t('voucher.code')}
                    </span>
                    <span className="flex col-span-3 gap-1 items-center">
                      {voucher.code}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4"
                        onClick={() => handleCopyCode(voucher?.code)}
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </Button>
                    </span>
                  </div>
                  <div className="grid grid-cols-5">
                    <span className="col-span-2 text-muted-foreground/70">
                      {t('voucher.endDate')}
                    </span>
                    <span className="col-span-3">
                      {moment(voucher.endDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground/70">
                      {t('voucher.condition')}
                    </span>
                    <ul className="col-span-3 pl-4 list-disc">
                      <li>
                        {t('voucher.minOrderValue')}:{' '}
                        {formatCurrency(voucher.minOrderValue)}
                      </li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {(isVoucherSelected(voucher.slug) || isVoucherValid(voucher)) ? (
            <Button
              onClick={() => handleToggleVoucher(voucher)}
              variant={
                isVoucherSelected(voucher.slug) ? 'destructive' : 'default'
              }
            >
              {isVoucherSelected(voucher.slug)
                ? t('voucher.remove')
                : t('voucher.use')}
            </Button>
          ) : (
            <div className="flex flex-col gap-1 items-end">
              <img
                src={VoucherNotValid}
                alt="chua-thoa-dieu-kien"
                className="w-1/2"
              />
              <span className="text-xs text-destructive">
                {getVoucherErrorMessage(voucher)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="px-0 w-full bg-primary/15 hover:bg-primary/20">
          <div className="flex gap-1 justify-between items-center p-2 w-full rounded-md cursor-pointer">
            <div className="flex gap-1 items-center">
              <TicketPercent className="icon text-primary" />
              <span className="text-xs text-muted-foreground">
                {t('voucher.useVoucher')}
              </span>
            </div>
            {defaultValue?.voucher && (
              <div className="flex justify-start w-full">
                <div className="flex gap-2 items-center w-full">
                  <span className="px-2 py-1 text-xs font-semibold text-white rounded-full bg-primary/60">
                    -{`${formatCurrency(voucherValue)}`}
                  </span>
                </div>
              </div>
            )}
            <div>
              <ChevronRight className="icon text-muted-foreground" />
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">{t('voucher.list')}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea
            className={`max-h-[calc(100vh-8rem)] flex-1 gap-4 p-4 bg-${getTheme() === 'light' ? 'white' : 'black'}`}
          >
            {/* Voucher search */}
            <div className="flex flex-col flex-1">
              <div className="grid grid-cols-4 gap-2 items-center sm:grid-cols-5">
                <div className="relative col-span-3 p-1 sm:col-span-4">
                  <TicketPercent className="absolute left-2 top-1/2 text-gray-400 -translate-y-1/2" />
                  <Input
                    placeholder={t('voucher.enterVoucher')}
                    className="pl-10"
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                    value={selectedVoucher}
                  />
                </div>
                <Button
                  className="col-span-1"
                  disabled={!selectedVoucher}
                  onClick={handleApplyVoucher}
                >
                  {t('voucher.apply')}
                </Button>
              </div>
            </div>
            {/* Voucher list */}
            <div>
              <div className="flex justify-between items-center py-4">
                <Label className="text-md text-muted-foreground">
                  {t('voucher.list')}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t('voucher.maxApply')}: 1
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {localVoucherList && localVoucherList.length > 0 ? (
                  localVoucherList?.map((voucher) =>
                    renderVoucherCard(
                      voucher,
                      bestVoucher?.slug === voucher.slug,
                    ),
                  )
                ) : (
                  <div>{t('voucher.noVoucher')}</div>
                )}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <Button className="w-full" onClick={() => setSheetOpen(false)}>
              {t('voucher.complete')}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
