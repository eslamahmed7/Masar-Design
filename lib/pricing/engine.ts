export type PriceBreakdown = {
  subtotal: number
  globalPromotionDiscount: number
  globalPromotionLabel: string | null
  couponDiscount: number
  couponCode: string | null
  addonsTotal: number
  finalTotal: number
}

export interface PricingService {
  pricing_type: string
  price_per_sqm?: number | null
  fixed_price?: number | null
  min_area?: number | null
  max_area?: number | null
  min_order_value?: number | null
  currency?: string
}

export interface PricingAddon {
  price: number
  price_type: 'fixed' | 'percentage'
}

export interface CouponData {
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount?: number | null
}

export interface PromotionData {
  discount_type?: string
  discount_value: number
  title?: string
  title_ar?: string
}

export function calculatePricing(opts: {
  area: number
  servicePricing: PricingService | null
  addons?: PricingAddon[]
  globalPromotion?: PromotionData | null
  coupon?: CouponData | null
}): PriceBreakdown {
  const { area, servicePricing, addons = [], globalPromotion, coupon } = opts

  const isPerSqm = servicePricing?.pricing_type === 'per_sqm'
  const unitPrice = servicePricing?.price_per_sqm ?? 0
  const fixedPrice = servicePricing?.fixed_price ?? 0

  const subtotal = isPerSqm ? Math.round(area * unitPrice) : fixedPrice

  const addonsTotal = addons.reduce((sum, a) => {
    if (a.price_type === 'percentage') {
      return sum + Math.round(subtotal * (a.price / 100))
    }
    return sum + Math.round(a.price)
  }, 0)

  let afterGlobal = subtotal
  let globalPromotionDiscount = 0
  let globalPromotionLabel: string | null = null

  if (globalPromotion) {
    if (globalPromotion.discount_type === 'percentage') {
      globalPromotionDiscount = Math.round(subtotal * (globalPromotion.discount_value / 100))
    } else {
      globalPromotionDiscount = Math.round(globalPromotion.discount_value)
    }
    globalPromotionLabel = globalPromotion.title_ar ?? globalPromotion.title ?? null
    afterGlobal = subtotal - globalPromotionDiscount
  }

  let afterCoupon = afterGlobal
  let couponDiscount = 0
  let couponCode: string | null = null

  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      couponDiscount = Math.round(afterGlobal * (coupon.discount_value / 100))
      if (coupon.max_discount && couponDiscount > coupon.max_discount) {
        couponDiscount = Math.round(coupon.max_discount)
      }
    } else {
      couponDiscount = Math.round(coupon.discount_value)
    }
    afterCoupon = afterGlobal - couponDiscount
  }

  const finalTotal = Math.max(0, afterCoupon + addonsTotal)

  return {
    subtotal,
    globalPromotionDiscount,
    globalPromotionLabel,
    couponDiscount,
    couponCode: null,
    addonsTotal,
    finalTotal,
  }
}
