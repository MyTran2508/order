import { http } from '@/utils'
import {
  IApiResponse,
  IApplyPromotionRequest,
  ICreatePromotionRequest,
  IPaginationResponse,
  IPromotion,
  IRemoveAppliedPromotionRequest,
  IUpdatePromotionRequest,
} from '@/types'

export async function getPromotions(
  branchSlug: string,
): Promise<IApiResponse<IPaginationResponse<IPromotion>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IPromotion>>>('/promotion', {
    params: { branchSlug },
  })
  return response.data
}

export async function createPromotion(
  data: ICreatePromotionRequest,
): Promise<IApiResponse<ICreatePromotionRequest>> {
  const response = await http.post<IApiResponse<IPromotion>>(
    `/promotion/${data.branchSlug}`,
    data,
  )
  return response.data
}

export async function updatePromotion(
  data: IUpdatePromotionRequest,
): Promise<IApiResponse<IUpdatePromotionRequest>> {
  const response = await http.patch<IApiResponse<IPromotion>>(
    `/promotion/${data.slug}`,
    data,
  )
  return response.data
}

export async function deletePromotion(
  slug: string,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/promotion/${slug}`)
  return response.data
}

export async function applyPromotion(
  data: IApplyPromotionRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/applicable-promotion/multi`,
    data,
  )
  return response.data
}

export async function removeProductPromotion(
  data: IRemoveAppliedPromotionRequest,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(
    `/applicable-promotion/`,
    { data },
  )
  return response.data
}
