import { QUERYKEY } from '@/constants'
import {
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IGetGiftCardsRequest,
  ICardOrderRequest,
} from '@/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard,
  createCardOrder,
} from '@/api'

export const useGetGiftCards = (params: IGetGiftCardsRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.giftCards, params],
    queryFn: () => getGiftCards(params),
  })
}

export const useCreateGiftCard = () => {
  return useMutation({
    mutationFn: async (data: IGiftCardCreateRequest) => {
      return createGiftCard(data)
    },
  })
}

export const useUpdateGiftCard = () => {
  return useMutation({
    mutationFn: async ({
      data,
      slug,
    }: {
      data: IGiftCardUpdateRequest
      slug: string
    }) => {
      return updateGiftCard(data, slug)
    },
  })
}

export const useDeleteGiftCard = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteGiftCard(slug)
    },
  })
}

export const useCreateCardOrder = () => {
  return useMutation({
    mutationFn: async (data: ICardOrderRequest) => {
      return createCardOrder(data)
    },
  })
}
