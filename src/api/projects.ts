import { supabase } from '../lib/supabase'
import { projects as mockProjects } from '../mockData'
import type { Project } from '../mockData'

/**
 * 获取业务项目列表
 * @description 目前如果未连接真实的 Supabase 或者真实数据为空，将优雅降级回传 MockData。
 */
export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase.from('projects').select('*')
    
    if (error || !data || data.length === 0) {
      console.warn('Supabase projects null/error, fallback to mock data.', error?.message)
      return mockProjects
    }

    // 这里将数据库的数据转换成前端看板所识别的聚合数据模型
    return data.map((row: any) => ({
      id: row.id,
      name: row.name || `${row.region || ''}项目`,
      district: row.region || '未知区域',
      status: row.status as any,
      projectType: row.project_type as any,
      sales: row.sales || '--',
      pm: row.pm || '--',
      contractAmount: Number(row.contract_amount) || 0,
      receivedPayment: Number(row.received_payment) || 0,
      progress: parseInt(row.cost_progress || '0', 10),
      planProfitRate: row.contract_amount ? ((Number(row.contract_amount) - Number(row.total_cost_incurred)) / Number(row.contract_amount) * 100) : 0,
      externalHRRatioLimit: 30,
      actualCost: Number(row.total_cost_incurred) || 0,
      totalPlanCost: Number(row.total_plan_cost) || 0,
      totalPlanDeliveryCost: Number(row.total_plan_delivery_cost) || 0,
      totalPlanBusinessCost: Number(row.total_plan_business_cost) || 0,
      actualDeliveryCost: 0, // 暂无法单表确切获取外部+内部聚合，需要其他关联查询补充
      deliveryCostRatio: 0,
      deliveryCostProgress: 0,
    }))
  } catch (err) {
    console.error('Fetch projects exception:', err)
    return mockProjects
  }
}
