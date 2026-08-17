import type { Metadata } from 'next'
import { getContactMessages, getAllContactMessageTypes, getUnreadContactMessagesCount } from '@/lib/admin/actions'
import { ContactMessagesClient } from '@/components/admin/contact-messages/messages-client'

export const metadata: Metadata = {
  title: 'رسائل التواصل | مسار Admin',
}

export default async function ContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const tab = params.tab as string

  // Validate tab
  const validTabs = ['new', 'in_progress', 'contacted', 'closed', 'trashed', 'all']
  const statusTab = validTabs.includes(tab) ? tab : 'new'

  const [{ messages, total }, { types }, unreadCount] = await Promise.all([
    getContactMessages({
      page,
      pageSize: 15,
      status: statusTab !== 'all' ? (statusTab as any) : undefined,
      search: params.q as string,
      typeId: params.type as string,
      hasAttachment: params.attachment === 'true' ? true : undefined,
      dateFrom: params.dateFrom as string,
      dateTo: params.dateTo as string,
    }),
    getAllContactMessageTypes(),
    getUnreadContactMessagesCount(),
  ])

  return (
    <ContactMessagesClient
      initialMessages={messages}
      totalMessages={total}
      messageTypes={types}
      initialStatus={statusTab}
      initialPage={page}
      unreadCount={unreadCount}
    />
  )
}
