import { generateSalesTargets } from '../mockData'
import type { SalesTarget } from '../mockData'

export async function fetchSalesTargets(): Promise<SalesTarget[]> {
  try {
    // 连接到真实的机会/销售关联数据库
    
    // Fallback 到本地 Mock 计算逻辑
    return generateSalesTargets()
  } catch (err) {
    return generateSalesTargets()
  }
}
