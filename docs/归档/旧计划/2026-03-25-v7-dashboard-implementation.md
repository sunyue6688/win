# V7 成本管理看板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 合并双版本为单一版本，基于成本管控导向重构看板，包含总览看板（预警+成本卡片+环状图+明细表）、项目看板（分布+PM列表+项目列表）、销售看板。

**Architecture:** 删除 `versions/basic` 和 `versions/cost` 两套目录，统一为 `src/pages/` 下的三个页面。数据模型基于 cost 版（更丰富），theme 使用 cost 版。AppShell 移除版本切换，导航固定为三个板块。Mock 数据扩展以支持 PM 汇总。

**Tech Stack:** React 19 + Vite 8 + TypeScript + Semi Design 2.x + ECharts 6

---

## File Structure

### 修改文件
| 文件 | 负责 |
|------|------|
| `src/App.tsx` | 移除版本切换逻辑，统一为单版本，导航固定为总览/项目/销售 |
| `src/layouts/AppShell.tsx` | 移除版本切换开关和版本标签，固定单一版本 |
| `src/styles/theme.ts` | 复制 cost 版 theme 内容（成为唯一 theme） |
| `src/mockData.ts` | 基于 cost 版 mockData 扩展，增加 PMSummary 生成函数 |
| `src/pages/Dashboard.tsx` | 重写：预警条+年度指标卡片+年度利润率+成本细化行+环状图+明细表 |
| `src/pages/ProjectView.tsx` | 重写：分布看板+区县图+PM列表+项目列表+筛选 |
| `src/pages/SalesView.tsx` | 复用 basic 版 SalesView，调整卡片高度一致 |
| `src/utils/format.ts` | 增加 `fmtAmountWan` 万元保留两位小数格式化函数 |

### 删除文件
| 文件 | 原因 |
|------|------|
| `src/versions/basic/` 整个目录 | V7 不再需要基础版 |
| `src/versions/cost/` 整个目录 | V7 不再需要成本版，内容合并到主 pages |

### 新增文件
无（全部在现有文件上修改）

---

## Task 1: 清理版本架构 — 合并为单版本

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/layouts/AppShell.tsx`
- Modify: `src/styles/theme.ts`（复制 cost 版 theme 内容）
- Modify: `src/mockData.ts`（基于 cost 版 mockData 重写，增加 PMSummary）
- Delete: `src/versions/basic/` 整个目录
- Delete: `src/versions/cost/` 整个目录

- [ ] **Step 1: 更新 theme.ts — 复制 cost 版内容为唯一 theme**

将 `src/versions/cost/theme.ts` 的完整内容复制到 `src/styles/theme.ts`。

```typescript
/**
 * 成本管理看板 - 主题配置
 * 基于 V7 UI 规范
 */
export const COLORS = {
  primary: '#4080FF',
  secondary: '#14C9C9',
  success: '#3DC779',
  warning: '#FAC858',
  danger: '#EE6666',
  sidebar: '#1a2740',
  content: '#F8FAFC',
  card: '#ffffff',
  hover: '#F9FAFB',
  textPrimary: '#1a2740',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E7EB',
  divider: '#F0F2F5',
  chart: ['#E5E7EB', '#4080FF', '#FAC858', '#EE6666'],
  chartBlue: '#4080FF',
  chartCyan: '#14C9C9',
  chartYellow: '#FAC858',
  chartRed: '#EE6666',
  bgGreen: '#E8F5E9',
  bgRed: '#FFEBEE',
  bgBlue: '#E8F2FF',
  bgOrange: '#FFF4E5',
  bgGrey: '#F2F4F8',
} as const

export const STATUS_COLORS: Record<string, { bg: string; text: string; tagColor: string }> = {
  '进行中': { bg: '#E8F2FF', text: '#4080FF', tagColor: 'blue' },
  '已签约': { bg: '#E8F5E9', text: '#3DC779', tagColor: 'green' },
  '待评估': { bg: '#FFF4E5', text: '#FAC858', tagColor: 'orange' },
  '已完成': { bg: '#F2F4F8', text: '#9CA3AF', tagColor: 'grey' },
}

export const CARD_STYLES = {
  base: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s ease',
  },
  hover: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  header: { fontSize: 16, fontWeight: 500, color: COLORS.textPrimary, marginBottom: 16 },
  body: { padding: 20 },
} as const

export const PROGRESS_COLORS = {
  warning: { from: '#FAC858', to: '#EE6666' },
  normal: { from: '#4080FF', to: '#14C9C9' },
  good: { from: '#3DC779', to: '#14C9C9' },
} as const

export const TEXT_STYLES = {
  title: { fontSize: 20, fontWeight: 600, color: COLORS.textPrimary },
  cardTitle: { fontSize: 15, fontWeight: 600, color: COLORS.textPrimary },
  body: { fontSize: 14, fontWeight: 400, color: COLORS.textSecondary },
  caption: { fontSize: 12, fontWeight: 400, color: COLORS.textTertiary },
  value: { fontSize: 28, fontWeight: 700, color: COLORS.textPrimary },
  valueLarge: { fontSize: 32, fontWeight: 700, color: COLORS.textPrimary },
} as const

export const SIDEBAR_STYLES = {
  width: 240,
  collapsedWidth: 64,
  itemHeight: 48,
  backgroundColor: COLORS.sidebar,
  hoverBackground: 'rgba(255,255,255,0.1)',
  activeBorder: `4px solid ${COLORS.primary}`,
} as const

export const TABLE_STYLES = {
  headerBg: '#F9FAFB',
  rowHeight: 56,
  hoverBg: COLORS.hover,
  borderColor: COLORS.border,
} as const
```

- [ ] **Step 2: 重写 mockData.ts — 基于 cost 版数据模型，增加 PMSummary 类型和生成函数**

将 `src/mockData.ts` 重写为基于 cost 版 `src/versions/cost/mockData.ts` 的内容，增加：
- `PMSummary` 接口
- `generatePMSummaries()` 函数

```typescript
/**
 * V7 统一 Mock 数据
 */

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
  contractAmount: number
  receivedPayment: number
  progress: number
  planProfitRate: number
  externalHRRatioLimit: number
  actualCost: number
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

export interface DepartmentOverview {
  year: number
  totalPlanCost: number
  totalActualCost: number
  planRevenue: number
  actualRevenue: number
  costCategories: { category: string; plan: number; actual: number }[]
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

// --- 常量 ---
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
  costCategoryLimits: { '外采人力': 5000000, '商务费用': 2000000, '其他': 1000000 },
  projectDefaults: { externalHRRatioLimit: 0.15, otherCostLimit: 0.05, minProfitRate: 30 },
}

// --- 生成函数 ---

export function generateProjects(): Project[] {
  return districts.map((d, i) => {
    const isExisting = i < 8
    const contractAmount = randomBetween(80, 500) * 10000
    const receivedPayment = Math.round(contractAmount * (0.3 + Math.random() * 0.5))
    const progressPct = randomBetween(30, 90)

    if (isExisting) {
      const actualCost = Math.round(contractAmount * (0.6 + Math.random() * 0.2))
      return {
        id: `proj-${i + 1}`, name: `${d}信息化项目`, district: d,
        status: '已完成' as ProjectStatus, projectType: '存量' as ProjectType,
        sales: salesNames[i % salesNames.length], pm: pmNames[i % pmNames.length],
        contractAmount, receivedPayment, progress: 100,
        planProfitRate: 25, externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit,
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
        id: `proj-${i + 1}`, name: `${d}信息化项目`, district: d,
        status: statuses[i % statuses.length], projectType: '新增' as ProjectType,
        sales: salesNames[i % salesNames.length], pm: pmNames[i % pmNames.length],
        contractAmount, receivedPayment, progress: progressPct,
        planProfitRate: 30, externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit,
        actualCost: totalCost,
        costBreakdown: {
          internalHR, externalHR,
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
    return {
      name, district: `区域${i + 1}`,
      planRevenue, actualRevenue,
      planProfitRate: 25, actualProfitRate: Math.round(15 + Math.random() * 20),
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
    const estimatedProfitRate = totalContractAmount > 0 ? (estimatedProfit / totalContractAmount) * 100 : 0
    const totalExternalHR = pmProjects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
    const externalHRRatio = totalContractAmount > 0 ? (totalExternalHR / totalContractAmount) * 100 : 0
    return {
      pm, projectCount: pmProjects.length,
      totalContractAmount, totalReceivedPayment,
      estimatedCost, estimatedProfit,
      estimatedProfitRate, actualCost: estimatedCost,
      externalHRRatio, externalHRRatioLimit: DEPT_CONFIG.projectDefaults.externalHRRatioLimit * 100,
    }
  })
}

export function generateOverview(): DepartmentOverview {
  const projects = generateProjects()
  const planRevenue = projects.reduce((s, p) => s + p.contractAmount, 0)
  const actualRevenue = projects.reduce((s, p) => s + p.receivedPayment, 0)
  const totalActualCost = projects.reduce((s, p) => s + p.actualCost, 0)
  const totalPlanCost = Math.round(totalActualCost * (0.9 + Math.random() * 0.2))
  const totalInternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.internalHR || 0), 0)
  const totalExternalHR = projects.reduce((s, p) => s + (p.costBreakdown?.externalHR || 0), 0)
  const totalBusinessCost = projects.reduce((s, p) => s + (p.costBreakdown?.businessCost || 0), 0)
  const totalOtherCost = projects.reduce((s, p) => s + (p.costBreakdown?.otherCost || 0), 0)
  const existingTotalCost = projects.filter(p => p.projectType === '存量').reduce((s, p) => s + p.actualCost, 0)

  return {
    year: 2026, totalPlanCost, totalActualCost, planRevenue, actualRevenue,
    costCategories: [
      { category: '内部人力', plan: Math.round(totalPlanCost * 0.45), actual: totalInternalHR + Math.round(existingTotalCost * 0.45) },
      { category: '外采人力', plan: Math.round(totalPlanCost * 0.30), actual: totalExternalHR + Math.round(existingTotalCost * 0.30) },
      { category: '商务费用', plan: Math.round(totalPlanCost * 0.10), actual: totalBusinessCost + Math.round(existingTotalCost * 0.10) },
      { category: '其他', plan: Math.round(totalPlanCost * 0.15), actual: totalOtherCost + Math.round(existingTotalCost * 0.15) },
    ],
    projectStats: {
      total: projects.length,
      inProgress: projects.filter(p => p.status === '进行中').length,
      signed: projects.filter(p => p.status === '已签约').length,
      pending: projects.filter(p => p.status === '待评估').length,
      completed: projects.filter(p => p.status === '已完成').length,
      existing: projects.filter(p => p.projectType === '存量').length,
      newProjects: projects.filter(p => p.projectType === '新增').length,
    },
  }
}
```

- [ ] **Step 3: 更新 AppShell.tsx — 移除版本切换，固定导航**

```tsx
// 移除 version 相关 props，固定导航为三个板块
// 移除版本切换按钮和版本标签
// 保留侧边栏品牌区、导航菜单、顶部工具栏（刷新/导出/角色切换）
```

修改 `src/layouts/AppShell.tsx`:
- 删除 `AppVersion` 类型
- Props 中移除 `version`, `onVersionChange`
- 顶部 Header 移除版本标签显示
- 侧边栏移除版本切换按钮区域
- `contentBg` 固定为 `'#F8FAFC'`
- 品牌文字固定为 `'成本管理看板'`

- [ ] **Step 4: 更新 App.tsx — 移除双版本逻辑，统一为单版本**

```tsx
// 移除所有 versions/basic 和 versions/cost 的 import
// 统一使用 src/pages/ 下的组件和 src/mockData.ts 的数据
// 导航固定为：总览看板、项目看板、销售看板
// 移除 version state，移除版本相关的 useMemo
```

修改 `src/App.tsx`:
- 删除所有 basic/cost 版本的 import
- Import 统一从 `./pages/*` 和 `./mockData`
- 移除 `version` state
- `navItems` 固定为三个：总览看板、项目维度、销售看板
- `renderPage` 只有一套逻辑
- AppShell 调用不再传 version 相关 props

- [ ] **Step 5: 删除 versions 目录**

```bash
rm -rf src/versions/basic
rm -rf src/versions/cost
```

- [ ] **Step 6: 验证编译通过**

```bash
cd /Users/sunyue/project/win && npm run build
```
Expected: 编译成功，无错误

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: 合并双版本为单版本，清理 versions 目录

- theme.ts 统一为 cost 版样式
- mockData.ts 基于 cost 版数据模型，增加 PMSummary
- AppShell 移除版本切换
- App.tsx 移除双版本逻辑
- 删除 src/versions/basic/ 和 src/versions/cost/"
```

---

## Task 2: 增加 format 工具函数

**Files:**
- Modify: `src/utils/format.ts`

- [ ] **Step 1: 增加 `fmtAmountWan` 函数**

在 `src/utils/format.ts` 末尾追加：

```typescript
/**
 * 格式化金额为万元（保留两位小数）
 * @param v 金额（元）
 * @returns 格式化后的字符串，如 "123.45 万"
 */
export function fmtAmountWan(v: number): string {
  return `${(v / 10000).toFixed(2)} 万`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/format.ts
git commit -m "feat: 增加 fmtAmountWan 万元保留两位小数格式化"
```

---

## Task 3: 重写总览看板 Dashboard

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: 重写 Dashboard.tsx**

V7 总览看板布局（从上到下）：
1. **预警提示条** — 黄色背景，提示外采成本预警
2. **核心指标卡片行** — 年度收入 | 年度成本（突出） | 年度利润
3. **年度利润率卡片** — 独立行，计划利润率 vs 实际利润率双进度条
4. **成本细化卡片行** — 总成本 | 内部人力（灰色降级） | 可变成本（高亮）
5. **环状图** — 成本结构，直接显示百分比和金额
6. **成本分类明细表** — 剩余金额、已使用占比、推测预警列

关键代码结构：

```tsx
import { Card, Row, Col, Tag, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmount, fmtAmountWan, calcPct, getTrend } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES, PROGRESS_COLORS } from '../styles/theme'

export default function Dashboard({ overview }: Props) {
  // 1. 预警提示条（黄色背景）
  // 2. 年度收入/成本/利润 三张卡片 — 年度成本卡片用更突出的色块和进度条颜色
  // 3. 年度利润率 — 参考 cost 版利润率卡片，双进度条
  // 4. 成本细化行 — 总成本、内部人力（灰色文字+灰色进度条背景）、可变成本（高亮橙色）
  // 5. 环形图 — series label 设置为 {show: true}，formatter 显示名称+金额+百分比
  // 6. 明细表 — 列：成本类型、计划金额(万)、实际金额(万)、剩余金额(万)、已使用占比、进度条、推测预警
}
```

具体要求：
- 年度成本卡片：`borderLeft: '4px solid ${COLORS.danger}'` 或背景色略微加深来突出；进度条使用 PROGRESS_COLORS.warning 渐变
- 内部人力卡片：文字色 `COLORS.textTertiary`，无进度条，金额灰色
- 可变成本卡片：`borderLeft: '4px solid ${COLORS.warning}'` 或类似高亮处理
- 环形图：`label: { show: true, formatter: '{b}\n{c}万 ({d}%)' }` 直接显示
- 明细表金额用 `fmtAmountWan` 格式化，保留两位小数
- 剩余金额 = 计划 - 实际（正数绿色，负数红色）
- 已使用占比 = 实际/计划 × 100%
- 推测预警列：当前显示 `—`（预留）

- [ ] **Step 2: 启动开发服务器验证**

```bash
cd /Users/sunyue/project/win && npm run dev
```
Expected: 页面可访问，总览看板渲染正确

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: 重写总览看板 — 预警条+年度卡片+利润率+成本细化+环状图+明细表"
```

---

## Task 4: 重写项目看板 ProjectView

**Files:**
- Modify: `src/pages/ProjectView.tsx`

- [ ] **Step 1: 重写 ProjectView.tsx**

V7 项目看板布局（从上到下）：
1. **项目分布看板** — 四个卡片：总项目数 | 存量项目(灰色) | 新增项目 | 新增细分进度条
2. **区县项目金额分布图** — 横向柱状图，保持现有
3. **项目经理列表** — Table，字段：PM名称、项目数量、签约总金额、已回款、预计成本、预计利润(利润率)、实际消耗成本、实际外采成本占比(超限红色+⚠️)
4. **筛选区 + 项目列表** — 复用 cost 版项目列表，增加按项目经理筛选和按销售筛选

关键代码结构：

```tsx
import { useState } from 'react'
import { Card, Table, Tag, Input, Row, Col, Progress, Select } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project, PMSummary } from '../mockData'
import { generatePMSummaries } from '../mockData'
import { fmtAmountShort, fmtAmountWan } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES, STATUS_COLORS } from '../styles/theme'

export default function ProjectView({ projects }: Props) {
  // 1. 项目分布看板 — 四个 stat cards + 新增项目细分进度条
  // 2. 区县分布柱状图 — 保持现有逻辑
  // 3. PM 列表 — generatePMSummaries() 数据
  //    - 外采占比超限：ratio > limit 时红色+⚠️
  //    - 利润率：达标绿色↑ / 未达标红色↓（参考 cost 版样式）
  // 4. 项目列表筛选区 — 增加两个 Select：按项目经理筛选、按销售筛选
  // 5. 项目列表表格 — 直接复用 cost 版列定义
}
```

具体要求：
- 分布看板四个卡片使用 Row/Col 布局，存量项目卡片灰色背景+灰色文字
- 新增项目卡片下方展示四个状态的迷你进度条（待评估+已签约+进行中+已完成 = 新增项目数）
- PM 列表的利润率参考 cost 版 `ProjectView` 中利润率字段的渲染方式（绿色/红色背景 pill）
- 项目列表增加两个筛选 Select：PM 名称下拉、销售名称下拉，与其他筛选联动

- [ ] **Step 2: 启动开发服务器验证**

```bash
cd /Users/sunyue/project/win && npm run dev
```
Expected: 项目看板渲染正确，PM 列表和筛选功能正常

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProjectView.tsx
git commit -m "feat: 重写项目看板 — 分布看板+PM列表+项目列表双筛选"
```

---

## Task 5: 调整销售看板 SalesView

**Files:**
- Modify: `src/pages/SalesView.tsx`

- [ ] **Step 1: 调整 SalesView.tsx**

基于 basic 版 SalesView，保持内容不变，仅调整：
- 顶部四个卡片高度统一（固定 `minHeight` 或统一 `bodyStyle` padding）
- 数据源改为统一 mockData 的 `generateSalesTargets()`

```tsx
// 关键调整：四个 Col span=6 的卡片统一 minHeight
<Card style={{ ...CARD_STYLES.base }} bodyStyle={{ padding: 16, minHeight: 100 }}>
```

- [ ] **Step 2: 启动开发服务器验证**

```bash
cd /Users/sunyue/project/win && npm run dev
```
Expected: 销售看板卡片高度一致

- [ ] **Step 3: Commit**

```bash
git add src/pages/SalesView.tsx
git commit -m "feat: 调整销售看板卡片高度统一"
```

---

## Task 6: 全量验证与最终提交

- [ ] **Step 1: 编译验证**

```bash
cd /Users/sunyue/project/win && npm run build
```
Expected: 编译成功

- [ ] **Step 2: 开发服务器完整验证**

```bash
cd /Users/sunyue/project/win && npm run dev
```
手动验证：
- [ ] 三个板块导航切换正常
- [ ] 总览看板：预警条、年度卡片（成本突出）、利润率、成本细化行（内部人力灰色、可变成本高亮）、环状图直接显示百分比和金额、明细表万元两位小数
- [ ] 项目看板：分布看板、区县图、PM 列表（外采占比超限预警）、项目列表筛选（PM/销售）
- [ ] 销售看板：卡片高度一致
- [ ] 刷新功能正常
- [ ] 角色切换正常

- [ ] **Step 3: 最终 Commit**

```bash
git add -A
git commit -m "feat: V7 成本管理看板完成 — 单版本三板块全面实现"
```
