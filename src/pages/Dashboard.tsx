import { useMemo } from 'react'
import { Card, Progress, Table } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview, CostCategory } from '../mockData'
import { fmtAmountShort } from '../utils/format'
import { COLORS, SHADOWS, SPACING, TEXT_STYLES, RADII } from '../styles/theme'
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table'

// 警告图标组件
function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={COLORS.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

interface Props {
  overview: DepartmentOverview
}

export default function Dashboard({ overview }: Props) {
  // V8 KPI 计算逻辑
  const contractRevenue = overview.contractRevenue || overview.planRevenue
  const actualRevenue = overview.actualRevenue
  const planRevenue = overview.planRevenue

  const totalPlanCost = overview.totalPlanCost
  const totalActualCost = overview.totalActualCost
  const costRatio = overview.costRatio || (contractRevenue > 0 ? (totalPlanCost / contractRevenue) * 100 : 0)
  const costRatioLimit = overview.costRatioLimit || 30

  const actualProfit = overview.actualProfit || (contractRevenue - totalActualCost)
  const planProfit = overview.planProfit || (contractRevenue - totalPlanCost)

  // 趋势和状态判断
  const isOverCostRatio = costRatio > costRatioLimit
  const revenueProgress = planRevenue > 0 ? Math.round((contractRevenue / planRevenue) * 100) : 0
  const costProgress = totalPlanCost > 0 ? Math.round((totalActualCost / totalPlanCost) * 100) : 0
  const profitProgress = planProfit > 0 ? Math.round((actualProfit / planProfit) * 100) : 0

  // 获取扁平化的5项外部成本 + 内部成本
  const flatCostData = useMemo(() => {
    // 定义颜色：交付成本（蓝色系）、商务成本（紫色系）、内部成本（灰色弱化）
    const COST_COLORS: Record<string, string> = {
      '交付-外部门': '#3B82F6',
      '交付-外采成本': '#60A5FA',
      '商务-外采成本': '#8B5CF6',
      '商务-集采': '#A78BFA',
      '内部成本': '#CBD5E1',
    }
    const result: { name: string; value: number; color: string; plan: number; actual: number }[] = []

    // 遍历成本分类，提取5项外部成本
    overview.costCategories.forEach(cat => {
      if (cat.isInternal) {
        // 内部成本直接添加
        result.push({
          name: '内部成本',
          value: Math.round(cat.actual / 10000),
          color: COST_COLORS['内部成本'],
          plan: Math.round(cat.plan / 10000),
          actual: Math.round(cat.actual / 10000),
        })
      } else if (cat.children) {
        // 外部成本，提取二级和三级
        cat.children.forEach(subCat => {
          if (subCat.children) {
            subCat.children.forEach(item => {
              // 根据父级分类确定名称
              const prefix = subCat.name === '交付成本' ? '交付' : '商务'
              const suffix = item.name === '外部门成本' ? '外部门' : (item.name === '外采成本' ? '外采成本' : '集采')
              const fullName = `${prefix}-${suffix}` as keyof typeof COST_COLORS
              result.push({
                name: fullName,
                value: Math.round(item.actual / 10000),
                color: COST_COLORS[fullName] || COLORS.chartPrimary,
                plan: Math.round(item.plan / 10000),
                actual: Math.round(item.actual / 10000),
              })
            })
          }
        })
      }
    })

    return result
  }, [overview])

  const costPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 万 ({d}%)',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: [8, 12],
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '35%',
        style: {
          text: '总成本',
          textAlign: 'center',
          fill: COLORS.textTertiary,
          fontSize: 12,
          fontWeight: 500,
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '48%',
        style: {
          text: fmtAmountShort(overview.totalActualCost) + ' 万',
          textAlign: 'center',
          fill: COLORS.textPrimary,
          fontSize: 20,
          fontWeight: 600,
        },
      },
    ],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c}万 ({d}%)',
        fontSize: 11,
        color: COLORS.textSecondary,
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 15,
      },
      emphasis: { scale: true, scaleSize: 5 },
      data: flatCostData.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color, borderRadius: 4 },
      })),
    }],
  }

  // V8 水平条形图（计划 vs 实际）- 使用相同的5项外部成本
  const costBarOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: [10, 14],
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 100, right: 80, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { formatter: '{value}万', color: COLORS.textTertiary, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.divider, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: flatCostData.map(item => item.name),
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary, fontSize: 12 },
    },
    series: [
      {
        name: '计划',
        type: 'bar',
        barWidth: 12,
        itemStyle: { color: COLORS.chartTertiary, borderRadius: [0, 4, 4, 0] },
        data: flatCostData.map(item => item.plan),
      },
      {
        name: '实际',
        type: 'bar',
        barWidth: 12,
        barGap: '30%',
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: (params: { dataIndex: number }) => flatCostData[params.dataIndex]?.color || COLORS.chartPrimary,
        },
        label: { show: true, position: 'right', formatter: '{c}万', fontSize: 11, color: COLORS.textSecondary },
        data: flatCostData.map(item => item.actual),
      },
    ],
  }

  return (
    <div>
      {/* 警示横幅 */}
      <div style={{
        backgroundColor: COLORS.bgRed,
        border: `1px solid ${COLORS.dangerLight}40`,
        borderRadius: RADII.card,
        padding: '12px 16px',
        marginBottom: SPACING.xl,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
        color: COLORS.danger,
        fontWeight: 500,
      }}>
        <AlertIcon />
        <span>当前有 3 个项目外采成本即将超出外采成本线，请关注</span>
      </div>

      {/* KPI 卡片 - V8 三列布局 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
        {/* 收入卡片 */}
        <V8RevenueCard
          contractRevenue={contractRevenue}
          actualRevenue={actualRevenue}
          planRevenue={planRevenue}
          progress={revenueProgress}
        />

        {/* 成本卡片 */}
        <V8CostCard
          planCost={totalPlanCost}
          actualCost={totalActualCost}
          costRatio={costRatio}
          costRatioLimit={costRatioLimit}
          isOverLimit={isOverCostRatio}
          progress={costProgress}
        />

        {/* 利润卡片 */}
        <V8ProfitCard
          actualProfit={actualProfit}
          planProfit={planProfit}
          progress={profitProgress}
        />
      </div>

      {/* 图表区域 - V8 成本结构 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
        {/* 左：环状图 */}
        <Card
          style={{
            borderRadius: RADII.card,
            backgroundColor: COLORS.card,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.border}`,
            height: 360,
          }}
          bodyStyle={{ padding: SPACING.xl }}
        >
          <div style={TEXT_STYLES.cardTitle}>成本结构</div>
          <ReactECharts
            option={costPieOption}
            style={{ height: 280 }}
            opts={{ renderer: 'svg' }}
          />
        </Card>

        {/* 右：水平条形图（计划 vs 实际） */}
        <Card
          style={{
            borderRadius: RADII.card,
            backgroundColor: COLORS.card,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.border}`,
            height: 360,
          }}
          bodyStyle={{ padding: SPACING.xl }}
        >
          <div style={TEXT_STYLES.cardTitle}>成本对比（计划 vs 实际）</div>
          <ReactECharts
            option={costBarOption}
            style={{ height: 280 }}
            opts={{ renderer: 'svg' }}
          />
        </Card>
      </div>

      {/* 成本分类明细表格 */}
      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
        <CostCategoryTable data={overview.costCategories} />
      </Card>
    </div>
  )
}

// V8 KPI 卡片组件 - 收入卡片
interface V8RevenueCardProps {
  contractRevenue: number
  actualRevenue: number
  planRevenue: number
  progress: number
}

function V8RevenueCard({ contractRevenue, actualRevenue, planRevenue, progress }: V8RevenueCardProps) {
  return (
    <div style={{
      backgroundColor: COLORS.card,
      borderRadius: RADII.card,
      padding: SPACING.xl,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOWS.card,
      borderTop: `3px solid ${COLORS.primary}`,
    }}>
      <div style={TEXT_STYLES.label}>收入</div>

      {/* 主要数据区 */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>合同签约收入</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>
            {fmtAmountShort(contractRevenue)} <span style={{ fontSize: 13, fontWeight: 500 }}>万</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>实际回款</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.textSecondary }}>
            {fmtAmountShort(actualRevenue)} <span style={{ fontSize: 12 }}>万</span>
          </div>
        </div>
      </div>

      {/* 年度计划 */}
      <div style={{ marginTop: 12, fontSize: 12, color: COLORS.textTertiary }}>
        年度收入计划 {fmtAmountShort(planRevenue)} 万
      </div>

      {/* 进度条 */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: COLORS.textTertiary }}>(签约/计划)</span>
          <span style={{ fontWeight: 600, color: COLORS.primary }}>{progress}%</span>
        </div>
        <Progress
          percent={Math.min(progress, 100)}
          showInfo={false}
          stroke={COLORS.primary}
          style={{ height: 8, borderRadius: 4 }}
        />
      </div>
    </div>
  )
}

// V8 KPI 卡片组件 - 成本卡片
interface V8CostCardProps {
  planCost: number
  actualCost: number
  costRatio: number
  costRatioLimit: number
  isOverLimit: boolean
  progress: number
}

function V8CostCard({ planCost, actualCost, costRatio, costRatioLimit, isOverLimit, progress }: V8CostCardProps) {
  return (
    <div style={{
      backgroundColor: COLORS.card,
      borderRadius: RADII.card,
      padding: SPACING.xl,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOWS.card,
      borderTop: `3px solid ${isOverLimit ? COLORS.danger : COLORS.success}`,
    }}>
      <div style={TEXT_STYLES.label}>成本</div>

      {/* 主要数据区 */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>计划成本</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: isOverLimit ? COLORS.danger : COLORS.success }}>
              {fmtAmountShort(planCost)} <span style={{ fontSize: 13, fontWeight: 500 }}>万</span>
            </span>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: isOverLimit ? COLORS.danger : COLORS.success,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              ({costRatio.toFixed(0)}%)
              {isOverLimit && <AlertIcon />}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>实际成本</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.textSecondary }}>
            {fmtAmountShort(actualCost)} <span style={{ fontSize: 12 }}>万</span>
          </div>
        </div>
      </div>

      {/* 基准说明 */}
      <div style={{ marginTop: 12, fontSize: 12, color: COLORS.textTertiary }}>
        基准值 {costRatioLimit}%（计划成本/签约收入）
      </div>

      {/* 进度条 */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: COLORS.textTertiary }}>(实际/计划)</span>
          <span style={{ fontWeight: 600, color: progress > 100 ? COLORS.danger : COLORS.textSecondary }}>{progress}%</span>
        </div>
        <Progress
          percent={Math.min(progress, 100)}
          showInfo={false}
          stroke={progress > 100 ? COLORS.danger : progress > 80 ? COLORS.warning : COLORS.success}
          style={{ height: 8, borderRadius: 4 }}
        />
      </div>
    </div>
  )
}

// V8 KPI 卡片组件 - 利润卡片
interface V8ProfitCardProps {
  actualProfit: number
  planProfit: number
  progress: number
}

function V8ProfitCard({ actualProfit, planProfit, progress }: V8ProfitCardProps) {
  const profitRate = planProfit > 0 ? (actualProfit / planProfit) * 100 : 0
  const isGood = progress >= 80

  return (
    <div style={{
      backgroundColor: COLORS.card,
      borderRadius: RADII.card,
      padding: SPACING.xl,
      border: `1px solid ${COLORS.border}`,
      boxShadow: SHADOWS.card,
      borderTop: `3px solid ${isGood ? COLORS.success : COLORS.warning}`,
    }}>
      <div style={TEXT_STYLES.label}>利润</div>

      {/* 主要数据区 */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>实时预测毛利润</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>
              {fmtAmountShort(actualProfit)} <span style={{ fontSize: 13, fontWeight: 500 }}>万</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.textSecondary }}>
              ({profitRate.toFixed(0)}%)
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>计划毛利润</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: COLORS.textTertiary }}>
            {fmtAmountShort(planProfit)} <span style={{ fontSize: 11 }}>万</span>
          </div>
        </div>
      </div>

      {/* 占比说明 */}
      <div style={{ marginTop: 12, fontSize: 12, color: COLORS.textTertiary }}>
        (实际利润/计划利润)
      </div>

      {/* 进度条 */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: COLORS.textTertiary }}>达成进度</span>
          <span style={{ fontWeight: 600, color: isGood ? COLORS.success : COLORS.warning }}>{progress}%</span>
        </div>
        <Progress
          percent={Math.min(progress, 100)}
          showInfo={false}
          stroke={isGood ? COLORS.success : COLORS.warning}
          style={{ height: 8, borderRadius: 4 }}
        />
      </div>
    </div>
  )
}

// 成本分类明细表格组件
interface CostCategoryRow {
  key: string
  category: string
  plan: number
  actual: number
  usagePct: number
  q1: number
  q2: number
  current: number
  remaining: number
  level: number
  isInternal?: boolean
  hasChildren?: boolean
}

function CostCategoryTable({ data }: { data: CostCategory[] }) {
  // 将三级树形数据转换为扁平化的表格数据
  const flattenData = (categories: CostCategory[], level = 1, parentKey = ''): CostCategoryRow[] => {
    const result: CostCategoryRow[] = []
    categories.forEach((cat, i) => {
      const rowKey = parentKey ? `${parentKey}-${i}` : cat.key
      const usagePct = cat.plan > 0 ? Math.round((cat.actual / cat.plan) * 100) : 0
      result.push({
        key: rowKey,
        category: cat.name,
        plan: cat.plan,
        actual: cat.actual,
        usagePct,
        q1: cat.q1,
        q2: cat.q2,
        current: cat.current,
        remaining: cat.remaining,
        level,
        isInternal: cat.isInternal,
        hasChildren: (cat.children?.length || 0) > 0,
      })
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenData(cat.children, level + 1, rowKey))
      }
    })
    return result
  }

  const tableData = flattenData(data)

  const columns: ColumnProps<CostCategoryRow>[] = [
    {
      title: '成本类型',
      dataIndex: 'category',
      width: 200,
      render: (text, record) => {
        const indent = (record.level - 1) * 20
        const isInternal = record.isInternal
        return (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: indent,
            color: isInternal ? COLORS.textTertiary : COLORS.textPrimary,
            fontWeight: record.level === 1 ? 600 : record.level === 2 ? 500 : 400,
          }}>
            {text}
          </span>
        )
      },
    },
    {
      title: '计划金额（万元）',
      dataIndex: 'plan',
      width: 120,
      align: 'right',
      render: (val, record) => (
        <span style={{
          fontWeight: record.level === 1 ? 600 : 400,
          color: record.isInternal ? COLORS.textTertiary : COLORS.textSecondary,
        }}>
          {(val / 10000).toFixed(2)}
        </span>
      ),
    },
    {
      title: '使用进度',
      width: 140,
      render: (_: unknown, record: CostCategoryRow) => {
        if (record.level === 1 && record.plan === 0) return null
        const color = record.usagePct > 100
          ? COLORS.danger
          : record.usagePct >= 80
            ? COLORS.warning
            : COLORS.success
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={Math.min(record.usagePct, 100)}
              size="small"
              showInfo={false}
              stroke={color}
              style={{ flex: 1, height: 6, borderRadius: 3 }}
            />
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color,
              minWidth: 36,
              textAlign: 'right',
            }}>
              {record.usagePct}%
            </span>
          </div>
        )
      },
    },
    {
      title: 'Q1使用（万元）',
      dataIndex: 'q1',
      width: 100,
      align: 'right',
      render: (val, record) => (
        <span style={{ color: record.isInternal ? COLORS.textTertiary : COLORS.textSecondary }}>
          {val.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Q2使用（万元）',
      dataIndex: 'q2',
      width: 100,
      align: 'right',
      render: (val, record) => (
        <span style={{ color: record.isInternal ? COLORS.textTertiary : COLORS.textSecondary }}>
          {val.toFixed(2)}
        </span>
      ),
    },
    {
      title: '当前总消耗（万元）',
      dataIndex: 'current',
      width: 120,
      align: 'right',
      render: (val, record) => {
        const isOver = record.usagePct > 100
        return (
          <span style={{
            fontWeight: 600,
            color: isOver ? COLORS.danger : (record.isInternal ? COLORS.textTertiary : COLORS.textPrimary),
          }}>
            {val.toFixed(2)}
          </span>
        )
      },
    },
    {
      title: '剩余可用（万元）',
      dataIndex: 'remaining',
      width: 120,
      align: 'right',
      render: (val: number) => (
        <span style={{
          fontWeight: 600,
          color: val >= 0 ? COLORS.success : COLORS.danger,
        }}>
          {val.toFixed(2)}
        </span>
      ),
    },
  ]

  return (
    <div style={{ marginTop: SPACING.lg, maxHeight: 400, overflow: 'auto' }}>
      <style>{`
        .cost-tree-table .semi-table-thead {
          background: transparent;
        }
        .cost-tree-table .semi-table-thead th {
          background: transparent !important;
          border-bottom: 1px solid ${COLORS.border};
          font-weight: 500;
          color: ${COLORS.textSecondary};
          font-size: 12;
        }
        .cost-tree-table .semi-table-tbody td {
          border-bottom: 1px solid ${COLORS.borderLight};
        }
        .cost-tree-table .semi-table-row:hover td {
          background-color: ${COLORS.hover} !important;
        }
      `}</style>
      <Table
        className="cost-tree-table"
        columns={columns}
        dataSource={tableData}
        pagination={false}
        rowKey="key"
        style={{ border: 'none' }}
      />
    </div>
  )
}
