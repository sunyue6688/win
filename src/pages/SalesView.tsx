import { Card, Table, Progress, Row, Col } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { SalesTarget } from '../mockData'
import { fmtAmountShort, getTrend } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../styles/theme'

interface Props {
  salesTargets: SalesTarget[]
  userRole?: 'boss' | 'pm' | 'sales'
}

export default function SalesView({ salesTargets }: Props) {
  const totalPlan = salesTargets.reduce((s, t) => s + t.planRevenue, 0)
  const totalActual = salesTargets.reduce((s, t) => s + t.actualRevenue, 0)
  const totalProjects = salesTargets.reduce((s, t) => s + t.projectCount, 0)
  const avgProfitRate = salesTargets.reduce((s, t) => s + t.actualProfitRate, 0) / salesTargets.length
  const completionRate = totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0
  const completionTrend = getTrend(totalActual, totalPlan)

  const completionColor = (rate: number) => {
    if (rate >= 100) return COLORS.success
    if (rate >= 80) return COLORS.warning
    return COLORS.danger
  }

  const barOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    grid: { left: 60, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: salesTargets.map((s) => s.name),
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary },
    },
    yAxis: {
      type: 'value',
      max: 120,
      axisLine: { show: false },
      axisLabel: { formatter: '{value}%', color: COLORS.textTertiary },
      splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
    },
    series: [
      {
        name: '目标完成率',
        type: 'bar',
        barWidth: 40,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 13,
          fontWeight: 600,
        },
        data: salesTargets.map((s) => {
          const rate = Math.round((s.actualRevenue / s.planRevenue) * 100)
          return {
            value: rate,
            itemStyle: {
              color: completionColor(rate),
              borderRadius: [6, 6, 0, 0],
            },
          }
        }),
      },
    ],
  }

  const profitOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    legend: { data: ['计划利润率', '实际利润率'], bottom: 0, textStyle: { fontSize: 12 } },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: salesTargets.map((s) => s.name),
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { formatter: '{value}%', color: COLORS.textTertiary },
      splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
    },
    series: [
      {
        name: '计划利润率',
        type: 'bar',
        barWidth: 20,
        data: salesTargets.map(() => 25), // 计划利润率默认25%
        itemStyle: { color: COLORS.border, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '实际利润率',
        type: 'bar',
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 11,
        },
        data: salesTargets.map((s) => ({
          value: s.actualProfitRate,
          itemStyle: { color: COLORS.primary, borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  }

  const columns = [
    {
      title: '销售',
      dataIndex: 'name',
      width: 100,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{text}</span>
      ),
    },
    {
      title: '计划收入',
      dataIndex: 'planRevenue',
      width: 120,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '实际收入',
      dataIndex: 'actualRevenue',
      width: 120,
      align: 'right' as const,
      sorter: (a?: SalesTarget, b?: SalesTarget) => (a?.actualRevenue || 0) - (b?.actualRevenue || 0),
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '目标完成率',
      width: 160,
      sorter: (a?: SalesTarget, b?: SalesTarget) => {
        if (!a || !b) return 0
        return (a.actualRevenue / a.planRevenue) - (b.actualRevenue / b.planRevenue)
      },
      render: (_: unknown, record: SalesTarget) => {
        const rate = Math.round((record.actualRevenue / record.planRevenue) * 100)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={Math.min(rate, 100)}
              size="small"
              showInfo={false}
              stroke={completionColor(rate)}
              style={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: completionColor(rate), minWidth: 40 }}>
              {rate}%
            </span>
          </div>
        )
      },
    },
    {
      title: '利润率',
      width: 140,
      render: (_: unknown, record: SalesTarget) => {
        const isGood = record.actualProfitRate >= 25 // 目标25%
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 4,
              backgroundColor: isGood ? '#E8F5E9' : '#FFEBEE',
            }}
          >
            <span style={{ fontWeight: 600, color: isGood ? COLORS.success : COLORS.danger, fontSize: 13 }}>
              {record.actualProfitRate}%
            </span>
            <span style={{ fontSize: 11, color: COLORS.textTertiary, marginLeft: 4 }}>
              目标25%
            </span>
            <span style={{ color: isGood ? COLORS.success : COLORS.danger, marginLeft: 2 }}>
              {isGood ? '↑' : '↓'}
            </span>
          </div>
        )
      },
    },
    {
      title: '项目数',
      dataIndex: 'projectCount',
      width: 100,
      align: 'center' as const,
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: COLORS.primary, cursor: 'pointer' }}>
          {v} 个
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>总计划收入</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{fmtAmountShort(totalPlan)}</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>总实际收入</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.secondary }}>{fmtAmountShort(totalActual)}</div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 4 }}>
              完成率 {completionRate}%
              <span style={{ color: completionTrend.color, marginLeft: 4 }}>
                {completionTrend.icon} {completionTrend.text}
              </span>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>平均利润率</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{avgProfitRate.toFixed(1)}%</div>
          </Card>
        </Col>
        <Col span={4}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>总项目数</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>{totalProjects}</div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>目标完成率</div>
            <ReactECharts option={barOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>利润率对比</div>
            <ReactECharts option={profitOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      {/* 销售明细表 */}
      <Card style={CARD_STYLES.base} bodyStyle={{ padding: 20 }}>
        <div style={{ ...TEXT_STYLES.cardTitle, marginBottom: 16 }}>销售明细</div>
        <Table columns={columns} dataSource={salesTargets} pagination={false} size="small" rowKey="name" />
      </Card>
    </div>
  )
}
