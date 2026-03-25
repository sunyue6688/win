/**
 * 专注成本版 - Mock 数据
 * 基于 V6 需求文档的数据模型
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
  otherCostLimit: number       // 其他可变成本上限
  actualCost: number           // 总成本
  // 存量项目仅有 actualCost，以下字段仅新增项目有
  costBreakdown?: {
    internalHR: number
    externalHR: number
    businessCost: number
    otherCost: number
  }
}

export interface CostRecord {
  id: string
  costCategory: '内部人力' | '外采人力' | '商务费用' | '其他'
  projectId: string | null
  amount: number
  occurDate: string
  supplier?: string
  remark?: string
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
  }[]
  projectStats: {
    total: number
    inProgress: number
    signed: number
    pending: number
    completed: number
    existing: number   // 存量
    newProjects: number // 新增
  }
  departmentConfig: {
    planProfitRate: number
    costCategoryLimits: Record<string, number>
    projectDefaults: {
      externalHRRatioLimit: number
      otherCostLimit: number
      minProfitRate: number
    }
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
    externalHRRatioLimit: 0.10,
    otherCostLimit: 0.05,
    minProfitRate: 30,
  },
}

// ============ 数据生成 ============

export function generateProjects(): Project[] {
  return districts.map((d, i) => {
    const isExisting = i < 8 // 前8个为存量项目
    const contractAmount = randomBetween(80, 500) * 10000
    const receivedPayment = Math.round(contractAmount * (0.3 + Math.random() * 0.5))
    const progressPct = randomBetween(30, 90)

    if (isExisting) {
      // 存量项目：只有总成本，不分解
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
        otherCostLimit: DEPT_CONFIG.projectDefaults.otherCostLimit,
        actualCost,
      }
    } else {
      // 新增项目：有成本分解
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
        otherCostLimit: DEPT_CONFIG.projectDefaults.otherCostLimit,
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

export function generateCostRecords(): CostRecord[] {
  const records: CostRecord[] = []
  const categories: CostRecord['costCategory'][] = ['外采人力', '商务费用', '其他']
  const suppliers = ['中科软', '中软国际', '华为云', '阿里云', '腾讯云']
  const remarks = ['项目开发费用', '测试外包费用', '商务接待', '礼品采购', '差旅费用', '设备采购']

  const projects = generateProjects()
  const newProjects = projects.filter(p => p.projectType === '新增')

  let recordId = 1
  for (const proj of newProjects) {
    for (const cat of categories) {
      const count = randomBetween(2, 5)
      for (let j = 0; j < count; j++) {
        records.push({
          id: `cost-${recordId++}`,
          costCategory: cat,
          projectId: proj.id,
          amount: randomBetween(5000, 200000),
          occurDate: `2026-${String(randomBetween(1, 3)).padStart(2, '0')}-${String(randomBetween(1, 28)).padStart(2, '0')}`,
          supplier: cat === '外采人力' ? suppliers[randomBetween(0, suppliers.length - 1)] : undefined,
          remark: remarks[randomBetween(0, remarks.length - 1)],
        })
      }
    }
  }

  // 部门级成本（非项目）
  for (const cat of categories) {
    const count = randomBetween(1, 3)
    for (let j = 0; j < count; j++) {
      records.push({
        id: `cost-${recordId++}`,
        costCategory: cat,
        projectId: null,
        amount: randomBetween(10000, 100000),
        occurDate: `2026-${String(randomBetween(1, 3)).padStart(2, '0')}-${String(randomBetween(1, 28)).padStart(2, '0')}`,
        remark: '部门级费用',
      })
    }
  }

  return records
}

export function generateOverview(): DepartmentOverview {
  const projects = generateProjects()
  const planRevenue = projects.reduce((s, p) => s + p.contractAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.receivedPayment, 0)

  // 按四大类汇总
  const totalInternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0), 0)
  const totalExternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
  const totalBusinessCost = projects.reduce((s, p) => s + (p.costBreakdown?.businessCost || 0), 0)
  const totalOtherCost = projects.reduce((s, p) => s + (p.costBreakdown?.otherCost || 0), 0)
  // 存量项目总成本
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
      { category: '内部人力', plan: Math.round(totalPlanCost * 0.45), actual: totalInternalHR + Math.round(existingTotalCost * 0.45) },
      { category: '外采人力', plan: Math.round(totalPlanCost * 0.30), actual: totalExternalHR + Math.round(existingTotalCost * 0.30) },
      { category: '商务费用', plan: Math.round(totalPlanCost * 0.10), actual: totalBusinessCost + Math.round(existingTotalCost * 0.10) },
      { category: '其他', plan: Math.round(totalPlanCost * 0.15), actual: totalOtherCost + Math.round(existingTotalCost * 0.15) },
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
    departmentConfig: DEPT_CONFIG,
  }
}
