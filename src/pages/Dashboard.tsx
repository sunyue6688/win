import { Card, Row, Col, Tag, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmount, calcPct, getTrend } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES, PROGRESS_COLORS } from '../styles/theme'

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

  // 可变成本 = 外采 + 商务 + 其他（排除内部人力）
  const variableActual = overview.costCategories
    .filter(c => c.category !== '内部人力')
    .reduce((s, c) => s + c.actual, 0)
  const variablePlan = overview.costCategories
    .filter(c => c.category !== '内部人力')
    .reduce((s, c) => s + c.plan, 0)
  const fixedActual = overview.costCategories.find(c => c.category === '内部人力')?.actual || 0

  // 趋势
  const totalPct = calcPct(overview.totalActualCost, overview.totalPlanCost)
  const totalTrend = getTrend(overview.totalActualCost, overview.totalPlanCost)
  const revenueTrend = getTrend(overview.actualRevenue, overview.planRevenue)

  const getBarGradient = (pct: number, isOverCost: boolean = false) => {
    if (isOverCost || pct > 100) return { from: '#E11D48', to: '#FB7185' }
    if (pct >= 80) return PROGRESS_COLORS.normal
    return PROGRESS_COLORS.warning
  }

  // 环形图 — 直接显示百分比和金额
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

  // 判断是否超出成本
  const isOverCost = totalPct > 100

  return (
    <div>
      {/* 第一行：警示横幅 */}
      <div style={{
        backgroundColor: '#FFEBEE',
        border: '1px solid #FECACA',
        borderRadius: 8,
        padding: '12px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
        color: '#E11D48',
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span>当前有3个项目外采成本即将超出外采成本线，请关注</span>
      </div>

      {/* 第二行：4个KPI卡片等宽等高 */}
      <Row gutter={24} style={{ marginBottom: 16 }}>
        {/* 年度收入 */}
        <Col span={6}>
          <Card style={{ ...CARD_STYLES.base, height: '100%', minHeight: 120 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>年度收入</span>
              <span style={{ fontSize: 12, color: revenueTrend.color, fontWeight: 600 }}>{revenueTrend.icon} {revenueTrend.text}</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.primary, marginBottom: 12 }}>
              {fmtAmount(overview.actualRevenue)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(overview.planRevenue)}</span>
              <span>{calcPct(overview.actualRevenue, overview.planRevenue)}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(calcPct(overview.actualRevenue, overview.planRevenue), 100)}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`, transition: 'width 0.3s ease',
              }} />
            </div>
          </Card>
        </Col>

        {/* 年度成本（突出显示） */}
        <Col span={6}>
          <Card style={{ ...CARD_STYLES.base, height: '100%', minHeight: 120, borderLeft: '4px solid #E11D48' }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>年度成本</span>
              <span style={{ fontSize: 12, color: totalTrend.color, fontWeight: 600 }}>{totalTrend.icon} {totalTrend.text}</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: isOverCost ? '#E11D48' : COLORS.danger, marginBottom: 12 }}>
              {fmtAmount(overview.totalActualCost)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(overview.totalPlanCost)}</span>
              <span style={{ fontWeight: 600, color: isOverCost ? '#E11D48' : COLORS.success }}>{totalPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: isOverCost ? '#FFE4E6' : COLORS.danger + '30', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(totalPct, 100)}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${isOverCost ? '#E11D48' : COLORS.danger}, ${isOverCost ? '#FB7185' : COLORS.danger}cc)`, transition: 'width 0.3s ease',
              }} />
            </div>
          </Card>
        </Col>

        {/* 年度利润 */}
        <Col span={6}>
          <Card style={{ ...CARD_STYLES.base, height: '100%', minHeight: 120 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}><span style={TEXT_STYLES.caption}>年度利润</span></div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.secondary, marginBottom: 12 }}>
              {fmtAmount(overview.actualRevenue - overview.totalActualCost)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
              收入 {fmtAmount(overview.actualRevenue)} - 成本 {fmtAmount(overview.totalActualCost)}
            </div>
          </Card>
        </Col>

        {/* 年度利润率 */}
        <Col span={6}>
          <Card style={{ ...CARD_STYLES.base, height: '100%', minHeight: 120 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>年度利润率</span>
              {profitRate >= planProfitRate
                ? <span style={{ fontSize: 12, color: COLORS.success, fontWeight: 600 }}>↑ 达标</span>
                : <span style={{ fontSize: 12, color: '#E11D48', fontWeight: 600 }}>↓ 未达标</span>
              }
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: profitRate >= planProfitRate ? COLORS.success : '#E11D48', marginBottom: 8 }}>
              {profitRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 8 }}>
              计划利润率 {planProfitRate.toFixed(1)}%
            </div>
            <Progress
              percent={profitRate}
              stroke={profitRate >= planProfitRate ? COLORS.success : '#E11D48'}
              showInfo={false}
              style={{ height: 8, borderRadius: 4 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 第三行：1:2比例等高 - 成本结构饼图 + 成本分类明细表格 */}
      <Row gutter={24}>
        {/* 左侧：成本结构饼图 */}
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, minHeight: 320 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>成本结构</div>
            <ReactECharts option={costPieOption} style={{ height: 260 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>

        {/* 右侧：成本分类明细表格 */}
        <Col span={16}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, minHeight: 320 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
            <div style={{ overflow: 'auto', height: 280, marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${COLORS.border}`, position: 'sticky', top: 0, background: '#F9FAFB' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>成本类型</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>计划金额（万元）</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>实际金额（万元）</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>剩余金额（万元）</th>
                    <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>已使用占比</th>
                    <th style={{ width: 200, padding: '10px 8px', whiteSpace: 'nowrap' }}></th>
                    <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500, whiteSpace: 'nowrap' }}>推测预警</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.costCategories.map((c, i) => {
                    const remaining = c.plan - c.actual
                    const usagePct = c.plan > 0 ? Math.round((c.actual / c.plan) * 100) : 0
                    const isOverCategoryCost = usagePct > 100
                    const progressGradient = getBarGradient(usagePct, isOverCategoryCost)

                    return (
                      <tr key={c.category} style={{ borderBottom: `1px solid ${COLORS.divider}`, transition: 'background-color 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '14px 8px' }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.chart[i], marginRight: 8 }} />
                          {c.category}
                        </td>
                        <td style={{ textAlign: 'right', padding: '14px 8px' }}>{(c.plan / 10000).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 600, color: isOverCategoryCost ? '#E11D48' : COLORS.textPrimary }}>
                          {(c.actual / 10000).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '14px 8px', color: remaining >= 0 ? COLORS.success : '#E11D48' }}>
                          {(remaining / 10000).toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                          <Tag color={isOverCategoryCost ? 'red' : usagePct > 90 ? 'orange' : 'green'}>{usagePct}%</Tag>
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ height: 8, borderRadius: 4, backgroundColor: isOverCategoryCost ? '#FFE4E6' : COLORS.border, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(usagePct, 100)}%`, height: '100%', borderRadius: 4,
                              background: `linear-gradient(90deg, ${progressGradient.from}, ${progressGradient.to})`,
                            }} />
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '14px 8px', color: COLORS.textTertiary }}>—</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
