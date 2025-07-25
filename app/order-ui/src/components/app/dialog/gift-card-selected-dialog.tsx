import { useState } from 'react'
import { Gift, ShoppingCart, CoinsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Dialog, DialogContent, DialogTrigger, Button } from '@/components/ui'

import { GiftCardExistsWarningDialog } from '@/components/app/dialog'
import { IGiftCard, IGiftCardCartItem } from '@/types'
import { formatCurrency } from '@/utils'
import { publicFileURL } from '@/constants'
import { useGiftCardStore } from '@/stores'

interface GiftCardSelectedDialogProps {
  selectedCard: IGiftCard
  trigger?: React.ReactNode
  onAddToCart?: (card: IGiftCard, quantity: number) => void
}

export function GiftCardSelectedDialog({
  selectedCard,
  trigger,
}: GiftCardSelectedDialogProps) {
  const { t } = useTranslation(['giftCard', 'common'])
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const { setGiftCardItem, getGiftCardItem } = useGiftCardStore()

  const handleAddToCart = () => {
    // Check if gift card already exists in cart
    const existingGiftCard = getGiftCardItem()

    if (existingGiftCard && existingGiftCard.slug !== selectedCard.slug) {
      // Show warning dialog if different gift card exists
      setShowWarningDialog(true)
      return
    }

    // Add or replace gift card
    addGiftCardToCart()
  }

  const addGiftCardToCart = () => {
    const cartItem: IGiftCardCartItem = {
      id: `gift_card_${Date.now().toString(36)}`,
      slug: selectedCard.slug,
      title: selectedCard.title,
      image: selectedCard.image,
      description: selectedCard.description,
      points: selectedCard.points,
      price: selectedCard.price,
      quantity,
      receipients: [],
      isActive: selectedCard.isActive,
    }

    setGiftCardItem(cartItem)
    setIsOpen(false)
  }

  const handleConfirmReplace = () => {
    addGiftCardToCart()
    setShowWarningDialog(false)
  }

  // Reset quantity when selectedCard changes
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setQuantity(1) // Reset quantity when opening
    }
    setIsOpen(open)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="lg" className="rounded-full px-4">
              <Gift className="h-4 w-4" />
              {t('giftCard.viewDetails')}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg">
              {selectedCard.image ? (
                <img
                  src={`${publicFileURL}/${selectedCard.image}`}
                  alt={selectedCard.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Gift className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>

            <div className="flex-grow">
              <div
                title={selectedCard.title}
                className="max-h-24 overflow-auto text-xl font-medium md:text-2xl"
              >
                {selectedCard.title}
              </div>

              <div
                title={selectedCard.description}
                className="mb-4 mt-2 max-h-[50vh] overflow-auto whitespace-normal break-words text-sm text-gray-600 md:text-base"
              >
                {selectedCard.description}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoinsIcon className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedCard.points * quantity, '')}
                  </span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(selectedCard.points * quantity, '')}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Button
                  size="lg"
                  className="whitespace-nowrap rounded-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span>{t('giftCard.addToCart')}</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Card Exists Warning Dialog */}
      <GiftCardExistsWarningDialog
        isOpen={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmReplace}
        selectedCard={selectedCard}
        quantity={quantity}
      />
    </>
  )
}

export default GiftCardSelectedDialog
