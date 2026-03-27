/**
 * V8 统一 Mock 数据
 */

// ============ 类型定义 ============

export type ProjectType = '存量' | '新增'
export type ProjectStatus = '交付中' | '验收完成' | '已验收运维中' | '已结项'

export interface Project {
  id: string
  name: string
  district: string
  status: ProjectStatus
  projectType: ProjectType
  sales: string
  pm: string
  contractAmount: number           // 合同签约金额
  receivedPayment: number          // 已回款金额
  progress: number
  planProfitRate: number           // 计划利润率
  externalHRRatioLimit: number     // 外采占比上限
  actualCost: number               // 总成本
  // V8 新增字段
  totalPlanCost: number            // 总计划成本
  totalPlanExternalCost: number    // 总计划外采成本
  totalPlanBusinessCost: number    // 总计划商务成本
  deliveryCostRatio: number        // 交付成本占比
  deliveryEfficiency: number       // 交付成本效率
  costBreakdown?: {
    internalHR: number
    externalHR: number
    businessCost: number
    otherCost: number
  }
}

export interface SalesTarget {
  name: string
  district: string
  projectCount: number
  totalContractAmount: number      // 签约总金额
  totalReceivedPayment: number     // 已回款总金额
  totalPlanCost: number            // 总计划成本
  totalPlanDeliveryCost: number    // 总计划交付成本
  actualCost: number               // 实际成本
  actualDeliveryCost: number       // 实际交付成本
  deliveryCostRatio: number        // 交付成本占比
  deliveryEfficiency: number       // 整体交付效率
  contributionValue: number        // 贡献值
  // 保留旧字段兼容
  planRevenue: number
  actualRevenue: number
  planProfitRate: number
  actualProfitRate: number
}

export interface PMSummary {
  pm: string
  projectCount: number
  totalContractAmount: number      // 签约总金额
  totalReceivedPayment: number     // 已回款总金额
  totalPlanCost: number            // 总计划成本
  totalPlanDeliveryCost: number    // 总计划交付成本
  actualCost: number               // 实际成本
  actualDeliveryCost: number       // 实际交付成本
  deliveryCostRatio: number        // 交付成本占比（超30%预警）
  deliveryEfficiency: number       // 整体交付效率（>1优秀，=1达标，<1预警）
  contributionValue: number        // 贡献值（万元）
  // 保留旧字段用于兼容
  estimatedCost: number
  estimatedProfit: number
  estimatedProfitRate: number
  externalHRRatio: number
  externalHRRatioLimit: number
}

export interface CostSubCategory {
  name: string
  plan: number
  actual: number
  q1: number
  q2: number
  description: string
}

export interface DepartmentOverview {
  year: number
  // 收入相关
  contractRevenue: number      // 合同签约收入
  actualRevenue: number        // 实际回款
  planRevenue: number          // 年度收入计划
  // 成本相关
  totalPlanCost: number
  totalActualCost: number
  costRatio: number            // 计划成本/签约收入
  costRatioLimit: number       // 成本基准值（30%）
  // 利润相关
  actualProfit: number         // 实时预测毛利润
  planProfit: number           // 计划毛利润
  // 成本分类（三级树形结构）
  costCategories: CostCategory[]
  // 项目统计
  projectStats: {
    total: number
    inProgress: number
    signed: number
    pending: number
    completed: number
    existing: number
    newProjects: number
    // 新增项目状态细分
    delivering: number         // 交付中
    acceptanceDone: number     // 验收完成
    maintenance: number        // 已验收运维中
    closed: number             // 已结项
  }
}

// 三级成本分类结构
export interface CostCategory {
  key: string
  name: string
  level: 1 | 2 | 3
  plan: number
  actual: number
  q1: number
  q2: number
  current: number         // 当前总消耗
  remaining: number       // 剩余可用
  usagePct: number        // 使用进度
  isInternal?: boolean    // 内部成本标记（视觉降级）
  children?: CostCategory[]
}

// ============ Mock 常量 ============

const districts = [
  '成都市本级', '四川省', '锦江区', '青羊区', '金牛区', '武侯区', '成华区',
  '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区', '新津区',
  '都江堰市', '彭州市', '邛崃市', '崇州市', '简阳市', '金堂县', '大邑县',
  '蒲江县', '高新区', '天府新区',
]

const salesNames = ['张伟', '李娜', '王强', '赵敏', '刘洋']
const pmNames = ['陈工', '周工', '吴工', '郑工', '林工']

function randomBetween(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min)
}

const DEPT_CONFIG = {
  planProfitRate: 20,
  costCategoryLimits: {
    '外采人力': 5000000,
    '商务费用': 2000000,
    '其他': 1000000,
  },
  projectDefaults: {
    externalHRRatioLimit: 0.15,
    otherCostLimit: 0.05,
    minProfitRate: 30,
  },
}

// ============ 数据生成 ============

export function generateProjects(): Project[] {
  return districts.map((d, i) => {
    const isExisting = i < 8
    const contractAmount = randomBetween(80, 500) * 10000
    const receivedPayment = Math.round(contractAmount * (0.3 + Math.random() * 0.5))
    const progressPct = randomBetween(30, 90)

    if (isExisting) {
      const actualCost = Math.round(contractAmount * (0.6 + Math.random() * 0.2))
      const totalPlanCost = Math.round(actualCost * 0.95)
      const totalPlanExternalCost = Math.round(totalPlanCost * 0.3)
      const totalPlanBusinessCost = Math.round(totalPlanCost * 0.1)
      const actualDeliveryCost = Math.round(actualCost * 0.65)
      const deliveryCostRatio = actualCost > 0 ? (actualDeliveryCost / actualCost) * 100 : 0
      const deliveryEfficiency = actualDeliveryCost > 0 ? (totalPlanExternalCost * progressPct / 100) / actualDeliveryCost : 0
      return {
        id: `proj-${i + 1}`,
        name: `${d}信息化项目`,
        district: d,
        status: '已结项' as ProjectStatus,
        projectType: '存量' as ProjectType,
        sales: salesNames[i % salesNames.length],
        pm: pmNames[i % pmNames.length],
        contractAmount,
        receivedPayment,
        progress: 100,
        planProfitRate: 25,
        externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit,
        actualCost,
        // V8 新增字段
        totalPlanCost,
        totalPlanExternalCost,
        totalPlanBusinessCost,
        deliveryCostRatio,
        deliveryEfficiency,
        costBreakdown: {
          internalHR: Math.round(actualCost * 0.45),
          externalHR: Math.round(actualCost * 0.30),
          businessCost: Math.round(actualCost * 0.15),
          otherCost: Math.round(actualCost * 0.10),
        },
      }
    } else {
      const totalCost = Math.round(contractAmount * (0.55 + Math.random() * 0.25))
      const internalHR = Math.round(totalCost * (0.35 + Math.random() * 0.15))
      const externalHR = Math.round(totalCost * (0.2 + Math.random() * 0.15))
      const businessCost = Math.round(totalCost * (0.05 + Math.random() * 0.05))
      const otherCost = totalCost - internalHR - externalHR - businessCost
      const totalPlanCost = Math.round(totalCost * 0.9)
      const totalPlanExternalCost = Math.round(totalPlanCost * 0.35)
      const totalPlanBusinessCost = Math.round(totalPlanCost * 0.12)
      const actualDeliveryCost = Math.round(totalCost * 0.60)
      const deliveryCostRatio = totalCost > 0 ? (actualDeliveryCost / totalCost) * 100 : 0
      const deliveryEfficiency = actualDeliveryCost > 0 ? (totalPlanExternalCost * progressPct / 100) / actualDeliveryCost : 0

      // V8 新状态枚举
      const statuses: ProjectStatus[] = ['交付中', '验收完成', '已验收运维中', '已结项']
      return {
        id: `proj-${i + 1}`,
        name: `${d}信息化项目`,
        district: d,
        status: statuses[i % statuses.length],
        projectType: '新增' as ProjectType,
        sales: salesNames[i % salesNames.length],
        pm: pmNames[i % pmNames.length],
        contractAmount,
        receivedPayment,
        progress: progressPct,
        planProfitRate: 30,
        externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit,
        actualCost: totalCost,
        // V8 新增字段
        totalPlanCost,
        totalPlanExternalCost,
        totalPlanBusinessCost,
        deliveryCostRatio,
        deliveryEfficiency,
        costBreakdown: {
          internalHR,
          externalHR,
          businessCost: Math.max(businessCost, 0),
          otherCost: Math.max(otherCost, 0),
        },
      }
    }
  })
}

export function generateSalesTargets(): SalesTarget[] {
  const projects = generateProjects()
  return salesNames.map((name) => {
    const salesProjects = projects.filter(p => p.sales === name)
    const totalContractAmount = salesProjects.reduce((s, p) => s + p.contractAmount, 0)
    const totalReceivedPayment = salesProjects.reduce((s, p) => s + p.receivedPayment, 0)
    const actualCost = salesProjects.reduce((s, p) => s + p.actualCost, 0)
    const totalPlanCost = salesProjects.reduce((s, p) => s + (p.totalPlanCost || p.actualCost * 0.95), 0)
    const totalPlanDeliveryCost = Math.round(totalPlanCost * 0.65)
    const actualDeliveryCost = Math.round(actualCost * 0.60)
    const deliveryCostRatio = actualCost > 0 ? (actualDeliveryCost / actualCost) * 100 : 0
    const avgProgress = salesProjects.length > 0 ? salesProjects.reduce((s, p) => s + p.progress, 0) / salesProjects.length : 0
    const deliveryEfficiency = actualDeliveryCost > 0 ? (totalPlanDeliveryCost * avgProgress / 100) / actualDeliveryCost : 0
    // 贡献值：仅统计已结项项目，系数1%
    const closedProjects = salesProjects.filter(p => p.status === '已结项')
    const contributionValue = closedProjects.reduce((s, p) => s + ((p.totalPlanCost || p.actualCost * 0.95) - (p.actualCost * 0.65)), 0) * 0.01 / 10000
    const actualProfitRate = totalContractAmount > 0 ? ((totalContractAmount - actualCost) / totalContractAmount) * 100 : 0
    return {
      name,
      district: salesProjects[0]?.district || '未知区域',
      projectCount: salesProjects.length,
      totalContractAmount,
      totalReceivedPayment,
      totalPlanCost,
      totalPlanDeliveryCost,
      actualCost,
      actualDeliveryCost,
      deliveryCostRatio,
      deliveryEfficiency,
      contributionValue,
      // 保留旧字段兼容
      planRevenue: totalContractAmount,
      actualRevenue: totalReceivedPayment,
      planProfitRate: 25,
      actualProfitRate: Math.round(actualProfitRate),
    }
  })
}

export function generatePMSummaries(): PMSummary[] {
  const projects = generateProjects()
  return pmNames.map(pm => {
    const pmProjects = projects.filter(p => p.pm === pm)
    const totalContractAmount = pmProjects.reduce((s, p) => s + p.contractAmount, 0)
    const totalReceivedPayment = pmProjects.reduce((s, p) => s + p.receivedPayment, 0)
    const estimatedCost = pmProjects.reduce((s, p) => s + p.actualCost, 0)
    const estimatedProfit = totalContractAmount - estimatedCost
    const estimatedProfitRate = totalContractAmount > 0
      ? (estimatedProfit / totalContractAmount) * 100
      : 0
    const totalExternalHR = pmProjects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
    const externalHRRatio = totalContractAmount > 0
      ? (totalExternalHR / totalContractAmount) * 100
      : 0

    // V8 新增字段计算
    const totalPlanCost = pmProjects.reduce((s, p) => s + (p.totalPlanCost || p.actualCost * 0.95), 0)
    const totalPlanDeliveryCost = Math.round(totalPlanCost * 0.65)
    const actualCost = estimatedCost
    const actualDeliveryCost = pmProjects.reduce((s, p) => s + Math.round((p.costBreakdown?.externalHR || 0) + (p.costBreakdown?.internalHR || 0) * 0.6), 0)
    const deliveryCostRatio = actualCost > 0 ? (actualDeliveryCost / actualCost) * 100 : 0
    const avgProgress = pmProjects.length > 0 ? pmProjects.reduce((s, p) => s + p.progress, 0) / pmProjects.length : 0
    const deliveryEfficiency = actualDeliveryCost > 0 ? (totalPlanDeliveryCost * avgProgress / 100) / actualDeliveryCost : 0
    // 贡献值：仅统计已结项项目，系数1%
    const closedProjects = pmProjects.filter(p => p.status === '已结项')
    const contributionValue = closedProjects.reduce((s, p) => s + ((p.totalPlanCost || p.actualCost * 0.95) - (p.actualCost * 0.65)), 0) * 0.01 / 10000

    return {
      pm,
      projectCount: pmProjects.length,
      totalContractAmount,
      totalReceivedPayment,
      totalPlanCost,
      totalPlanDeliveryCost,
      actualCost,
      actualDeliveryCost,
      deliveryCostRatio,
      deliveryEfficiency,
      contributionValue,
      // 保留旧字段兼容
      estimatedCost,
      estimatedProfit,
      estimatedProfitRate,
      externalHRRatio,
      externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit * 100,
    }
  })
}

export function generateOverview(): DepartmentOverview {
  const projects = generateProjects()
  const contractRevenue = projects.reduce((s, p) => s + p.contractAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.receivedPayment, 0)
  const planRevenue = 10000000 // 年度收入计划 1000万

  const totalInternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0), 0)
  const totalExternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
  const totalBusinessCost = projects.reduce((s, p) => s + (p.costBreakdown?.businessCost || 0), 0)
  const totalOtherCost = projects.reduce((s, p) => s + (p.costBreakdown?.otherCost || 0), 0)
  const existingTotalCost = projects.filter(p => p.projectType === '存量').reduce((s, p) => s + p.actualCost, 0)

  const totalActualCost = projects.reduce((s, p) => s + p.actualCost, 0)
  const totalPlanCost = Math.round(totalActualCost * (0.9 + Math.random() * 0.2))

  // V8 新增计算
  const costRatio = contractRevenue > 0 ? (totalPlanCost / contractRevenue) * 100 : 0
  const costRatioLimit = 30 // 基准值 30%
  const actualProfit = contractRevenue - totalActualCost
  const planProfit = contractRevenue - totalPlanCost

  // 辅助函数：创建成本分类节点
  const createCostNode = (
    key: string,
    name: string,
    level: 1 | 2 | 3,
    plan: number,
    actual: number,
    isInternal = false,
    children?: CostCategory[]
  ): CostCategory => {
    const q1 = Math.round(actual * 0.35 / 10000)
    const q2 = Math.round(actual * 0.25 / 10000)
    const current = Math.round(actual / 10000)
    const remaining = Math.round((plan - actual) / 10000)
    const usagePct = plan > 0 ? Math.round((actual / plan) * 100) : 0
    return { key, name, level, plan, actual, q1, q2, current, remaining, usagePct, isInternal, children }
  }

  return {
    year: 2026,
    // 收入相关
    contractRevenue,
    actualRevenue,
    planRevenue,
    // 成本相关
    totalPlanCost,
    totalActualCost,
    costRatio,
    costRatioLimit,
    // 利润相关
    actualProfit,
    planProfit,
    // 成本分类（三级树形结构）- 先定义子项，再计算父项之和
    costCategories: (() => {
      // 三级子项
      const deliveryExternalHR = createCostNode('external-delivery-external', '外部门成本', 3,
        Math.round(totalPlanCost * 0.25),
        totalExternalHR + Math.round(existingTotalCost * 0.25))
      const deliveryOutsource = createCostNode('external-delivery-outsource', '外采成本', 3,
        Math.round(totalPlanCost * 0.15),
        Math.round(totalExternalHR * 0.5) + Math.round(existingTotalCost * 0.15))
      const businessOutsource = createCostNode('external-business-outsource', '外采成本', 3,
        Math.round(totalPlanCost * 0.08),
        totalBusinessCost + Math.round(existingTotalCost * 0.08))
      const businessCentral = createCostNode('external-business-central', '集采成本', 3,
        Math.round(totalPlanCost * 0.05),
        Math.round(totalBusinessCost * 0.4) + Math.round(existingTotalCost * 0.05))

      // 二级父项（子项之和）
      const deliveryCost = createCostNode('external-delivery', '交付成本', 2,
        deliveryExternalHR.plan + deliveryOutsource.plan,
        deliveryExternalHR.actual + deliveryOutsource.actual,
        false,
        [deliveryExternalHR, deliveryOutsource])
      const businessCost = createCostNode('external-business', '商务成本', 2,
        businessOutsource.plan + businessCentral.plan,
        businessOutsource.actual + businessCentral.actual,
        false,
        [businessOutsource, businessCentral])

      // 一级外部成本（子项之和）
      const externalCost = createCostNode('external', '外部成本', 1,
        deliveryCost.plan + businessCost.plan,
        deliveryCost.actual + businessCost.actual,
        false,
        [deliveryCost, businessCost])

      // 一级内部成本
      const internalCost = createCostNode('internal', '内部成本', 1,
        Math.round(totalPlanCost * 0.47),
        totalInternalHR + totalOtherCost + Math.round(existingTotalCost * 0.52), true)

      return [externalCost, internalCost]
    })(),
    // 项目统计
    projectStats: {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === '交付中').length,
      signed: projects.filter((p) => p.status === '验收完成').length,
      pending: projects.filter((p) => p.status === '已验收运维中').length,
      completed: projects.filter((p) => p.status === '已结项').length,
      existing: projects.filter((p) => p.projectType === '存量').length,
      newProjects: projects.filter((p) => p.projectType === '新增').length,
      // V8 新增
      delivering: projects.filter((p) => p.status === '交付中').length,
      acceptanceDone: projects.filter((p) => p.status === '验收完成').length,
      maintenance: projects.filter((p) => p.status === '已验收运维中').length,
      closed: projects.filter((p) => p.status === '已结项').length,
    },
  }
}
