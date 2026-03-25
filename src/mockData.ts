export interface Project {
  id: string
  name: string
  district: string
  status: '进行中' | '已签约' | '待评估' | '已完成'
  sales: string
  pm: string
  planAmount: number
  actualAmount: number
  planCost: number
  actualCost: number
  costLimitPercent: number
  progress: number
  costBreakdown: {
    internalHR: number
    externalHR: number
    businessCost: number
    otherCost: number
  }
  estimatedTotalCost: number // 预计整体所需支出
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

export interface DepartmentOverview {
  planRevenue: number
  actualRevenue: number
  costCategories: {
    category: string
    plan: number
    actual: number
  }[]
  totalPlanCost: number
  totalActualCost: number
  totalPlanProfit: number
  totalActualProfit: number
  projectStats: {
    total: number
    inProgress: number
    signed: number
    pending: number
    completed: number
  }
}

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

const projectStatuses: Project['status'][] = ['进行中', '已签约', '待评估', '已完成']

export function generateProjects(): Project[] {
  return districts.map((d, i) => {
    const planAmount = randomBetween(80, 500) * 10000
    const actualAmount = Math.round(planAmount * (0.85 + Math.random() * 0.3))
    const planCost = Math.round(planAmount * (0.6 + Math.random() * 0.15))
    const actualCost = Math.round(planCost * (0.7 + Math.random() * 0.4))
    const internalHR = Math.round(actualCost * (0.4 + Math.random() * 0.2))
    const externalHR = Math.round(actualCost * (0.2 + Math.random() * 0.15))
    const businessCost = Math.round(actualCost * (0.05 + Math.random() * 0.05))
    const otherCost = actualCost - internalHR - externalHR - businessCost

    // 预估整体所需支出：根据当前进度推算最终成本
    const progressPct = 30 + Math.random() * 60
    const estimatedTotalCost = Math.round(actualCost / (progressPct / 100))

    return {
      id: `proj-${i + 1}`,
      name: `${d}信息化项目`,
      district: d,
      status: projectStatuses[i % projectStatuses.length],
      sales: salesNames[i % salesNames.length],
      pm: pmNames[i % pmNames.length],
      planAmount,
      actualAmount,
      planCost,
      actualCost,
      costLimitPercent: 80,
      progress: Math.round(progressPct),
      costBreakdown: {
        internalHR,
        externalHR,
        businessCost: Math.max(businessCost, 0),
        otherCost: Math.max(otherCost, 0),
      },
      estimatedTotalCost,
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

export function generateOverview(): DepartmentOverview {
  const projects = generateProjects()
  const planRevenue = projects.reduce((s, p) => s + p.planAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.actualAmount, 0)
  const totalPlanCost = projects.reduce((s, p) => s + p.planCost, 0)
  const totalActualCost = projects.reduce((s, p) => s + p.actualCost, 0)

  return {
    planRevenue,
    actualRevenue,
    costCategories: [
      { category: '内部人力', plan: Math.round(totalPlanCost * 0.5), actual: projects.reduce((s, p) => s + p.costBreakdown.internalHR, 0) },
      { category: '外采人力', plan: Math.round(totalPlanCost * 0.3), actual: projects.reduce((s, p) => s + p.costBreakdown.externalHR, 0) },
      { category: '商务成本', plan: Math.round(totalPlanCost * 0.08), actual: projects.reduce((s, p) => s + p.costBreakdown.businessCost, 0) },
      { category: '其他成本', plan: Math.round(totalPlanCost * 0.12), actual: projects.reduce((s, p) => s + p.costBreakdown.otherCost, 0) },
    ],
    totalPlanCost,
    totalActualCost,
    totalPlanProfit: planRevenue - totalPlanCost,
    totalActualProfit: actualRevenue - totalActualCost,
    projectStats: {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === '进行中').length,
      signed: projects.filter((p) => p.status === '已签约').length,
      pending: projects.filter((p) => p.status === '待评估').length,
      completed: projects.filter((p) => p.status === '已完成').length,
    },
  }
}
