import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { SystemHorizontalCatalogSelect, SystemTableSelect } from '../select'
import { SystemMenuTabscontent } from '../tabscontent'
import { useCatalogStore, useOrderFlowStore, useUserStore } from '@/stores'
import { FilterState, OrderTypeEnum } from '@/types'
import moment from 'moment'
import { useSpecificMenu } from '@/hooks'

export function SystemMenuTabs() {
  const { t } = useTranslation(['menu'])
  const { userInfo } = useUserStore()
  const { getCartItems } = useOrderFlowStore()
  const cartItems = getCartItems()
  const { catalog } = useCatalogStore()

  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: userInfo?.branch?.slug,
    catalog: catalog?.slug,
    productName: '',
  })
  const { data: specificMenu, isLoading } = useSpecificMenu(filters)
  const specificMenuResult = specificMenu?.result;

  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      branch: userInfo?.branch?.slug,
      catalog: catalog?.slug,
      productName: '',
    }))
  }, [userInfo?.branch?.slug, catalog?.slug])

  const handleSelectCatalog = (catalog: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      catalog: catalog,
    }))
  }

  const [activeTab, setActiveTab] = useState('menu')

  useEffect(() => {
    if (cartItems?.type === OrderTypeEnum.TAKE_OUT) {
      setActiveTab('menu')
    }
  }, [cartItems?.type])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* TabsList luôn sticky */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-4 py-2 bg-white shadow-sm">
        <TabsList className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-6">
          <TabsTrigger value="menu" className="flex justify-center">
            {t('menu.menu')}
          </TabsTrigger>
          {cartItems?.type === OrderTypeEnum.AT_TABLE && (
            <TabsTrigger value="table" className="flex justify-center">
              {t('menu.table')}
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {/* Tab Content: Menu */}
      <TabsContent value="menu" className="w-full p-0 pb-4 mt-0">
        {/* Sticky CatalogSelect chỉ trong tab này */}
        <div className="sticky z-20 w-full py-2 overflow-x-auto bg-white top-14">
          <SystemHorizontalCatalogSelect onChange={handleSelectCatalog} />
        </div>


        {/* Scrollable nội dung menu */}
        <ScrollArea className="w-full h-full">
          <SystemMenuTabscontent menu={specificMenuResult} isLoading={isLoading} />
        </ScrollArea>
      </TabsContent>

      {/* Tab Content: Table */}
      {cartItems?.type === OrderTypeEnum.AT_TABLE && (
        <TabsContent value="table" className="p-0 w-full sm:w-[90%] xl:w-full">
          <SystemTableSelect />
        </TabsContent>
      )}
    </Tabs>
  )
}
