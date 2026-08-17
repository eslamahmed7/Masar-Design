import { getCategories } from '@/lib/admin/actions'
import { CategoriesClient } from '@/components/admin/categories/categories-client'

export const metadata = { title: 'التصنيفات — مسار' }

export default async function CategoriesPage() {
  const { categories } = await getCategories()
  return <CategoriesClient initialCategories={categories} />
}
