import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui"
import { useTables } from "@/hooks"
import { useOrderFlowStore, useUserStore } from "@/stores"
import { OrderTypeEnum, ITable } from "@/types"
import { TableStatus } from "@/constants"
import { SelectReservedTableDialog } from "../dialog"

interface ITableSelectInCartDrawerProps {
    tableOrder?: ITable | null
    onTableSelect?: (table: ITable) => void
}

export default function SystemTableSelectInCartDrawer({ tableOrder, onTableSelect }: ITableSelectInCartDrawerProps) {
    const { t } = useTranslation('table')
    const { orderingData, addTable } = useOrderFlowStore()
    const { userInfo } = useUserStore()
    const { data: tables } = useTables(userInfo?.branch?.slug || '')

    const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string | undefined>()

    useEffect(() => {
        const addedTable = orderingData?.table
        setSelectedTableId(addedTable)
    }, [orderingData?.table])
    useEffect(() => {
        if (tableOrder) {
            setSelectedTable(tableOrder)
            setSelectedTableId(tableOrder.slug)
        }
    }, [tableOrder])

    if (orderingData?.type === OrderTypeEnum.TAKE_OUT) {
        return null
    }

    const handleTableSelect = (tableId: string) => {
        const table = tables?.result?.find((t) => t.slug === tableId)
        if (!table) return
        if (table.status === TableStatus.RESERVED) {
            setSelectedTable(table)
        } else {
            addTable(table)
            setSelectedTableId(tableId)
            onTableSelect?.(table)
        }
    }

    const handleConfirmTable = (table: ITable) => {
        addTable(table)
        onTableSelect?.(table)
        setSelectedTableId(table.slug)
        setSelectedTable(null) // Đóng dialog
    }

    return (
        <>
            <Select onValueChange={handleTableSelect} value={selectedTableId} >
                <SelectTrigger className={`w-full ${!selectedTableId ? 'highlight-blink-border' : ''}`}>
                    <SelectValue placeholder={t('table.title')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{t('table.title')}</SelectLabel>
                        {tables?.result?.map((table) => (
                            <SelectItem key={table.slug} value={table.slug} className={table.status === TableStatus.RESERVED ? 'text-red-400' : ''}>
                                {`${table.name} - ${t(`table.${table.status}`)}`}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/* Dialog hiển thị khi chọn bàn đã đặt */}
            {selectedTable && selectedTable.slug !== tableOrder?.slug && (
                <SelectReservedTableDialog
                    table={selectedTable}
                    onConfirm={handleConfirmTable}
                    onCancel={() => setSelectedTable(null)}
                />
            )}
        </>
    )
}
