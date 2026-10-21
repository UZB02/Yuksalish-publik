import { onScopeDispose, ref, watchEffect, type Ref } from 'vue'

export interface HeaderInfo {
  name: string
  slug?: string
  logoUrl?: string | null
  updatedAt?: string | null
  /** Maktablar reytingiga havola ko'rsatilsinmi */
  globalAvailable?: boolean
}

// Header va footer ma'lumoti: sahifa (view) tomonidan to'ldiriladi.
export const headerInfo = ref<HeaderInfo | null>(null)

/** Sahifa sarlavhasi (`<title>`) va header ma'lumotini boshqaradi; chiqishda tozalaydi. */
export function usePageInfo(info: Ref<HeaderInfo | null>, title: Ref<string>) {
  watchEffect(() => {
    headerInfo.value = info.value
    document.title = title.value
  })
  onScopeDispose(() => {
    headerInfo.value = null
  })
}
