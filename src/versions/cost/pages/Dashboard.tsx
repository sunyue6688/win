/**
 * 专注成本版 - 总览看板
 * P0: 成本总览与结构
 */
import { Card, Row, Col, Tag, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmount, calcPct, getTrend } from '../../../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES, PROGRESS_COLORS } from '../theme'

interface Props {
  overview: DepartmentOverview
}

export default function Dashboard({ overview }: Props) {
  // 利润率计算
  const profitRate = overview.actualRevenue > 0
    ? ((overview.actualRevenue - overview.totalActualCost) / overview.actualRevenue) * 100
    : 0
  const planProfitRate = overview.planRevenue > 0
    ? ((overview.planRevenue - overview.totalPlanCost) / overview.planRevenue) * 100
    : 0

  // 可变成本 = 外采 + 商务 + 其他
  const variablePlan = overview.costCategories
    .filter(c => c.category !== '内部人力')
    .reduce((s, c) => s + c.plan, 0)
  const variableActual = overview.costCategories
    .filter(c => c.category !== '内部人力')
    .reduce((s, c) => s + c.actual, 0)

  // 固定成本 = 内部人力
  const fixedActual = overview.costCategories.find(c => c.category === '内部人力')?.actual || 0

  // ============ 核心指标卡片 ============
  const totalPct = calcPct(overview.totalActualCost, overview.totalPlanCost)
  const totalTrend = getTrend(overview.totalActualCost, overview.totalPlanCost)
  const variablePct = calcPct(variableActual, variablePlan)
  const variableTrend = getTrend(variableActual, variablePlan)

  // ============ 环形图 - 成本结构 ============
  const costPieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 万 ({d}%)',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      shadowBlur: 8,
      shadowColor: 'rgba(0,0,0,0.1)',
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 12, color: COLORS.textSecondary },
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
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '48%',
        style: {
          text: fmtAmount(overview.totalActualCost),
          textAlign: 'center',
          fill: COLORS.textPrimary,
          fontSize: 20,
          fontWeight: 600,
        },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 5,
        },
        data: overview.costCategories.map((c, i) => ({
          name: c.category,
          value: Math.round(c.actual / 10000),
          itemStyle: {
            color: COLORS.chart[i],
            borderRadius: 4,
          },
        })),
      },
    ],
  }

  // ============ 收入对比柱状图 ============
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
      data: ['计划', '实际'],
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
    series: [
      {
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
          {
            value: overview.planRevenue,
            itemStyle: { color: COLORS.border, borderRadius: [6, 6, 0, 0] },
          },
          {
            value: overview.actualRevenue,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: COLORS.primary },
                  { offset: 1, color: COLORS.secondary },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          },
        ],
      },
    ],
  }

  // ============ 获取进度条渐变色 ============
  const getBarGradient = (pct: number) => {
    if (pct >= 100) return PROGRESS_COLORS.good
    if (pct >= 80) return PROGRESS_COLORS.normal
    return PROGRESS_COLORS.warning
  }

  return (
    <div>
      {/* 整体利润预警条 */}
      {profitRate < planProfitRate && (
        <div
          style={{
            backgroundColor: '#FFF4E5',
            border: '1px solid #FFE0B2',
            borderRadius: 12,
            padding: '12px 20px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            color: '#E65100',
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span>
            当前实际利润率 <strong>{profitRate.toFixed(1)}%</strong> 低于计划利润率 {planProfitRate.toFixed(1)}%，请注意成本管控
          </span>
        </div>
      )}

      {/* 核心指标卡片 */}
      <Row gutter={24}>
        {/* 总成本 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>总成本</span>
              <span style={{ fontSize: 12, color: totalTrend.color, fontWeight: 600 }}>
                {totalTrend.icon} {totalTrend.text}
              </span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.danger, marginBottom: 12 }}>
              {fmtAmount(overview.totalActualCost)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(overview.totalPlanCost)}</span>
              <span style={{ fontWeight: 600, color: totalPct > 100 ? COLORS.danger : COLORS.success }}>{totalPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(totalPct, 100)}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${getBarGradient(totalPct).from}, ${getBarGradient(totalPct).to})`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </Card>
        </Col>

        {/* 可变成本合计 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>可变成本（外采+商务+其他）</span>
              <span style={{ fontSize: 12, color: variableTrend.color, fontWeight: 600 }}>
                {variableTrend.icon} {variableTrend.text}
              </span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.warning, marginBottom: 12 }}>
              {fmtAmount(variableActual)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(variablePlan)}</span>
              <span style={{ fontWeight: 600, color: variablePct > 100 ? COLORS.danger : COLORS.success }}>{variablePct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(variablePct, 100)}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${getBarGradient(variablePct).from}, ${getBarGradient(variablePct).to})`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </Card>
        </Col>

        {/* 固定成本 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={TEXT_STYLES.caption}>固定成本（内部人力）</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.primary, marginBottom: 12 }}>
              {fmtAmount(fixedActual)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
              年度固定支出，不设限额
            </div>
          </Card>
        </Col>
      </Row>

      {/* 环形图 + 收入对比 + 利润率 */}
      <Row gutter={24}>
        {/* 成本结构环形图 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>成本结构</div>
            <ReactECharts option={costPieOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>

        {/* 收入对比柱状图 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>收入对比</div>
            <ReactECharts option={revenueBarOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>

        {/* 利润率对比 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>利润率</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: COLORS.textTertiary }}>计划利润率</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{planProfitRate.toFixed(1)}%</span>
                </div>
                <Progress percent={planProfitRate} stroke={COLORS.primary} showInfo={false} style={{ height: 10, borderRadius: 5 }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: COLORS.textTertiary }}>
                    实际利润率
                    {profitRate >= planProfitRate
                      ? <span style={{ color: COLORS.success, marginLeft: 8 }}>↑ 达标</span>
                      : <span style={{ color: COLORS.danger, marginLeft: 8 }}>↓ 未达标</span>
                    }
                  </span>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: profitRate >= planProfitRate ? COLORS.success : COLORS.danger,
                  }}>
                    {profitRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  percent={profitRate}
                  stroke={profitRate >= planProfitRate ? COLORS.success : COLORS.danger}
                  showInfo={false}
                  style={{ height: 10, borderRadius: 5 }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 成本分类明细表 */}
      <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
        <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>成本类型</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>部门总额度</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>实际金额</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>差异</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>完成率</th>
              <th style={{ width: 200, padding: '10px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {overview.costCategories.map((c, i) => {
              const isFixed = c.category === '内部人力'
              const limit = overview.departmentConfig.costCategoryLimits[c.category]
              const diff = c.actual - (isFixed ? 0 : limit)
              const rate = isFixed ? 0 : (limit > 0 ? Math.round((c.actual / limit) * 100) : 0)
              const progressColor = getBarGradient(rate)

              return (
                <tr
                  key={c.category}
                  style={{ borderBottom: `1px solid ${COLORS.divider}`, transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8,
                      borderRadius: '50%', backgroundColor: COLORS.chart[i], marginRight: 8,
                    }} />
                    {c.category}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', color: isFixed ? COLORS.textTertiary : COLORS.textSecondary }}>
                    {isFixed ? '—' : fmtAmount(limit)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 600 }}>{fmtAmount(c.actual)}</td>
                  <td style={{
                    textAlign: 'right', padding: '14px 8px',
                    color: isFixed ? COLORS.textTertiary : (diff > 0 ? COLORS.danger : COLORS.success),
                  }}>
                    {isFixed ? '—' : `${diff > 0 ? '+' : ''}${fmtAmount(diff)}`}
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                    {isFixed
                      ? <span style={{ color: COLORS.textTertiary }}>—</span>
                      : <Tag color={rate > 100 ? 'red' : rate > 90 ? 'orange' : 'green'}>{rate}%</Tag>
                    }
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    {!isFixed && (
                      <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(rate, 100)}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${progressColor.from}, ${progressColor.to})`,
                        }} />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
