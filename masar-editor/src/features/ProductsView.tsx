import { useEffect } from 'react'
import { useStore } from '../core/store'
import { Icon } from '../components/Icon'
import ProductsPanel from './ProductsPanel'
import PropertiesInspector from '../shell/PropertiesInspector'

export default function ProductsView() {
  const project = useStore((s) => s.project)
  const pickTarget = useStore((s) => s.productsPickTarget)
  const closeProductsView = useStore((s) => s.closeProductsView)
  const pickProduct = useStore((s) => s.pickProduct)
  const select = useStore((s) => s.select)
  const setInspectorVisible = useStore((s) => s.setInspectorVisible)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeProductsView()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeProductsView])

  if (!project) return null

  return (
    <div className="products-view">
      <div className="pv-bar">
        <button className="pv-back" onClick={closeProductsView} title="الرجوع للورك فلو">
          <Icon name="arrow-right" size={15} />
          <span>رجوع</span>
        </button>
        <span className="pv-icon"><Icon name="grid" size={15} /></span>
        <span className="pv-title">قسم المنتجات</span>
        <span className="pv-count">{project.products.length} منتج</span>
        {pickTarget ? (
          <span className="pv-pick-hint">
            <Icon name="info" size={12} />
            اختر منتجاً لربطه بالنقطة الحالية
          </span>
        ) : (
          <span className="pv-hint">المنتج يُنشأ مرة واحدة ويُستخدم في أي عدد من الغرف والنقاط</span>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-sm"
          onClick={() => {
            setInspectorVisible(true)
            select({ type: 'none' })
          }}
        >
          <Icon name="settings" size={12} /> خصائص
        </button>
      </div>
      <div className="pv-body">
        <div className="pv-main">
          <ProductsPanel onPick={pickTarget ? pickProduct : undefined} />
        </div>
        <div className="pv-inspector">
          <PropertiesInspector />
        </div>
      </div>
    </div>
  )
}
