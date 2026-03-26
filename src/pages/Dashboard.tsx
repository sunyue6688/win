import { Card, Progress, Table } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmount, fmtAmountWan, calcPct, getTrend } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../styles/theme'
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table'

interface Props {
  overview: DepartmentOverview
}

export default function Dashboard({ overview }: Props) {
  const profitRate = overview.actualRevenue > 0
    ? ((overview.actualRevenue - overview.totalActualCost) / overview.actualRevenue) * 100
    : 0
  const planProfitRate = overview.planRevenue > 0
    ? ((overview.planRevenue - overview.totalPlanCost) / overview.planRevenue) * 100
    : 0

  // 趋势
  const totalPct = calcPct(overview.totalActualCost, overview.totalPlanCost)
  const totalTrend = getTrend(overview.totalActualCost, overview.totalPlanCost)
  const revenueTrend = getTrend(overview.actualRevenue, overview.planRevenue)

  // 环形图
  const costPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 万 ({d}%)',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    legend: { bottom: 0, textStyle: { fontSize: 12, color: COLORS.textSecondary } },
    graphic: [
      { type: 'text', left: 'center', top: '35%', style: { text: '总成本', textAlign: 'center', fill: COLORS.textTertiary, fontSize: 12 } },
      { type: 'text', left: 'center', top: '48%', style: { text: fmtAmount(overview.totalActualCost), textAlign: 'center', fill: COLORS.textPrimary, fontSize: 20, fontWeight: 600 } },
    ],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      label: { show: true, formatter: '{b}\n{c}万 ({d}%)', fontSize: 11, color: COLORS.textSecondary },
      emphasis: { scale: true, scaleSize: 5 },
      data: overview.costCategories.map((c, i) => ({
        name: c.category,
        value: Math.round(c.actual / 10000),
        itemStyle: { color: COLORS.chart[i], borderRadius: 4 },
      })),
    }],
  }

  // 堆叠柱状图 - 成本趋势（控制金额 vs 实际消耗）
  const categories = overview.costCategories
  const costTrendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      formatter: (params: { seriesName: string; value: number; name: string }[]) => {
        let html = `<strong>${params[0].name}</strong><br/>`
        params.forEach(p => {
          html += `${p.seriesName}: ${p.value} 万<br/>`
        })
        return html
      },
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12, color: COLORS.textSecondary },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['控制金额', '实际消耗'],
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { formatter: '{value} 万', color: COLORS.textTertiary, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.divider, type: 'dashed' } },
    },
    series: categories.map((cat, i) => ({
      name: cat.category,
      type: 'bar',
      stack: 'cost',
      barWidth: 60,
      itemStyle: { color: COLORS.chart[i], borderRadius: i === categories.length - 1 ? [4, 4, 0, 0] : 0 },
      data: [
        Math.round(cat.plan / 10000),
        Math.round(cat.actual / 10000),
      ],
    })),
  }

  // 判断是否超出成本
  const isOverCost = totalPct > 100

  return (
    <div>
      {/* 第一行：警示横幅 */}
      <div style={{
        backgroundColor: COLORS.bgRed,
        border: `1px solid ${COLORS.danger}30`,
        borderRadius: 8,
        padding: '12px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
        color: COLORS.danger,
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span>当前有3个项目外采成本即将超出外采成本线，请关注</span>
      </div>

      {/* 第二行：KPI 卡片（横向排列） */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* 总收入 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: '16px 20px',
          border: `1px solid ${COLORS.border}`,
          borderLeft: `4px solid ${COLORS.primary}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>总收入</span>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: COLORS.textPrimary }}>
            {fmtAmount(overview.actualRevenue)}
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4, color: COLORS.textTertiary }}>万元</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: COLORS.tertiary, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14 }}>↑</span>
            {revenueTrend.text}
            <span style={{ fontWeight: 500, marginLeft: 4, color: COLORS.textTertiary }}>较上季度环比</span>
          </div>
        </div>

        {/* 总成本 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: '16px 20px',
          border: `1px solid ${COLORS.border}`,
          borderLeft: `4px solid ${COLORS.danger}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>总成本</span>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: COLORS.textPrimary }}>
            {fmtAmount(overview.totalActualCost)}
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4, color: COLORS.textTertiary }}>万</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: isOverCost ? COLORS.danger : COLORS.warning, display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠️ {isOverCost ? `超出预算 ${totalPct - 100}%` : `占比 ${totalPct}%`}
          </div>
        </div>

        {/* 净利润 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: '16px 20px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>净利润</span>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: COLORS.textPrimary }}>
            {fmtAmountWan(overview.actualRevenue - overview.totalActualCost)}
            <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4, color: COLORS.textTertiary }}>万</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: COLORS.tertiary }}>
            同比增长 18%
          </div>
        </div>

        {/* 利润率 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: '16px 20px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <span style={{ color: COLORS.textTertiary, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>利润率</span>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: COLORS.textPrimary }}>
            {profitRate.toFixed(1)}%
          </div>
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
            优于行业基准
          </div>
        </div>
      </div>

      {/* 第三行：成本结构 + 成本趋势 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        {/* 左侧：成本结构饼图 */}
        <Card style={{ ...CARD_STYLES.base, height: 360 }} bodyStyle={{ padding: 20 }}>
          <div style={TEXT_STYLES.cardTitle}>成本结构</div>
          <ReactECharts option={costPieOption} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
        </Card>

        {/* 右侧：成本趋势堆叠柱状图 */}
        <Card style={{ ...CARD_STYLES.base, height: 360 }} bodyStyle={{ padding: 20 }}>
          <div style={TEXT_STYLES.cardTitle}>成本趋势</div>
          <ReactECharts option={costTrendOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
        </Card>
      </div>

      {/* 第四行：成本分类明细表格 */}
      <Card style={CARD_STYLES.base} bodyStyle={{ padding: '20px 24px' }}>
        <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
        <CostCategoryTable data={overview.costCategories} />
      </Card>
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
  colorIndex: number
  subCategories?: {
    key: string
    name: string
    plan: number
    actual: number
    usagePct: number
    q1: number
    q2: number
    current: number
    remaining: number
  }[]
}

function CostCategoryTable({ data }: { data: DepartmentOverview['costCategories'] }) {
  const tableData: CostCategoryRow[] = data.map((c, i) => {
    const usagePct = c.plan > 0 ? Math.round((c.actual / c.plan) * 100) : 0
    const q1 = Math.round(c.actual * 0.35 / 10000)
    const q2 = Math.round(c.actual * 0.25 / 10000)
    const current = Math.round(c.actual / 10000)
    const remaining = Math.round((c.plan - c.actual) / 10000)
    return {
      key: c.category,
      category: c.category,
      plan: c.plan,
      actual: c.actual,
      usagePct,
      q1,
      q2,
      current,
      remaining,
      colorIndex: i,
      subCategories: c.subCategories?.map((sub, si) => ({
        key: `${c.category}-${si}`,
        name: sub.name,
        plan: sub.plan,
        actual: sub.actual,
        usagePct: sub.plan > 0 ? Math.round((sub.actual / sub.plan) * 100) : 0,
        q1: Math.round(sub.q1 / 10000),
        q2: Math.round(sub.q2 / 10000),
        description: sub.description,
      })),
    }
  })

  const columns: ColumnProps<CostCategoryRow>[] = [
    {
      title: '成本类型',
      dataIndex: 'category',
      width: 180,
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.chart[record.colorIndex], marginRight: 8 }} />
          <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{text}</span>
        </span>
      ),
    },
    {
      title: '控制总金额（万元）',
      dataIndex: 'plan',
      width: 140,
      align: 'right',
      render: (val) => <span style={{ fontWeight: 500, color: COLORS.textSecondary }}>{(val / 10000).toFixed(2)}</span>,
    },
    {
      title: '使用进度',
      width: 140,
      render: (_: unknown, record: CostCategoryRow) => {
        const color = record.usagePct > 100 ? COLORS.danger : record.usagePct >= 80 ? COLORS.warning : COLORS.success
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={Math.min(record.usagePct, 100)}
              size="small"
              showInfo={false}
              stroke={color}
              style={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 40 }}>{record.usagePct}%</span>
          </div>
        )
      },
    },
    {
      title: 'Q1消耗（万元）',
      dataIndex: 'q1',
      width: 120,
      align: 'right',
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Q2消耗（万元）',
      dataIndex: 'q2',
      width: 120,
      align: 'right',
      render: (val) => val.toFixed(2),
    },
    {
      title: '当前消耗（万元）',
      dataIndex: 'current',
      width: 130,
      align: 'right',
      render: (val, record) => {
        const isOver = record.usagePct > 100
        return <span style={{ fontWeight: 700, color: isOver ? COLORS.danger : COLORS.textPrimary }}>{val.toFixed(2)}</span>
      },
    },
    {
      title: '剩余可使用（万元）',
      dataIndex: 'remaining',
      width: 130,
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700, color: val >= 0 ? COLORS.success : COLORS.danger }}>{val.toFixed(2)}</span>,
    },
  ]

  // 展开行渲染
  const expandedRowRender = (record: CostCategoryRow | undefined) => {
    if (!record || !record.subCategories || record.subCategories.length === 0) return null

    const subColumns: ColumnProps<typeof record.subCategories[0]>[] = [
      {
        title: '二级分类',
        dataIndex: 'name',
        width: 180,
        render: (text) => (
          <span style={{ paddingLeft: 24, fontWeight: 500, color: COLORS.textSecondary }}>{text}</span>
        ),
      },
      {
        title: '控制总金额（万元）',
        dataIndex: 'plan',
        width: 140,
        align: 'right',
        render: (val) => <span style={{ color: COLORS.textTertiary }}>{(val / 10000).toFixed(2)}</span>,
      },
      {
        title: '使用进度',
        width: 140,
        render: (_: unknown, subRecord: { usagePct: number }) => {
          const color = subRecord.usagePct > 100 ? COLORS.danger : subRecord.usagePct >= 80 ? COLORS.warning : COLORS.success
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Progress percent={Math.min(subRecord.usagePct, 100)} size="small" showInfo={false}
                stroke={color} style={{ flex: 1, height: 6, borderRadius: 3 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 36 }}>{subRecord.usagePct}%</span>
            </div>
          )
        },
      },
      {
        title: 'Q1消耗（万元）',
        dataIndex: 'q1',
        width: 120,
        align: 'right',
        render: (val: number) => val.toFixed(2),
      },
      {
        title: 'Q2消耗（万元）',
        dataIndex: 'q2',
        width: 120,
        align: 'right',
        render: (val: number) => val.toFixed(2),
      },
      {
        title: '说明',
        dataIndex: 'description',
        width: 180,
        render: (text) => <span style={{ color: COLORS.textTertiary, fontSize: 12 }}>{text}</span>,
      },
    ]

    return (
      <Table
        columns={subColumns}
        dataSource={record.subCategories}
        pagination={false}
        showHeader={false}
        style={{ backgroundColor: '#FAFBFC' }}
      />
    )
  }

  return (
    <div style={{ marginTop: 16, height: 280, overflow: 'auto' }}>
      <style>{`
        .cost-table .semi-table-thead {
          background: transparent;
        }
        .cost-table .semi-table-thead th {
          background: transparent !important;
          border-bottom: none;
          font-weight: 500;
        }
      `}</style>
      <Table
        className="cost-table"
        columns={columns}
        dataSource={tableData}
        pagination={false}
        expandedRowRender={expandedRowRender}
        rowKey="key"
        hideExpandedColumn={false}
        style={{ border: 'none' }}
      />
    </div>
  )
}
