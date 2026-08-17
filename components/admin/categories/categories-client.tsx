'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight, Check, X, Loader2, Tag,
  Home, Building, Palmtree, Castle, Store, Utensils, ShoppingBag, Hotel,
  Briefcase, Building2, Users, Presentation, Activity, Stethoscope, Hospital, Pill,
  GraduationCap, Baby, School, BookOpen, Layout, Grid, Layers, Box, Armchair, BedDouble
} from 'lucide-react'
import {
  createCategory, updateCategory, deleteCategory,
  createSubcategory, deleteSubcategory,
} from '@/lib/admin/actions'
import type { DBCategory, DBSubcategory } from '@/lib/admin/types'

interface Props { initialCategories: DBCategory[] }

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Building, Palmtree, Castle, Store, Utensils, ShoppingBag, Hotel,
  Briefcase, Building2, Users, Presentation, Activity, Stethoscope, Hospital, Pill,
  GraduationCap, Baby, School, BookOpen, Layout, Grid, Layers, Box, Armchair, BedDouble
}

const PRESET_ICONS = Object.keys(ICON_MAP)

const ICON_NAMES_AR: Record<string, string> = {
  Home: 'منزل / سكني',
  Building: 'عمارة / شقق',
  Palmtree: 'شاليه / ساحلي',
  Castle: 'قصر',
  Store: 'محل تجاري',
  Utensils: 'مطعم / كافيه',
  ShoppingBag: 'تسوق / بيع بالتجزئة',
  Hotel: 'فندق',
  Briefcase: 'إداري / أعمال',
  Building2: 'مقر شركة',
  Users: 'مساحة عمل مشتركة',
  Presentation: 'قاعة اجتماعات',
  Activity: 'نشاط / طبي',
  Stethoscope: 'عيادة',
  Hospital: 'مستشفى',
  Pill: 'صيدلية',
  GraduationCap: 'تعليمي',
  Baby: 'حضانة / أطفال',
  School: 'مدرسة',
  BookOpen: 'مركز تعليمي / مكتبة',
  Layout: 'مخطط',
  Grid: 'شبكة',
  Layers: 'طبقات',
  Box: 'صندوق',
  Armchair: 'أثاث / جلوس',
  BedDouble: 'غرفة نوم'
}

function CategoryIcon({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) {
  const Icon = ICON_MAP[name]
  if (Icon) return <Icon size={size} className={className} />
  return <span className={className} style={{ fontSize: size }}>{name || '📁'}</span>
}

export function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState<DBCategory[]>(initialCategories)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [subCreatingId, setSubCreatingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form state for new category
  const [newName, setNewName] = useState('')
  const [newNameAr, setNewNameAr] = useState('')
  const [newIcon, setNewIcon] = useState(PRESET_ICONS[0])
  const [newDesc, setNewDesc] = useState('')

  // Form state for edit
  const [editName, setEditName] = useState('')
  const [editNameAr, setEditNameAr] = useState('')
  const [editIcon, setEditIcon] = useState(PRESET_ICONS[0])

  // Subcategory form
  const [subName, setSubName] = useState('')
  const [subNameAr, setSubNameAr] = useState('')
  const [subIcon, setSubIcon] = useState(PRESET_ICONS[0])

  const handleCreate = () => {
    if (!newName.trim()) return
    startTransition(async () => {
        const res = await createCategory({ name: newName.trim(), name_ar: newNameAr.trim() || undefined, icon: newIcon.trim() || undefined, description: newDesc.trim() || undefined })
        if (res.category) {
          setCategories(prev => [...prev, { ...res.category!, subcategories: [] }])
          setNewName(''); setNewNameAr(''); setNewIcon(PRESET_ICONS[0]); setNewDesc('')
          setCreating(false)
        }
    })
  }

  const handleUpdate = (cat: DBCategory) => {
    startTransition(async () => {
      const res = await updateCategory(cat.id, { name: editName, name_ar: editNameAr || null, icon: editIcon || null })
      if (res.category) {
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name: editName, name_ar: editNameAr || null, icon: editIcon || null } : c))
        setEditId(null)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('حذف هذا التصنيف وجميع تصنيفاته الفرعية؟')) return
    startTransition(async () => {
      await deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    })
  }

  const handleCreateSub = (catId: string) => {
    if (!subName.trim()) return
    startTransition(async () => {
        const res = await createSubcategory({ category_id: catId, name: subName.trim(), name_ar: subNameAr.trim() || undefined, icon: subIcon.trim() || undefined })
        if (res.subcategory) {
          setCategories(prev => prev.map(c => c.id === catId
            ? { ...c, subcategories: [...(c.subcategories ?? []), res.subcategory!] }
            : c
          ))
          setSubName(''); setSubNameAr(''); setSubIcon(PRESET_ICONS[0])
          setSubCreatingId(null)
        }
    })
  }

  const handleDeleteSub = (catId: string, subId: string) => {
    startTransition(async () => {
      await deleteSubcategory(subId)
      setCategories(prev => prev.map(c => c.id === catId
        ? { ...c, subcategories: (c.subcategories ?? []).filter(s => s.id !== subId) }
        : c
      ))
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6D3]">التصنيفات</h1>
          <p className="text-[#888] text-sm mt-1">إدارة التصنيفات والتصنيفات الفرعية</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-sm font-bold hover:bg-[#d4b87a] transition-colors"
        >
          <Plus size={15} /> تصنيف جديد
        </button>
      </div>

      {/* New category form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#1A1916] border border-[#C8A96A]/30 rounded-2xl p-5 space-y-3"
          >
            <h3 className="text-[#F0E6D3] font-semibold text-sm">تصنيف جديد</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="الاسم بالإنجليزية *"
                className="bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none"
              />
              <input
                value={newNameAr} onChange={e => setNewNameAr(e.target.value)}
                placeholder="الاسم بالعربية"
                className="bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none"
                dir="rtl"
              />
              <input
                value={newDesc} onChange={e => setNewDesc(e.target.value)}
                placeholder="وصف التصنيف"
                className="bg-[#0E0D0B] border border-[#333] rounded-xl px-3 py-2 text-[#F0E6D3] text-sm placeholder:text-[#555] focus:border-[#C8A96A]/50 focus:outline-none"
              />
              {/* Preset Icon Picker Grid */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#C0B090] mb-2">اختر أيقونة للتصنيف</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0E0D0B] border border-[#333] rounded-xl max-h-24 overflow-y-auto">
                  {PRESET_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewIcon(iconName)}
                      title={ICON_NAMES_AR[iconName] ?? iconName}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIcon === iconName ? 'bg-[#C8A96A] text-[#0E0D0B] scale-110 shadow-lg' : 'hover:bg-white/5 bg-transparent text-[#F0E6D3]'}`}
                    >
                      <CategoryIcon name={iconName} size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C8A96A] text-[#0E0D0B] rounded-xl text-xs font-bold hover:bg-[#d4b87a] transition-colors disabled:opacity-50">
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} حفظ
              </button>
              <button onClick={() => setCreating(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#222] text-[#888] rounded-xl text-xs hover:text-[#F0E6D3] transition-colors">
                <X size={13} /> إلغاء
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories list */}
      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-center py-16 text-[#555]">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد تصنيفات بعد. أضف أول تصنيف.</p>
          </div>
        )}
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#1A1916] border border-[#C8A96A]/10 rounded-2xl overflow-hidden"
          >
            {/* Category row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <button
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                className="p-1 rounded-lg text-[#666] hover:text-[#C8A96A] transition-colors"
              >
                {expandedId === cat.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>

              {editId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="bg-[#0E0D0B] border border-[#C8A96A]/40 rounded-lg px-2 py-1 text-[#F0E6D3] text-sm w-36 focus:outline-none" />
                  <input value={editNameAr} onChange={e => setEditNameAr(e.target.value)}
                    className="bg-[#0E0D0B] border border-[#333] rounded-lg px-2 py-1 text-[#F0E6D3] text-sm w-32 focus:outline-none" dir="rtl" />
                  <select value={editIcon} onChange={e => setEditIcon(e.target.value)}
                    className="bg-[#0E0D0B] border border-[#333] rounded-lg px-2 py-1 text-[#F0E6D3] text-sm w-36 focus:outline-none">
                    <option value="">اختر أيقونة</option>
                    {PRESET_ICONS.map(iconName => (
                      <option key={iconName} value={iconName}>{ICON_NAMES_AR[iconName] ?? iconName}</option>
                    ))}
                  </select>
                  <button onClick={() => handleUpdate(cat)} disabled={isPending}
                    className="p-1.5 bg-[#C8A96A]/20 text-[#C8A96A] rounded-lg hover:bg-[#C8A96A]/30 transition-colors">
                    {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  </button>
                  <button onClick={() => setEditId(null)}
                    className="p-1.5 bg-[#333] text-[#888] rounded-lg hover:text-[#F0E6D3] transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-3">
                  {cat.icon && <CategoryIcon name={cat.icon} size={16} className="text-[#C8A96A]" />}
                  <span className="text-[#F0E6D3] font-medium text-sm">{cat.name}</span>
                  {cat.name_ar && <span className="text-[#888] text-xs">{cat.name_ar}</span>}
                  <span className="text-[#555] text-xs">({(cat.subcategories ?? []).length} فرعي)</span>
                </div>
              )}

              <div className="flex items-center gap-1 ml-auto">
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                  cat.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-[#333]/60 text-[#888] border-[#444]'
                }`}>
                  {cat.status === 'active' ? 'نشط' : 'مخفي'}
                </span>
                <button
                  onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditNameAr(cat.name_ar ?? ''); setEditIcon(cat.icon ?? '') }}
                  className="p-1.5 text-[#666] hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 rounded-lg transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-[#666] hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <AnimatePresence>
              {expandedId === cat.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-[#C8A96A]/8"
                >
                  <div className="px-5 py-3 space-y-2">
                    {(cat.subcategories ?? []).map(sub => (
                      <div key={sub.id} className="flex items-center gap-2 py-1.5 px-3 bg-[#0E0D0B]/50 rounded-xl">
                        {sub.icon && <CategoryIcon name={sub.icon} size={14} className="text-[#C8A96A]" />}
                        <span className="text-[#F0E6D3] text-sm flex-1">{sub.name}</span>
                        {sub.name_ar && <span className="text-[#888] text-xs">{sub.name_ar}</span>}
                        <button onClick={() => handleDeleteSub(cat.id, sub.id)}
                          className="p-1 text-[#555] hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Add subcategory */}
                    {subCreatingId === cat.id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input value={subName} onChange={e => setSubName(e.target.value)}
                          placeholder="الاسم *"
                          className="bg-[#0E0D0B] border border-[#C8A96A]/40 rounded-lg px-2 py-1.5 text-[#F0E6D3] text-sm flex-1 focus:outline-none" />
                        <input value={subNameAr} onChange={e => setSubNameAr(e.target.value)}
                          placeholder="العربية"
                          className="bg-[#0E0D0B] border border-[#333] rounded-lg px-2 py-1.5 text-[#F0E6D3] text-sm w-28 focus:outline-none" dir="rtl" />
                        <select value={subIcon} onChange={e => setSubIcon(e.target.value)}
                          className="bg-[#0E0D0B] border border-[#333] rounded-lg px-2 py-1.5 text-[#F0E6D3] text-sm w-36 focus:outline-none">
                          <option value="">اختر أيقونة</option>
                          {PRESET_ICONS.map(iconName => (
                            <option key={iconName} value={iconName}>{ICON_NAMES_AR[iconName] ?? iconName}</option>
                          ))}
                        </select>
                        <button onClick={() => handleCreateSub(cat.id)} disabled={isPending}
                          className="p-1.5 bg-[#C8A96A]/20 text-[#C8A96A] rounded-lg hover:bg-[#C8A96A]/30">
                          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button onClick={() => setSubCreatingId(null)}
                          className="p-1.5 bg-[#333] text-[#888] rounded-lg"><X size={13} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSubCreatingId(cat.id)}
                        className="flex items-center gap-1.5 text-xs text-[#C8A96A] hover:text-[#d4b87a] transition-colors pt-1"
                      >
                        <Plus size={12} /> إضافة تصنيف فرعي
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
