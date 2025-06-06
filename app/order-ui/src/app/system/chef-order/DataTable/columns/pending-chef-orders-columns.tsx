import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import ejs from 'ejs'
import { useTranslation } from 'react-i18next'
import { DownloadIcon, MoreHorizontal } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ChefOrderItemStatus, ChefOrderStatus, IChefOrders, IExportChefOrderTicketParams, OrderTypeEnum } from '@/types'
import {
  ConfirmCompleteChefOrderDialog,
  ConfirmUpdateChefOrderStatusDialog,
} from '@/components/app/dialog'
import { ChefOrderStatusBadge } from '@/components/app/badge'
import { loadDataToPrinter, showToast } from '@/utils'
import { Be_Vietnam_Pro_base64 } from '@/assets/font/base64';
import { Logo } from '@/assets/images';
import { useExportChefOrder } from '@/hooks'

export const usePendingChefOrdersColumns = (): ColumnDef<IChefOrders>[] => {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation(['common'])
  const { t: tToast } = useTranslation('toast')

  const { mutate: exportChefOrder } = useExportChefOrder()

  const handleExportChefOrder = (slug: string) => {
    exportChefOrder(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportChefOrderSuccess'))
        loadDataToPrinter(data)
      },
    })
  }

  const handleExportChefOrderTicket = async (chefOrder: IChefOrders | undefined) => {
    await exportOrderInvoices(chefOrder)
    showToast(tToast('toast.exportChefOrderSuccess'))
  }

  const generateChefOrderTicketHTML = async (data: IExportChefOrderTicketParams): Promise<string> => {
    const templateText = await fetch('/templates/chef-order-ticket-template.html').then(res => res.text());
    return ejs.render(templateText, data);
  };

  const exportOrderInvoices = async (chefOrder: IChefOrders | undefined) => {
    if (!chefOrder) return;

    try {
      let allHtmlContent = '';

      for (const item of chefOrder.chefOrderItems) {
        const html = await generateChefOrderTicketHTML({
          logoString: Be_Vietnam_Pro_base64,
          logo: Logo,
          referenceNumber: chefOrder.order.referenceNumber,
          orderItem: {
            variant: {
              name: item.orderItem.variant.product?.name || '',
              size: item.orderItem.variant.size?.name || '',
              note: item.orderItem.note || ''
            },
            quantity: item.orderItem.quantity,
          }
        });

        allHtmlContent += html;
      }

      // Mở cửa sổ in 1 lần
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast(tToast('toast.exportChefOrderTicketError'));
        return;
      }

      printWindow.document.write(allHtmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      };
    } catch {
      showToast(tToast('toast.exportChefOrderTicketError'));
    }
  };

  return [
    {
      id: 'select',
      header: ({ column }) => (
        <DataTableColumnHeader
          className='min-w-24'
          column={column}
          title={tCommon('common.action')}
        />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          <>
            {chefOrder.status === ChefOrderStatus.PENDING ? (
              <div className='min-w-24' onClick={(e) => e.stopPropagation()}>
                <ConfirmUpdateChefOrderStatusDialog chefOrder={chefOrder} />
              </div>
            ) : (
              <div className="pl-3 min-w-28">
                <span className="italic text-green-500">
                  {t('chefOrder.accepted')}
                </span>
              </div>
            )}
          </>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader key={column.id} column={column} title={t('chefOrder.referenceNumber')} />
      ),
      cell: ({ row }) => {
        const referenceNumber = row.original.order.referenceNumber
        return <span className="text-sm text-muted-foreground">{referenceNumber}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('chefOrder.createdAt')}
        />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <span className="text-sm text-muted-foreground">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </span>
        )
      },
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.location')} />
      ),
      cell: ({ row }) => {
        const location = row.original.order.type === OrderTypeEnum.AT_TABLE ? t('chefOrder.table') + " " + row.original.order.table.name : t('chefOrder.take-out')
        return <span className="text-sm text-muted-foreground">{location}</span>
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.quantity')} />
      ),
      cell: ({ row }) => {
        const quantity = row.original.chefOrderItems.length
        return (
          <span className="text-sm text-muted-foreground">
            {quantity} {t('chefOrder.items')}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span className="text-muted-foreground">
            <ChefOrderStatusBadge status={status} />
          </span>
        )
      },
    },
    {
      accessorKey: 'export',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.export')} />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          chefOrder.status !== ChefOrderStatus.PENDING ? (
            <Button variant="outline" onClick={(e) => {
              e.stopPropagation()
              handleExportChefOrder(chefOrder.slug)
            }}
            >
              <DownloadIcon />
              {t('chefOrder.exportChefOrder')}
            </Button>
          ) : null
        )
      },
    },
    {
      accessorKey: 'exportTicket',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.exportTicket')} />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          chefOrder.status !== ChefOrderStatus.PENDING ? (
            <Button variant="outline" onClick={(e) => {
              e.stopPropagation()
              handleExportChefOrderTicket(chefOrder)
            }}
            >
              <DownloadIcon />
              {t('chefOrder.exportTicket')}
            </Button>
          ) : null
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                {chefOrder.chefOrderItems.some(item => item.status === ChefOrderItemStatus.COMPLETED) && chefOrder.status !== ChefOrderStatus.COMPLETED && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ConfirmCompleteChefOrderDialog chefOrder={chefOrder} />
                  </div>
                )}
                {/* <Button onClick={(e) => {
                  e.stopPropagation()
                  handleExportChefOrder(chefOrder.slug)
                }}
                  variant="ghost"
                  className="flex gap-1 justify-start px-2 w-full"
                >
                  <DownloadIcon />
                  {t('chefOrder.exportChefOrder')}
                </Button> */}
                {/* <Button onClick={(e) => {
                  e.stopPropagation()
                  handleExportAutoChefOrderTicket(chefOrder.slug)
                }}
                  variant="ghost"
                  className="flex gap-1 justify-start px-2 w-full"
                >
                  <DownloadIcon />
                  {t('chefOrder.exportAutoChefOrderTicket')}
                </Button>
                <Button onClick={(e) => {
                  e.stopPropagation()
                  handleExportManualChefOrderTicket(chefOrder.slug)
                }}
                  variant="ghost"
                  className="flex gap-1 justify-start px-2 w-full"
                >
                  <DownloadIcon />
                  {t('chefOrder.exportManualChefOrderTicket')}
                </Button> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'productName',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('chefOrder.productName')} />
    //   ),
    //   cell: ({ row }) => {
    //     const product = row.original.product
    //     return <span className="text-sm text-muted-foreground">{product.name}</span>
    //   },
    // },
    // {
    //   accessorKey: 'note',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('chefOrder.note')} />
    //   ),
    //   cell: ({ row }) => {
    //     const product = row.original.product
    //     return <span className="text-sm text-muted-foreground">{product?.note ? product?.note : t('chefOrder.noNote')}</span>
    //   },
    // },
  ]
}
