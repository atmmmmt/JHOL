export interface ContentMeta {
  tabKey?: string
  tabLabel?: string
  sidebarGroup?: string
  groupOrder?: number
  tabOrder?: number
  sectionKey?: string
  sectionType?: string
  shared?: boolean
  assignToPages?: string[]
  sourceContentTypes?: number[]
}

export type JsonPrimitive = string | number | boolean | null

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | {
      [key: string]: JsonValue
    }

export interface ContentApiRecord {
  id: string
  contentType: number
  contentTypeName: string
  jsonContent: string
  createdAt: string
  updatedAt: string | null
}

export type ContentBody = Record<string, JsonValue> & {
  _meta?: ContentMeta
  background?: string
  content?: string
}

export interface ParsedContentRecord
  extends Omit<ContentApiRecord, 'jsonContent'> {
  rawJsonContent: string
  body: ContentBody
  meta: ContentMeta
}

export type ContentListItem = ParsedContentRecord
export type ContentDetail = ParsedContentRecord

export interface SidebarItem extends ContentListItem {
  sidebarId: string
  routePath: string
  sidebarTitle: string
  sidebarChild?: boolean
  parentSidebarId?: string
}

export interface SidebarGroup {
  key: string
  title: string
  groupOrder: number
  items: SidebarItem[]
}
