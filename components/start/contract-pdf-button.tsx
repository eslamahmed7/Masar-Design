'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

export function ContractPDFButton({ formData, selectedService, finalTotal, currency = 'SAR', onDownload }: any) {
  const { t } = useI18n()
  const [isGenerating, setIsGenerating] = useState(false)
  const [html2pdfLoaded, setHtml2pdfLoaded] = useState(false)
  const pdfContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load html2pdf dynamically
    if (typeof window !== 'undefined' && !(window as any).html2pdf) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => setHtml2pdfLoaded(true)
      document.body.appendChild(script)
    } else {
      setHtml2pdfLoaded(true)
    }
  }, [])

  const generatePDF = async () => {
    if (!pdfContentRef.current) return
    setIsGenerating(true)
    console.log("==> Generating PDF via isolated iframe (NEW VERSION v3) <==")

    try {
      const element = pdfContentRef.current
      const optData = {
        margin:       [10, 10, 10, 10],
        filename:     `عقد_مشروع_${formData.projectName || 'مسار'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      }

      // Create an isolated iframe
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.top = '-9999px'
      iframe.style.left = '-9999px'
      iframe.style.width = '1000px'
      iframe.style.height = '1000px'
      iframe.style.border = 'none'
      iframe.style.zIndex = '-9999'
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      const iframeWin = iframe.contentWindow as any

      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(`
          <!DOCTYPE html>
          <html dir="rtl">
            <head>
              <meta charset="utf-8">
              <style>
                body { margin: 0; padding: 0; background: #fff; }
                * { box-sizing: border-box; }
              </style>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `)
        iframeDoc.close()
        
        // Wait for iframe to load completely (including html2pdf.js)
        iframe.onload = async () => {
          try {
            const targetElement = iframeDoc.getElementById('pdf-content') || iframeDoc.body
            if (targetElement) {
              targetElement.style.display = 'block'
              targetElement.style.position = 'static'
            }

            // Ensure images are loaded inside the iframe
            const images = Array.from(iframeDoc.querySelectorAll('img'))
            await Promise.all(images.map(img => {
              if (img.complete) return Promise.resolve()
              return new Promise(resolve => {
                img.onload = resolve
                img.onerror = resolve
              })
            }))
            
            // We MUST parse optData using the iframe's JSON parser so that Arrays and Objects
            // belong to the iframe's context, bypassing any html2pdf cross-frame instance bugs.
            const opt = iframeWin.JSON.parse(JSON.stringify(optData))
            
            // Output as blob to avoid iframe download restrictions
            const pdfBlob = await iframeWin.html2pdf().set(opt).from(targetElement).output('blob')
            
            // Trigger download from the PARENT window
            const url = URL.createObjectURL(pdfBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = optData.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            
            // Cleanup
            document.body.removeChild(iframe)
            onDownload()
          } catch (error) {
            console.error('Error inside iframe PDF generation:', error)
            document.body.removeChild(iframe)
          } finally {
            setIsGenerating(false)
          }
        }
      } else {
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Error generating PDF', error)
      setIsGenerating(false)
    }
  }

  const currentDate = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Determine Arabic translation for currency
  const currencyAr = currency === 'SAR' ? 'ريال سعودي' : currency === 'EGP' ? 'جنيه مصري' : currency === 'USD' ? 'دولار أمريكي' : currency;

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        onClick={generatePDF}
        disabled={isGenerating || !html2pdfLoaded}
        className="w-full border-gold bg-gold/10 text-gold hover:bg-gold hover:text-white transition-all py-6 text-base font-bold shadow-[0_0_15px_rgba(201,168,106,0.2)]"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
        ) : (
          <FileText className="w-5 h-5 ml-2" />
        )}
        {isGenerating ? t('startJourney.pdfDownloading') : t('startJourney.pdfDownload')}
        <Download className="w-4 h-4 mr-2 opacity-50" />
      </Button>

        {/* Hidden HTML Template for PDF */}
      <div 
        id="pdf-content"
        ref={pdfContentRef} 
        style={{ display: 'none', backgroundColor: '#ffffff', color: '#000000', width: '800px', padding: '2.5rem', position: 'fixed', top: 0, left: 0, zIndex: -9999 }} 
        dir="rtl"
      >
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#111827', backgroundColor: '#ffffff' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #ca8a04' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>وثيقة تفاصيل المشروع والتعاقد</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>تاريخ الإصدار: {currentDate}</p>
            </div>
            <div>
              <img src="/logo-masar.png" alt="مسار" style={{ height: '4rem', objectFit: 'contain' }} crossOrigin="anonymous" />
            </div>
          </div>

          {/* Section 1: Project Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '0.5rem', marginBottom: '1rem', borderRadius: '0.25rem', color: '#a16207', backgroundColor: '#fefce8', borderRight: '4px solid #ca8a04' }}>1. البيانات الأساسية للمشروع</h2>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', width: '33.33%', color: '#374151', backgroundColor: '#f9fafb' }}>اسم المشروع:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.projectName || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>الدولة:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.country || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>العنوان بالكامل:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.city || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>مساحة المشروع (م²):</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.area || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>نمط التصميم المفضل:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.styles?.length > 0 ? formData.styles.join('، ') : 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>اسم العميل:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.clientName || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>رقم الموبايل:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }} dir="ltr">{formData.mobile || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>رقم الواتساب:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }} dir="ltr">{formData.whatsapp || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>البريد الإلكتروني:</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#111827' }}>{formData.email || 'غير محدد'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Services and Pricing */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '0.5rem', marginBottom: '1rem', borderRadius: '0.25rem', color: '#a16207', backgroundColor: '#fefce8', borderRight: '4px solid #ca8a04' }}>2. الخدمات والتسعير التقديري</h2>
            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', width: '33.33%', color: '#374151', backgroundColor: '#f9fafb' }}>الخدمة المختارة:</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#111827' }}>{selectedService?.name_ar || selectedService?.name || 'غير محدد'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#374151', backgroundColor: '#f9fafb' }}>إجمالي التكلفة التقديرية:</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', fontSize: '1.125rem', color: '#a16207' }}>{finalTotal.toLocaleString()} {currencyAr}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>* ملاحظة: هذه التكلفة تقديرية بناءً على المدخلات وقد تتغير بعد المعاينة والمناقشة النهائية.</p>
          </div>

          {/* Section 3: Terms and Conditions */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '0.5rem', marginBottom: '1rem', borderRadius: '0.25rem', color: '#a16207', backgroundColor: '#fefce8', borderRight: '4px solid #ca8a04' }}>3. القواعد والشروط الأساسية</h2>
            <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', paddingRight: '1rem', margin: 0, color: '#374151' }}>
              <li style={{ marginBottom: '0.5rem' }}>يوافق العميل المذكور بياناته أعلاه على التكلفة التقديرية ونطاق العمل الموضح في هذه الوثيقة.</li>
              <li style={{ marginBottom: '0.5rem' }}>يبدأ العمل واحتساب المدة الزمنية المحددة للتنفيذ بعد استلام الدفعة الأولى المتفق عليها.</li>
              <li style={{ marginBottom: '0.5rem' }}>أي تعديلات جذرية تخرج عن نطاق التصميم المتفق عليه سيتم احتسابها بتكلفة إضافية ومدة إضافية.</li>
              <li style={{ marginBottom: '0.5rem' }}>تظل جميع التصاميم والمخططات ملكية فكرية لمسار (Masar) ولا يحق استخدامها حتى يتم سداد كامل المستحقات.</li>
              <li style={{ marginBottom: '0.5rem' }}>في حال عدم شمول الخدمة لزيارة الموقع، يتحمل العميل المسؤولية الكاملة عن صحة ودقة القياسات المقدمة.</li>
            </ul>
          </div>

          {/* Section 4: Client Obligations */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', padding: '0.5rem', marginBottom: '1rem', borderRadius: '0.25rem', color: '#a16207', backgroundColor: '#fefce8', borderRight: '4px solid #ca8a04' }}>4. التزامات العميل</h2>
            <ul style={{ listStyleType: 'disc', listStylePosition: 'inside', paddingRight: '1rem', margin: 0, color: '#374151' }}>
              <li style={{ marginBottom: '0.5rem' }}>توفير كافة المخططات السابقة والموافقات اللازمة في الوقت المحدد لتجنب تأخير المشروع.</li>
              <li style={{ marginBottom: '0.5rem' }}>تسهيل الوصول للموقع في أوقات العمل المتفق عليها في حال تطلب الأمر معاينة أو تنفيذ.</li>
              <li style={{ marginBottom: '0.5rem' }}>الالتزام بجدول الدفعات المالية كما سيتم الاتفاق عليه في العقد النهائي.</li>
              <li style={{ marginBottom: '0.5rem' }}>الرد على الاستفسارات والاعتمادات خلال مدة أقصاها 48 ساعة من إرسالها لضمان سير العمل.</li>
            </ul>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderTop: '2px solid #e5e7eb', color: '#6b7280' }}>
            <div>
              <p style={{ margin: 0 }}>مؤسسة مسار للتصميم المعماري والديكور</p>
              <p style={{ margin: 0 }}>تم استخراج هذه الوثيقة آلياً من النظام وتعتبر وثيقة أولية.</p>
            </div>
            <div style={{ textAlign: 'left' }} dir="ltr">
              <p style={{ margin: 0 }}>Masar Design Studio</p>
              <p style={{ margin: 0 }}>www.masar.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
