import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Noto Sans Arabic',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpBtLGrOAZMl5nJ_wfgRg3DrWFZBsnDzBQ.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpBtLGrOAZMl5nJ_wfgRg3DrWFZBsnDzBQ.woff2', fontWeight: 700 },
  ],
})

const GOLD = '#C8A96A'
const DARK = '#1A1916'
const GRAY = '#666'
const LIGHT = '#f8f8f8'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans Arabic',
    padding: 40,
    backgroundColor: '#fff',
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: `2 solid ${GOLD}`,
  },
  logo: {
    width: 80,
    height: 40,
  },
  title: {
    fontSize: 18,
    color: GOLD,
    fontWeight: 700,
    letterSpacing: 2,
  },
  orderNumber: {
    fontSize: 10,
    color: GRAY,
    marginTop: 4,
    textAlign: 'left',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: GOLD,
    fontWeight: 700,
    marginBottom: 8,
    borderBottom: `1 solid ${GOLD}40`,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: GRAY,
    width: '30%',
  },
  value: {
    fontSize: 9,
    color: DARK,
    width: '65%',
    textAlign: 'right',
  },
  pricingTable: {
    marginTop: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 9,
  },
  pricingRowAlt: {
    backgroundColor: LIGHT,
  },
  pricingLabel: {
    color: GRAY,
  },
  pricingValue: {
    color: DARK,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTop: `2 solid ${GOLD}`,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: GOLD,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 11,
    color: GOLD,
    fontWeight: 700,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1 solid ${GOLD}30`,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: GRAY,
  },
  qrCode: {
    width: 50,
    height: 50,
  },
  signaturePlaceholder: {
    marginTop: 30,
    paddingTop: 12,
    borderTop: `1 dashed ${GRAY}60`,
  },
  signatureLine: {
    width: 200,
    borderTop: `1 solid ${DARK}`,
    marginTop: 30,
  },
  terms: {
    fontSize: 7,
    color: GRAY,
    lineHeight: 1.5,
    marginTop: 16,
  },
})

interface PDFTemplateProps {
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

export function OrderPDFDocument(props: PDFTemplateProps) {
  const {
    orderNumber, customerName, customerPhone, customerEmail,
    projectName, projectType, area,
    subtotal, globalPromotionDiscount, couponDiscount,
    addonsTotal, finalTotal, currency, notes,
  } = props

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MASAR</Text>
            <Text style={styles.title}>مسار</Text>
          </View>
          <View>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم</Text>
            <Text style={styles.value}>{customerName || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف</Text>
            <Text style={styles.value}>{customerPhone || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <Text style={styles.value}>{customerEmail || '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات المشروع</Text>
          <View style={styles.row}>
            <Text style={styles.label}>اسم المشروع</Text>
            <Text style={styles.value}>{projectName || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>نوع المشروع</Text>
            <Text style={styles.value}>{projectType || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المساحة</Text>
            <Text style={styles.value}>{area ? `${area} م²` : '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل التسعير</Text>
          <View style={styles.pricingTable}>
            <View style={[styles.pricingRow, styles.pricingRowAlt]}>
              <Text style={styles.pricingLabel}>المجموع الفرعي</Text>
              <Text style={styles.pricingValue}>{subtotal.toLocaleString()} {currency}</Text>
            </View>
            {globalPromotionDiscount > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>خصم العرض</Text>
                <Text style={styles.pricingValue}>-{globalPromotionDiscount.toLocaleString()} {currency}</Text>
              </View>
            )}
            {couponDiscount > 0 && (
              <View style={[styles.pricingRow, styles.pricingRowAlt]}>
                <Text style={styles.pricingLabel}>خصم الكوبون</Text>
                <Text style={styles.pricingValue}>-{couponDiscount.toLocaleString()} {currency}</Text>
              </View>
            )}
            {addonsTotal > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>الخدمات الإضافية</Text>
                <Text style={styles.pricingValue}>+{addonsTotal.toLocaleString()} {currency}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>الإجمالي النهائي</Text>
              <Text style={styles.totalValue}>{finalTotal.toLocaleString()} {currency}</Text>
            </View>
          </View>
        </View>

        {notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ملاحظات</Text>
            <Text style={{ fontSize: 8, color: GRAY }}>{notes}</Text>
          </View>
        )}

        <View style={styles.terms}>
          <Text style={styles.sectionTitle}>الشروط والأحكام</Text>
          <Text>
            {`هذا المستند هو عرض رسمي من مسار للتصميم الداخلي. جميع الأسعار المذكورة أعلاه قابلة للتغيير حسب التعديلات على نطاق العمل. تخضع هذه الاتفاقية للشروط والأحكام المتفق عليها بين الطرفين.`}
          </Text>
        </View>

        <View style={styles.signaturePlaceholder}>
          <Text style={{ fontSize: 9, color: GRAY, marginBottom: 4 }}>توقيع العميل</Text>
          <View style={styles.signatureLine} />
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>MASAR Interior Design Studio</Text>
            <Text style={styles.footerText}>{orderNumber} | {new Date().toLocaleDateString('ar-SA')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
