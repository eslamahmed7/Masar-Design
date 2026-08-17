'use server'

import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { OrderPDFDocument } from './template'

export interface PDFData {
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  projectName: string | null
  projectType: string | null
  area: number | null
  subtotal: number
  globalPromotionDiscount: number
  couponDiscount: number
  addonsTotal: number
  finalTotal: number
  currency: string
  notes: string | null
}

export async function generateAndSaveOrderPDF(data: PDFData) {
  const supabase = await createClient()

  const pdfBuffer = await renderToBuffer(
    React.createElement(OrderPDFDocument, data) as any,
  )

  const fileName = `${data.orderNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`
  const filePath = `${data.orderId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('order-pdfs')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('order-pdfs')
    .getPublicUrl(filePath)

  await supabase
    .from('orders')
    .update({ pdf_url: publicUrl })
    .eq('id', data.orderId)

  return { pdfUrl: publicUrl }
}
