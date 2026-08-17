export type HotspotType = 'navigate' | 'info' | 'external' | 'pdf' | 'product'

export type NavStyle = 'compass' | 'arrow' | 'circle' | 'diamond' | 'door' | 'flag'

export interface Hotspot {
  id: string
  type: HotspotType
  yaw: number
  pitch: number
  label: string
  visible: boolean
  navStyle?: NavStyle
  targetRoomId?: string
  infoCardId?: string
  productId?: string
  pdfId?: string
  url?: string
}

export interface InfoKeyValue {
  key: string
  value: string
}

export interface InfoDownload {
  id: string
  name: string
  path: string
}

export interface InfoLink {
  id: string
  label: string
  url: string
}

export interface InfoCard {
  id: string
  title: string
  description: string
  images: string[]
  videos: string[]
  dimensions: InfoKeyValue[]
  specifications: InfoKeyValue[]
  notes: string[]
  downloads: InfoDownload[]
  links: InfoLink[]
}

export interface MaterialVariant {
  id: string
  label: string
  panorama?: string
  thumbnail?: string
}

export interface Room {
  id: string
  name: string
  nameEn: string
  description: string
  panorama?: string
  lighting?: string
  materials: MaterialVariant[]
  thumbnail?: string
  hotspots: Hotspot[]
  infoCards: InfoCard[]
  connectedRooms: string[]
  hidden: boolean
  order: number
}

export interface FloorPlanPoint {
  id: string
  roomId: string
  x: number
  y: number
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  images: string[]
  dimensions: string
  material: string
  color: string
  buyUrl: string
  tags: string[]
  createdAt: number
}

export interface ProjectPdf {
  id: string
  name: string
  path: string
  description: string
  linkedRoomIds: string[]
  linkedProductIds: string[]
}

export interface Project {
  id: string
  name: string
  clientName: string
  companyName: string
  description: string
  location: string
  coverPath: string | null
  logoPath: string | null
  createdAt: number
  updatedAt: number
  rooms: Room[]
  floorPlanImage?: string
  floorPlanPoints: FloorPlanPoint[]
  products: Product[]
  pdfs: ProjectPdf[]
}

export type ExplorerKind =
  | 'project'
  | 'rooms'
  | 'floorplan'
  | 'products'
  | 'pdfs'
  | 'materials'
  | 'lighting'

export type Selection =
  | { type: 'room'; id: string }
  | { type: 'hotspot'; roomId: string; id: string }
  | { type: 'infocard'; roomId: string; id: string }
  | { type: 'floorplanpoint'; id: string }
  | { type: 'product'; id: string }
  | { type: 'pdf'; id: string }
  | { type: 'none' }

export interface ProjectMeta {
  id: string
  name: string
  clientName: string
  companyName: string
  updatedAt: number
  createdAt: number
  coverPath: string | null
}
