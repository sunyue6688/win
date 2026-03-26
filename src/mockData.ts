/**
 * V7 统一 Mock 数据
 */

// ============ 类型定义 ============

export type ProjectType = '存量' | '新增'
export type ProjectStatus = '进行中' | '已签约' | '待评估' | '已完成'

export interface Project {
  id: string
  name: string
  district: string
  status: ProjectStatus
  projectType: ProjectType
  sales: string
  pm: string
  contractAmount: number       // 签约金额
  receivedPayment: number      // 已回款金额
  progress: number
  planProfitRate: number       // 计划利润率
  externalHRRatioLimit: number // 外采占比上限
  actualCost: number           // 总成本
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
  planRevenue: number
  actualRevenue: number
  planProfitRate: number
  actualProfitRate: number
  projectCount: number
}

export interface PMSummary {
  pm: string
  projectCount: number
  totalContractAmount: number
  totalReceivedPayment: number
  estimatedCost: number
  estimatedProfit: number
  estimatedProfitRate: number
  actualCost: number
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
  totalPlanCost: number
  totalActualCost: number
  planRevenue: number
  actualRevenue: number
  costCategories: {
    category: string
    plan: number
    actual: number
    subCategories?: CostSubCategory[]
  }[]
  projectStats: {
    total: number
    inProgress: number
    signed: number
    pending: number
    completed: number
    existing: number
    newProjects: number
  }
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
      return {
        id: `proj-${i + 1}`,
        name: `${d}信息化项目`,
        district: d,
        status: '已完成' as ProjectStatus,
        projectType: '存量' as ProjectType,
        sales: salesNames[i % salesNames.length],
        pm: pmNames[i % pmNames.length],
        contractAmount,
        receivedPayment,
        progress: 100,
        planProfitRate: 25,
        externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit,
        actualCost,
      }
    } else {
      const totalCost = Math.round(contractAmount * (0.55 + Math.random() * 0.25))
      const internalHR = Math.round(totalCost * (0.35 + Math.random() * 0.15))
      const externalHR = Math.round(totalCost * (0.2 + Math.random() * 0.15))
      const businessCost = Math.round(totalCost * (0.05 + Math.random() * 0.05))
      const otherCost = totalCost - internalHR - externalHR - businessCost

      const statuses: ProjectStatus[] = ['进行中', '已签约', '待评估']
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
  return salesNames.map((name, i) => {
    const planRevenue = randomBetween(800, 2000) * 10000
    const actualRevenue = Math.round(planRevenue * (0.5 + Math.random() * 0.6))
    const planProfitRate = 25
    const actualProfitRate = Math.round(15 + Math.random() * 20)
    return {
      name,
      district: `区域${i + 1}`,
      planRevenue,
      actualRevenue,
      planProfitRate,
      actualProfitRate,
      projectCount: randomBetween(3, 7),
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
    return {
      pm,
      projectCount: pmProjects.length,
      totalContractAmount,
      totalReceivedPayment,
      estimatedCost,
      estimatedProfit,
      estimatedProfitRate,
      actualCost: estimatedCost,
      externalHRRatio,
      externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit * 100,
    }
  })
}

export function generateOverview(): DepartmentOverview {
  const projects = generateProjects()
  const planRevenue = projects.reduce((s, p) => s + p.contractAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.receivedPayment, 0)

  const totalInternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0), 0)
  const totalExternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
  const totalBusinessCost = projects.reduce((s, p) => s + (p.costBreakdown?.businessCost || 0), 0)
  const totalOtherCost = projects.reduce((s, p) => s + (p.costBreakdown?.otherCost || 0), 0)
  const existingTotalCost = projects.filter(p => p.projectType === '存量').reduce((s, p) => s + p.actualCost, 0)

  const totalActualCost = projects.reduce((s, p) => s + p.actualCost, 0)
  const totalPlanCost = Math.round(totalActualCost * (0.9 + Math.random() * 0.2))

  return {
    year: 2026,
    totalPlanCost,
    totalActualCost,
    planRevenue,
    actualRevenue,
    costCategories: [
      {
        category: '内部人力',
        plan: Math.round(totalPlanCost * 0.45),
        actual: totalInternalHR + Math.round(existingTotalCost * 0.45),
        subCategories: [
          { name: '固定员工工资', plan: Math.round(totalPlanCost * 0.40), actual: Math.round((totalInternalHR + existingTotalCost * 0.40) * 0.9), q1: Math.round((totalInternalHR + existingTotalCost * 0.40) * 0.9 * 0.35), q2: Math.round((totalInternalHR + existingTotalCost * 0.40) * 0.9 * 0.25), description: '23名固定员工工资，固定成本' },
          { name: '绩效奖金', plan: Math.round(totalPlanCost * 0.05), actual: Math.round((totalInternalHR + existingTotalCost * 0.45) * 0.1), q1: Math.round((totalInternalHR + existingTotalCost * 0.45) * 0.1 * 0.35), q2: Math.round((totalInternalHR + existingTotalCost * 0.45) * 0.1 * 0.25), description: '按绩效发放' },
        ],
      },
      {
        category: '外采人力',
        plan: Math.round(totalPlanCost * 0.30),
        actual: totalExternalHR + Math.round(existingTotalCost * 0.30),
        subCategories: [
          { name: '外包研发', plan: Math.round(totalPlanCost * 0.18), actual: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.6), q1: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.6 * 0.35), q2: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.6 * 0.25), description: '项目外部研发，设项目级限额' },
          { name: '外包测试', plan: Math.round(totalPlanCost * 0.08), actual: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.25), q1: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.25 * 0.35), q2: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.25 * 0.25), description: '项目外部测试' },
          { name: '其他外采', plan: Math.round(totalPlanCost * 0.04), actual: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.15), q1: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.15 * 0.35), q2: Math.round((totalExternalHR + existingTotalCost * 0.30) * 0.15 * 0.25), description: '其他外采服务' },
        ],
      },
      {
        category: '商务费用',
        plan: Math.round(totalPlanCost * 0.10),
        actual: totalBusinessCost + Math.round(existingTotalCost * 0.10),
        subCategories: [
          { name: '业务招待', plan: Math.round(totalPlanCost * 0.05), actual: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.5), q1: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.5 * 0.35), q2: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.5 * 0.25), description: '销售请客、送礼等' },
          { name: '差旅费用', plan: Math.round(totalPlanCost * 0.03), actual: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.3), q1: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.3 * 0.35), q2: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.3 * 0.25), description: '出差交通住宿' },
          { name: '会议费用', plan: Math.round(totalPlanCost * 0.02), actual: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.2), q1: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.2 * 0.35), q2: Math.round((totalBusinessCost + existingTotalCost * 0.10) * 0.2 * 0.25), description: '会议组织费用' },
        ],
      },
      {
        category: '其他',
        plan: Math.round(totalPlanCost * 0.15),
        actual: totalOtherCost + Math.round(existingTotalCost * 0.15),
        subCategories: [
          { name: '媒体宣传', plan: Math.round(totalPlanCost * 0.05), actual: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.35), q1: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.35 * 0.35), q2: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.35 * 0.25), description: '媒体宣传费用' },
          { name: '招投标专家费', plan: Math.round(totalPlanCost * 0.04), actual: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.25), q1: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.25 * 0.35), q2: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.25 * 0.25), description: '招投标评审专家费' },
          { name: '办公杂费', plan: Math.round(totalPlanCost * 0.06), actual: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.4), q1: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.4 * 0.35), q2: Math.round((totalOtherCost + existingTotalCost * 0.15) * 0.4 * 0.25), description: '日常办公杂费' },
        ],
      },
    ],
    projectStats: {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === '进行中').length,
      signed: projects.filter((p) => p.status === '已签约').length,
      pending: projects.filter((p) => p.status === '待评估').length,
      completed: projects.filter((p) => p.status === '已完成').length,
      existing: projects.filter((p) => p.projectType === '存量').length,
      newProjects: projects.filter((p) => p.projectType === '新增').length,
    },
  }
}
