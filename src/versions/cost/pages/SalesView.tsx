/**
 * 专注成本版 - 收入与利润概览
 * P2: 收入对比、利润趋势、项目分布
 */
import { Card, Row, Col } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmountShort, getTrend } from '../../../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../theme'

interface Props {
  overview: DepartmentOverview
}

export default function SalesView({ overview }: Props) {
  const profitRate = overview.actualRevenue > 0
    ? ((overview.actualRevenue - overview.totalActualCost) / overview.actualRevenue) * 100
    : 0
  const planProfitRate = overview.planRevenue > 0
    ? ((overview.planRevenue - overview.totalPlanCost) / overview.planRevenue) * 100
    : 0
  const revenueTrend = getTrend(overview.actualRevenue, overview.planRevenue)
  const profitTrend = getTrend(profitRate, planProfitRate)

  // 收入对比柱状图
  const revenueBarOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    grid: { left: 80, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['计划收入', '实际收入'],
      axisLine: { lineStyle: { color: COLORS.border } },
      axisLabel: { color: COLORS.textSecondary },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        formatter: (v: number) => `${(v / 10000).toFixed(0)} 万`,
        color: COLORS.textTertiary,
      },
      splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
    },
    series: [{
      type: 'bar',
      barWidth: 60,
      label: {
        show: true,
        position: 'top',
        formatter: (params: { value: number }) => `${(params.value / 10000).toFixed(0)} 万`,
        color: COLORS.textSecondary,
        fontSize: 12,
      },
      data: [
        { value: overview.planRevenue, itemStyle: { color: COLORS.border, borderRadius: [6, 6, 0, 0] } },
        {
          value: overview.actualRevenue,
          itemStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
              { offset: 0, color: COLORS.primary },
              { offset: 1, color: COLORS.secondary },
            ]},
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    }],
  }

  // 利润率对比柱状图
  const profitBarOption = {
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
      data: [`${overview.year}年度`],
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
        barWidth: 40,
        data: [planProfitRate],
        itemStyle: { color: COLORS.border, borderRadius: [6, 6, 0, 0] },
      },
      {
        name: '实际利润率',
        type: 'bar',
        barWidth: 40,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 13,
          fontWeight: 600,
        },
        data: [{
          value: profitRate,
          itemStyle: { color: profitRate >= planProfitRate ? COLORS.success : COLORS.danger, borderRadius: [6, 6, 0, 0] },
        }],
      },
    ],
  }

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={24} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>计划收入</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>{fmtAmountShort(overview.planRevenue)}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>实际收入</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.primary }}>{fmtAmountShort(overview.actualRevenue)}</div>
            <div style={{ fontSize: 12, color: revenueTrend.color, marginTop: 4, fontWeight: 600 }}>
              {revenueTrend.icon} {revenueTrend.text}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>总成本</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.danger }}>{fmtAmountShort(overview.totalActualCost)}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: COLORS.textTertiary, marginBottom: 4 }}>实际利润率</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: profitRate >= planProfitRate ? COLORS.success : COLORS.danger }}>
              {profitRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: 12, color: profitTrend.color, marginTop: 4, fontWeight: 600 }}>
              {profitTrend.icon} {profitTrend.text}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={24}>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>收入对比</div>
            <ReactECharts option={revenueBarOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>利润率对比</div>
            <ReactECharts option={profitBarOption} style={{ height: 280 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>
      </Row>

      {/* 项目分布 */}
      <Card style={CARD_STYLES.base} bodyStyle={{ padding: 20 }}>
        <div style={TEXT_STYLES.cardTitle}>项目分布</div>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: COLORS.hover, borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.textPrimary }}>{overview.projectStats.total}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>总项目数</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: COLORS.bgBlue, borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{overview.projectStats.inProgress}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>进行中</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: COLORS.bgGrey, borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#666' }}>{overview.projectStats.existing}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>存量项目</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: COLORS.bgBlue, borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{overview.projectStats.newProjects}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>新增项目</div>
            </div>
          </Col>
        </Row>

        {/* 状态分布迷你进度条 */}
        <div style={{ marginTop: 20, display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          {[
            { label: '进行中', value: overview.projectStats.inProgress, color: COLORS.primary },
            { label: '已签约', value: overview.projectStats.signed, color: COLORS.success },
            { label: '待评估', value: overview.projectStats.pending, color: COLORS.warning },
            { label: '已完成', value: overview.projectStats.completed, color: '#999' },
          ].map(item => {
            const pct = (item.value / overview.projectStats.total) * 100
            return (
              <div
                key={item.label}
                style={{ width: `${pct}%`, backgroundColor: item.color }}
                title={`${item.label}: ${item.value} (${pct.toFixed(0)}%)`}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: COLORS.textTertiary }}>
          {[
            { label: '进行中', value: overview.projectStats.inProgress, color: COLORS.primary },
            { label: '已签约', value: overview.projectStats.signed, color: COLORS.success },
            { label: '待评估', value: overview.projectStats.pending, color: COLORS.warning },
            { label: '已完成', value: overview.projectStats.completed, color: '#999' },
          ].map(item => (
            <span key={item.label}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color, marginRight: 4, verticalAlign: 'middle' }} />
              {item.label} ({item.value})
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
