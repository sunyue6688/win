import { generateOverview } from '../mockData'
import type { DepartmentOverview } from '../mockData'

export async function fetchOverview(): Promise<DepartmentOverview> {
  try {
    // 总览数据一般由汇总获得，我们使用 rpc 或者复合 select 来计算。
    // 在真实连通 Supabase 后，可替换此处。
    
    console.info('Fetching overview aggregated stats from Supabase...')
    
    // Fallback 到本地 Mock 计算逻辑
    return generateOverview()
  } catch (err) {
    return generateOverview()
  }
}
