/**
 * V8 统一 Mock 数据
 * 数据一致性：所有聚合数据基于同一份项目数据计算
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
  progress: number                 // 进度百分比
  planProfitRate: number           // 计划利润率
  externalHRRatioLimit: number     // 外采占比上限
  actualCost: number               // 实际成本
  // V8 新增字段
  totalPlanCost: number            // 总计划成本（占签约50-70%）
  totalPlanDeliveryCost: number    // 计划交付成本（占签约40-70%，≤计划成本）
  totalPlanExternalCost: number    // 计划外采成本（占计划交付50%左右）
  totalPlanBusinessCost: number    // 计划商务成本（占计划成本20%）
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
  totalPlanExternalCost: number    // 总计划外采成本
  totalPlanBusinessCost: number    // 总计划商务成本
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
  totalPlanExternalCost: number    // 总计划外采成本
  totalPlanBusinessCost: number    // 总计划商务成本
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

// ============ 工具函数 ============

function randomBetween(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min)
}

function formatWan(amount: number): number {
  return Math.round(amount / 10000)
}

// ============ 常量配置 ============

const DEPT_CONFIG = {
  planProfitRate: 20,
  externalHRRatioLimit: 0.15,
}

const salesNames = ['张伟', '李娜', '王强', '赵敏', '刘洋']
const pmNames = ['陈工', '周工', '吴工', '郑工', '林工']

// ============ 项目数据定义（单一数据源） ============

interface ProjectSeed {
  district: string
  projectType: ProjectType
  contractAmount: number  // 单位：元
  status: ProjectStatus
  progress: number
  sales: string
  pm: string
}

// 13个项目：4个存量（区县）+ 9个新增（1个市本级 + 8个区县）
const PROJECT_SEEDS: ProjectSeed[] = [
  // 4个存量项目（区县，5万-80万，回款80%-100%）
  {
    district: '锦江区',
    projectType: '存量',
    contractAmount: 680000,
    status: '已结项',
    progress: 100,
    sales: '张伟',
    pm: '陈工',
  },
  {
    district: '青羊区',
    projectType: '存量',
    contractAmount: 520000,
    status: '已结项',
    progress: 100,
    sales: '李娜',
    pm: '周工',
  },
  {
    district: '金牛区',
    projectType: '存量',
    contractAmount: 750000,
    status: '已验收运维中',
    progress: 100,
    sales: '王强',
    pm: '吴工',
  },
  {
    district: '武侯区',
    projectType: '存量',
    contractAmount: 450000,
    status: '已结项',
    progress: 100,
    sales: '赵敏',
    pm: '郑工',
  },
  // 1个新增项目（成都市本级，500万，交付中）
  {
    district: '成都市本级',
    projectType: '新增',
    contractAmount: 5000000,
    status: '交付中',
    progress: 45,
    sales: '刘洋',
    pm: '林工',
  },
  // 8个新增项目（区县，5万-80万）
  {
    district: '高新区',
    projectType: '新增',
    contractAmount: 580000,
    status: '交付中',
    progress: 35,
    sales: '张伟',
    pm: '陈工',
  },
  {
    district: '天府新区',
    projectType: '新增',
    contractAmount: 620000,
    status: '交付中',
    progress: 50,
    sales: '李娜',
    pm: '周工',
  },
  {
    district: '双流区',
    projectType: '新增',
    contractAmount: 380000,
    status: '验收完成',
    progress: 100,
    sales: '王强',
    pm: '吴工',
  },
  {
    district: '龙泉驿区',
    projectType: '新增',
    contractAmount: 280000,
    status: '交付中',
    progress: 65,
    sales: '赵敏',
    pm: '郑工',
  },
  {
    district: '温江区',
    projectType: '新增',
    contractAmount: 420000,
    status: '验收完成',
    progress: 100,
    sales: '刘洋',
    pm: '林工',
  },
  {
    district: '郫都区',
    projectType: '新增',
    contractAmount: 550000,
    status: '交付中',
    progress: 40,
    sales: '张伟',
    pm: '林工',
  },
  {
    district: '新都区',
    projectType: '新增',
    contractAmount: 320000,
    status: '已验收运维中',
    progress: 100,
    sales: '李娜',
    pm: '陈工',
  },
  {
    district: '成华区',
    projectType: '新增',
    contractAmount: 180000,
    status: '交付中',
    progress: 25,
    sales: '王强',
    pm: '周工',
  },
]

// ============ 从种子数据生成完整项目 ============

function buildProjectFromSeed(seed: ProjectSeed, index: number): Project {
  const { district, projectType, contractAmount, status, progress, sales, pm } = seed

  // 已回款：存量80%-100%，新增10%-40%
  const receivedPaymentRatio = projectType === '存量'
    ? randomBetween(80, 100) / 100
    : randomBetween(10, 40) / 100
  const receivedPayment = Math.round(contractAmount * receivedPaymentRatio)

  // 计划成本：签约金额的50%-70%
  const planCostRatio = randomBetween(50, 70) / 100
  const totalPlanCost = Math.round(contractAmount * planCostRatio)

  // 计划交付成本：签约金额的40%-70%，且 ≤ 计划成本
  const planDeliveryRatio = Math.min(randomBetween(40, 70) / 100, planCostRatio)
  const totalPlanDeliveryCost = Math.round(contractAmount * planDeliveryRatio)

  // 计划外采成本：计划交付成本的50%左右（45%-55%）
  const planExternalRatio = randomBetween(45, 55) / 100
  const totalPlanExternalCost = Math.round(totalPlanDeliveryCost * planExternalRatio)

  // 计划商务成本：计划成本的20%
  const totalPlanBusinessCost = Math.round(totalPlanCost * 0.20)

  // 实际成本：基于计划成本，有波动
  // 存量项目大部分在预算内（70%-95%），小部分超预算（100%-110%）
  // 新增项目大部分在预算内（50%-90%），因为还在进行中
  const actualCostRatio = projectType === '存量'
    ? (index % 4 === 0 ? randomBetween(100, 110) : randomBetween(70, 95)) / 100
    : randomBetween(50, 85) / 100
  const actualCost = Math.round(totalPlanCost * actualCostRatio)

  // 交付成本占比：需要有合理分布
  // 有些项目控制在30%以下（正常），有些超过30%（预警）
  // 交付成本 = 内部人力 + 外采人力
  const deliveryCostRatioTarget = index % 3 === 0
    ? randomBetween(35, 45)  // 1/3 超预警
    : randomBetween(20, 28)  // 2/3 正常范围内
  const deliveryCostRatio = deliveryCostRatioTarget

  // 实际交付成本
  const actualDeliveryCost = Math.round(actualCost * deliveryCostRatio / 100)

  // 实际成本分解
  const internalHR = Math.round(actualDeliveryCost * 0.55)  // 内部人力约占交付成本的55%
  const externalHR = actualDeliveryCost - internalHR         // 外采人力约占45%
  const businessCost = Math.round(actualCost * 0.15)         // 商务成本约15%
  const otherCost = actualCost - internalHR - externalHR - businessCost

  // 交付效率 = 计划交付成本 * 进度 / 实际交付成本
  const deliveryEfficiency = actualDeliveryCost > 0
    ? (totalPlanDeliveryCost * progress / 100) / actualDeliveryCost
    : 0

  // 计划利润率
  const planProfitRate = contractAmount > 0
    ? Math.round(((contractAmount - totalPlanCost) / contractAmount) * 100)
    : 0

  return {
    id: `proj-${index + 1}`,
    name: `${district}${projectType === '存量' ? '存量运维' : '信息化'}项目`,
    district,
    status,
    projectType,
    sales,
    pm,
    contractAmount,
    receivedPayment,
    progress,
    planProfitRate,
    externalHRRatioLimit: DEPT_CONFIG.externalHRRatioLimit,
    actualCost,
    totalPlanCost,
    totalPlanDeliveryCost,
    totalPlanExternalCost,
    totalPlanBusinessCost,
    deliveryCostRatio: Math.round(deliveryCostRatio * 10) / 10,
    deliveryEfficiency: Math.round(deliveryEfficiency * 100) / 100,
    costBreakdown: {
      internalHR,
      externalHR,
      businessCost,
      otherCost: Math.max(otherCost, 0),
    },
  }
}

// ============ 单一数据源 ============

/** 项目数据（只生成一次，所有聚合基于此） */
export const projects: Project[] = PROJECT_SEEDS.map(buildProjectFromSeed)

// ============ 聚合计算函数 ============

/** 销售维度汇总 */
export function getSalesTargets(): SalesTarget[] {
  return salesNames.map(name => {
    const salesProjects = projects.filter(p => p.sales === name)

    const totalContractAmount = salesProjects.reduce((s, p) => s + p.contractAmount, 0)
    const totalReceivedPayment = salesProjects.reduce((s, p) => s + p.receivedPayment, 0)
    const totalPlanCost = salesProjects.reduce((s, p) => s + p.totalPlanCost, 0)
    const totalPlanDeliveryCost = salesProjects.reduce((s, p) => s + p.totalPlanDeliveryCost, 0)
    const totalPlanExternalCost = salesProjects.reduce((s, p) => s + p.totalPlanExternalCost, 0)
    const totalPlanBusinessCost = salesProjects.reduce((s, p) => s + p.totalPlanBusinessCost, 0)
    const actualCost = salesProjects.reduce((s, p) => s + p.actualCost, 0)
    const actualDeliveryCost = salesProjects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0) + (p.costBreakdown?.externalHR || 0), 0)

    // 直接使用项目中计算好的交付成本占比，取平均值
    const deliveryCostRatio = salesProjects.length > 0
      ? salesProjects.reduce((s, p) => s + p.deliveryCostRatio, 0) / salesProjects.length
      : 0

    const avgProgress = salesProjects.length > 0
      ? salesProjects.reduce((s, p) => s + p.progress, 0) / salesProjects.length
      : 0
    const deliveryEfficiency = actualDeliveryCost > 0
      ? (totalPlanDeliveryCost * avgProgress / 100) / actualDeliveryCost
      : 0

    // 贡献值：仅统计已结项项目的（计划成本 - 实际成本 * 0.65）* 1%
    const closedProjects = salesProjects.filter(p => p.status === '已结项')
    const contributionValue = closedProjects.reduce((s, p) =>
      s + (p.totalPlanCost - p.actualCost * 0.65), 0) * 0.01 / 10000

    const actualProfitRate = totalContractAmount > 0
      ? ((totalContractAmount - actualCost) / totalContractAmount) * 100
      : 0

    return {
      name,
      district: salesProjects[0]?.district || '未知区域',
      projectCount: salesProjects.length,
      totalContractAmount,
      totalReceivedPayment,
      totalPlanCost,
      totalPlanDeliveryCost,
      totalPlanExternalCost,
      totalPlanBusinessCost,
      actualCost,
      actualDeliveryCost,
      deliveryCostRatio: Math.round(deliveryCostRatio * 10) / 10,
      deliveryEfficiency: Math.round(deliveryEfficiency * 100) / 100,
      contributionValue: Math.round(contributionValue * 100) / 100,
      // 兼容旧字段
      planRevenue: totalContractAmount,
      actualRevenue: totalReceivedPayment,
      planProfitRate: 25,
      actualProfitRate: Math.round(actualProfitRate),
    }
  })
}

/** 项目经理维度汇总 */
export function getPMSummaries(): PMSummary[] {
  return pmNames.map(pm => {
    const pmProjects = projects.filter(p => p.pm === pm)

    const totalContractAmount = pmProjects.reduce((s, p) => s + p.contractAmount, 0)
    const totalReceivedPayment = pmProjects.reduce((s, p) => s + p.receivedPayment, 0)
    const totalPlanCost = pmProjects.reduce((s, p) => s + p.totalPlanCost, 0)
    const totalPlanDeliveryCost = pmProjects.reduce((s, p) => s + p.totalPlanDeliveryCost, 0)
    const totalPlanExternalCost = pmProjects.reduce((s, p) => s + p.totalPlanExternalCost, 0)
    const totalPlanBusinessCost = pmProjects.reduce((s, p) => s + p.totalPlanBusinessCost, 0)
    const actualCost = pmProjects.reduce((s, p) => s + p.actualCost, 0)
    const actualDeliveryCost = pmProjects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0) + (p.costBreakdown?.externalHR || 0), 0)

    // 直接使用项目中计算好的交付成本占比，取平均值
    const deliveryCostRatio = pmProjects.length > 0
      ? pmProjects.reduce((s, p) => s + p.deliveryCostRatio, 0) / pmProjects.length
      : 0

    const avgProgress = pmProjects.length > 0
      ? pmProjects.reduce((s, p) => s + p.progress, 0) / pmProjects.length
      : 0
    const deliveryEfficiency = actualDeliveryCost > 0
      ? (totalPlanDeliveryCost * avgProgress / 100) / actualDeliveryCost
      : 0

    // 贡献值
    const closedProjects = pmProjects.filter(p => p.status === '已结项')
    const contributionValue = closedProjects.reduce((s, p) =>
      s + (p.totalPlanCost - p.actualCost * 0.65), 0) * 0.01 / 10000

    // 外采占比
    const totalExternalHR = pmProjects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
    const externalHRRatio = totalContractAmount > 0
      ? (totalExternalHR / totalContractAmount) * 100
      : 0

    const estimatedProfit = totalContractAmount - actualCost
    const estimatedProfitRate = totalContractAmount > 0
      ? (estimatedProfit / totalContractAmount) * 100
      : 0

    return {
      pm,
      projectCount: pmProjects.length,
      totalContractAmount,
      totalReceivedPayment,
      totalPlanCost,
      totalPlanDeliveryCost,
      totalPlanExternalCost,
      totalPlanBusinessCost,
      actualCost,
      actualDeliveryCost,
      deliveryCostRatio: Math.round(deliveryCostRatio * 10) / 10,
      deliveryEfficiency: Math.round(deliveryEfficiency * 100) / 100,
      contributionValue: Math.round(contributionValue * 100) / 100,
      // 兼容旧字段
      estimatedCost: actualCost,
      estimatedProfit,
      estimatedProfitRate: Math.round(estimatedProfitRate),
      externalHRRatio: Math.round(externalHRRatio * 10) / 10,
      externalHRRatioLimit: DEPT_CONFIG.externalHRRatioLimit * 100,
    }
  })
}

/** 部门总览 */
export function getOverview(): DepartmentOverview {
  const contractRevenue = projects.reduce((s, p) => s + p.contractAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.receivedPayment, 0)
  const planRevenue = 30000000 // 年度收入计划 3000万

  const totalPlanCost = projects.reduce((s, p) => s + p.totalPlanCost, 0)
  const totalActualCost = projects.reduce((s, p) => s + p.actualCost, 0)

  const totalInternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0), 0)
  const totalExternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
  const totalBusinessCost = projects.reduce((s, p) => s + (p.costBreakdown?.businessCost || 0), 0)
  const totalOtherCost = projects.reduce((s, p) => s + (p.costBreakdown?.otherCost || 0), 0)

  const costRatio = contractRevenue > 0 ? (totalPlanCost / contractRevenue) * 100 : 0
  const costRatioLimit = 30
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
    const q1 = formatWan(actual * 0.35)
    const q2 = formatWan(actual * 0.25)
    const current = formatWan(actual)
    const remaining = formatWan(Math.max(plan - actual, 0))
    const usagePct = plan > 0 ? Math.round((actual / plan) * 100) : 0
    return { key, name, level, plan, actual, q1, q2, current, remaining, usagePct, isInternal, children }
  }

  // 成本分类（基于实际数据计算，确保使用进度合理）
  const costCategories: CostCategory[] = (() => {
    // 计算各类成本的汇总
    const totalPlanExternalHR = projects.reduce((s, p) => s + p.totalPlanExternalCost, 0)
    const totalPlanBusiness = projects.reduce((s, p) => s + p.totalPlanBusinessCost, 0)
    const totalPlanInternal = totalPlanCost - totalPlanExternalHR - totalPlanBusiness

    // 三级子项 - 使用进度：外采成本最高，其他控制在50%以内
    // 外部门成本：使用进度 ~45%
    const deliveryExternalHR = createCostNode('external-delivery-external', '外部门成本', 3,
      Math.round(totalExternalHR * 2.2),   // 计划约为实际的2.2倍，使用进度约45%
      totalExternalHR)
    // 外采成本：使用进度最高 ~85%
    const deliveryOutsource = createCostNode('external-delivery-outsource', '外采成本', 3,
      Math.round(totalExternalHR * 1.18),  // 计划约为实际的1.18倍，使用进度约85%
      totalExternalHR)
    // 商务外采：使用进度 ~40%
    const businessOutsource = createCostNode('external-business-outsource', '外采成本', 3,
      Math.round(totalBusinessCost * 2.5),
      totalBusinessCost)
    // 集采成本：使用进度 ~35%
    const businessCentral = createCostNode('external-business-central', '集采成本', 3,
      Math.round(totalBusinessCost * 2.8),
      Math.round(totalBusinessCost * 0.98))

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

    // 一级内部成本 - 使用进度 ~42%
    const internalActual = totalInternalHR + totalOtherCost
    const internalCost = createCostNode('internal', '内部成本', 1,
      Math.round(internalActual * 2.4),  // 使用进度约42%
      internalActual, true)

    return [externalCost, internalCost]
  })()

  return {
    year: 2026,
    contractRevenue,
    actualRevenue,
    planRevenue,
    totalPlanCost,
    totalActualCost,
    costRatio: Math.round(costRatio * 10) / 10,
    costRatioLimit,
    actualProfit,
    planProfit,
    costCategories,
    projectStats: {
      total: projects.length,
      inProgress: projects.filter(p => p.status === '交付中').length,
      signed: projects.filter(p => p.status === '验收完成').length,
      pending: projects.filter(p => p.status === '已验收运维中').length,
      completed: projects.filter(p => p.status === '已结项').length,
      existing: projects.filter(p => p.projectType === '存量').length,
      newProjects: projects.filter(p => p.projectType === '新增').length,
      delivering: projects.filter(p => p.status === '交付中').length,
      acceptanceDone: projects.filter(p => p.status === '验收完成').length,
      maintenance: projects.filter(p => p.status === '已验收运维中').length,
      closed: projects.filter(p => p.status === '已结项').length,
    },
  }
}

// ============ 兼容旧 API ============

/** @deprecated 使用 projects 常量代替 */
export function generateProjects(): Project[] {
  return projects
}

/** @deprecated 使用 getSalesTargets() 代替 */
export function generateSalesTargets(): SalesTarget[] {
  return getSalesTargets()
}

/** @deprecated 使用 getPMSummaries() 代替 */
export function generatePMSummaries(): PMSummary[] {
  return getPMSummaries()
}

/** @deprecated 使用 getOverview() 代替 */
export function generateOverview(): DepartmentOverview {
  return getOverview()
}
