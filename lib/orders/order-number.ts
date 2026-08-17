export async function generateOrderNumber(supabase: any): Promise<string> {
  const year = new Date().getFullYear()

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01T00:00:00Z`)
    .lte('created_at', `${year}-12-31T23:59:59Z`)

  const seq = (count ?? 0) + 1
  return `MASAR-${year}-${String(seq).padStart(5, '0')}`
}
