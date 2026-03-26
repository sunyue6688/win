import { useMemo } from 'react'
import { Card, Table, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { SalesTarget, Project } from '../mockData'
import { fmtAmountShort } from '../utils/format'
import { COLORS, TEXT_STYLES, SPACING, RADII, SHADOWS } from '../styles/theme'
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table'

interface Props {
  salesTargets: SalesTarget[]
  projects?: Project[]
}

export default function SalesView({ salesTargets, projects = [] }: Props) {
  // V8 KPI 计算
  const totalContractAmount = salesTargets.reduce((s, t) => s + t.totalContractAmount, 0)
  const totalReceivedPayment = salesTargets.reduce((s, t) => s + t.totalReceivedPayment, 0)
  const overallPaymentRate = totalContractAmount > 0 ? Math.round((totalReceivedPayment / totalContractAmount) * 100) : 0

  // 区县项目金额分布（从项目看板移入）
  const districtData = useMemo(() => {
    if (!projects || projects.length === 0) {
      // 如果没有传入项目数据，使用 salesTargets 模拟
      const mockDistricts = ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '高新区', '天府新区', '龙泉驿区', '双流区', '郫都区']
      return mockDistricts.map((d, i) => ({
        district: d,
        amount: Math.round(100 + Math.random() * 400) * 10000,
        isTop3: i < 3,
      })).sort((a, b) => b.amount - a.amount)
    }

    const data = projects.reduce<Record<string, { count: number; amount: number }>>((acc, p) => {
      if (!acc[p.district]) acc[p.district] = { count: 0, amount: 0 }
      acc[p.district].count++
      acc[p.district].amount += p.contractAmount
      return acc
    }, {})

    return Object.entries(data)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([district, d], i) => ({
        district,
        amount: d.amount,
        isTop3: i < 3,
      }))
  }, [projects])

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 60, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)}万`, color: COLORS.textTertiary, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.divider, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: districtData.map(d => d.isTop3 ? `★ ${d.district}` : d.district),
      axisLabel: { fontSize: 12, color: COLORS.textSecondary },
    },
    series: [{
      type: 'bar',
      data: districtData.map((d) => ({
        value: d.amount,
        itemStyle: {
          color: d.isTop3 ? COLORS.chartPrimary : COLORS.chartTertiary,
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: 16,
      label: { show: true, position: 'right', formatter: (p: { value: number }) => `${(p.value / 10000).toFixed(0)}万`, fontSize: 11, color: COLORS.textSecondary },
    }],
  }

  // V8 销售明细表列
  const columns: ColumnProps<SalesTarget>[] = [
    {
      title: '销售',
      dataIndex: 'name',
      width: 80,
      render: (text: string) => <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{text}</span>,
    },
    {
      title: '项目数量',
      dataIndex: 'projectCount',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '签约总金额（万元）',
      dataIndex: 'totalContractAmount',
      width: 120,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '已回款总金额（万元）',
      dataIndex: 'totalReceivedPayment',
      width: 130,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '总计划成本（万元）',
      dataIndex: 'totalPlanCost',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '总计划交付成本（万元）',
      dataIndex: 'totalPlanDeliveryCost',
      width: 140,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '实际成本（万元）',
      dataIndex: 'actualCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '实际交付成本（万元）',
      dataIndex: 'actualDeliveryCost',
      width: 130,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 500 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '交付成本占比',
      width: 100,
      render: (_: unknown, record: SalesTarget) => {
        const ratio = record.deliveryCostRatio || (record.actualCost > 0 ? 65 : 0)
        const overLimit = ratio > 30
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: overLimit ? COLORS.bgRed : COLORS.bgGreen,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {ratio.toFixed(1)}%
            </span>
          </div>
        )
      },
    },
    {
      title: '整体交付效率',
      width: 100,
      render: (_: unknown, record: SalesTarget) => {
        const eff = record.deliveryEfficiency || 1
        const status = eff > 1 ? 'excellent' : eff >= 1 ? 'good' : 'warning'
        const color = status === 'excellent' ? COLORS.success : status === 'good' ? COLORS.primary : COLORS.warning
        return <span style={{ fontWeight: 600, fontSize: 13, color }}>{eff.toFixed(2)}</span>
      },
    },
    {
      title: '贡献值（万元）',
      dataIndex: 'contributionValue',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600, color: COLORS.success }}>{v.toFixed(2)}</span>,
    },
  ]

  // 总计行数据
  const totalRow: SalesTarget = {
    name: '合计',
    district: '',
    projectCount: salesTargets.reduce((s, t) => s + t.projectCount, 0),
    totalContractAmount,
    totalReceivedPayment,
    totalPlanCost: salesTargets.reduce((s, t) => s + t.totalPlanCost, 0),
    totalPlanDeliveryCost: salesTargets.reduce((s, t) => s + t.totalPlanDeliveryCost, 0),
    actualCost: salesTargets.reduce((s, t) => s + t.actualCost, 0),
    actualDeliveryCost: salesTargets.reduce((s, t) => s + t.actualDeliveryCost, 0),
    deliveryCostRatio: 0,
    deliveryEfficiency: 0,
    contributionValue: salesTargets.reduce((s, t) => s + t.contributionValue, 0),
    // 旧字段兼容
    planRevenue: 0,
    actualRevenue: 0,
    planProfitRate: 0,
    actualProfitRate: 0,
  }

  // 计算总计行的交付成本占比和效率
  totalRow.deliveryCostRatio = totalRow.actualCost > 0 ? (totalRow.actualDeliveryCost / totalRow.actualCost) * 100 : 0
  totalRow.deliveryEfficiency = totalRow.actualDeliveryCost > 0
    ? (totalRow.totalPlanDeliveryCost / totalRow.actualDeliveryCost)
    : 0

  return (
    <div>
      {/* V8 第一行：3 张 KPI 卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
        {/* 实际合同签约 */}
        <Card
          style={{
            borderRadius: RADII.card,
            backgroundColor: COLORS.card,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.border}`,
          }}
          bodyStyle={{ padding: SPACING.xl }}
        >
          <div style={TEXT_STYLES.label}>实际合同签约</div>
          <div style={{ ...TEXT_STYLES.value, marginTop: 8 }}>
            {fmtAmountShort(totalContractAmount)}
            <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textTertiary, marginLeft: 4 }}>万元</span>
          </div>
        </Card>

        {/* 实际合同回款 */}
        <Card
          style={{
            borderRadius: RADII.card,
            backgroundColor: COLORS.card,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.border}`,
          }}
          bodyStyle={{ padding: SPACING.xl }}
        >
          <div style={TEXT_STYLES.label}>实际合同回款</div>
          <div style={{ ...TEXT_STYLES.value, marginTop: 8 }}>
            {fmtAmountShort(totalReceivedPayment)}
            <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textTertiary, marginLeft: 4 }}>万元</span>
          </div>
        </Card>

        {/* 整体回款率 */}
        <Card
          style={{
            borderRadius: RADII.card,
            backgroundColor: COLORS.card,
            boxShadow: SHADOWS.card,
            border: `1px solid ${COLORS.border}`,
          }}
          bodyStyle={{ padding: SPACING.xl }}
        >
          <div style={TEXT_STYLES.label}>整体回款率</div>
          <div style={{
            ...TEXT_STYLES.value,
            marginTop: 8,
            color: overallPaymentRate >= 80 ? COLORS.success : overallPaymentRate >= 50 ? COLORS.warning : COLORS.danger,
          }}>
            {overallPaymentRate}%
            <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.textTertiary, marginLeft: 8 }}>
              已回款/签约金额
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Progress
              percent={Math.min(overallPaymentRate, 100)}
              showInfo={false}
              stroke={overallPaymentRate >= 80 ? COLORS.success : overallPaymentRate >= 50 ? COLORS.warning : COLORS.danger}
              style={{ height: 8, borderRadius: 4 }}
            />
          </div>
        </Card>
      </div>

      {/* V8 第二行：区县项目金额分布图 */}
      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
          marginBottom: SPACING.xl,
          height: 360,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={TEXT_STYLES.cardTitle}>区县项目金额分布（前10）</div>
        <ReactECharts option={districtBarOption} style={{ height: 280 }} />
      </Card>

      {/* V8 第三行：销售列表 */}
      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={TEXT_STYLES.cardTitle}>销售列表</div>
        <div style={{ marginTop: SPACING.lg, overflow: 'auto' }}>
          <Table
            className="sales-table"
            columns={columns}
            dataSource={salesTargets}
            pagination={false}
            size="small"
            rowKey="name"
          />
          {/* 合计行 - 使用表格模拟 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 80px 120px 130px 120px 140px 110px 130px 100px 100px 110px',
            padding: '12px 16px',
            borderTop: `2px solid ${COLORS.border}`,
            fontWeight: 600,
            backgroundColor: COLORS.hover,
            fontSize: 14,
          }}>
            <span style={{ color: COLORS.textPrimary }}>合计</span>
            <span style={{ textAlign: 'center' }}>{totalRow.projectCount}</span>
            <span style={{ textAlign: 'right' }}>{fmtAmountShort(totalRow.totalContractAmount)}</span>
            <span style={{ textAlign: 'right' }}>{fmtAmountShort(totalRow.totalReceivedPayment)}</span>
            <span style={{ textAlign: 'right', color: COLORS.textSecondary }}>{fmtAmountShort(totalRow.totalPlanCost)}</span>
            <span style={{ textAlign: 'right', color: COLORS.textSecondary }}>{fmtAmountShort(totalRow.totalPlanDeliveryCost)}</span>
            <span style={{ textAlign: 'right' }}>{fmtAmountShort(totalRow.actualCost)}</span>
            <span style={{ textAlign: 'right' }}>{fmtAmountShort(totalRow.actualDeliveryCost)}</span>
            <span>{totalRow.deliveryCostRatio.toFixed(1)}%</span>
            <span>{totalRow.deliveryEfficiency.toFixed(2)}</span>
            <span style={{ textAlign: 'right', color: COLORS.success }}>{totalRow.contributionValue.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
