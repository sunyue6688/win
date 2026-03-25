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
  const variablePct = calcPct(variableActual, variablePlan)
  const variableTrend = getTrend(variableActual, variablePlan)
  const revenueTrend = getTrend(overview.actualRevenue, overview.planRevenue)

  const getBarGradient = (pct: number) => {
    if (pct >= 100) return PROGRESS_COLORS.good
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

  // 成本分类明细表
  const renderCostTable = () => (
    <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
      <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>成本类型</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>计划金额（万元）</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>实际金额（万元）</th>
            <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>剩余金额（万元）</th>
            <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>已使用占比</th>
            <th style={{ width: 200, padding: '10px 8px' }}></th>
            <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>推测预警</th>
          </tr>
        </thead>
        <tbody>
          {overview.costCategories.map((c, i) => {
            const remaining = c.plan - c.actual
            const usagePct = c.plan > 0 ? Math.round((c.actual / c.plan) * 100) : 0
            const progressColor = getBarGradient(usagePct)

            return (
              <tr key={c.category} style={{ borderBottom: `1px solid ${COLORS.divider}`, transition: 'background-color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '14px 8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.chart[i], marginRight: 8 }} />
                  {c.category}
                </td>
                <td style={{ textAlign: 'right', padding: '14px 8px' }}>{(c.plan / 10000).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 600 }}>{(c.actual / 10000).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '14px 8px', color: remaining >= 0 ? COLORS.success : COLORS.danger }}>
                  {(remaining / 10000).toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                  <Tag color={usagePct > 100 ? 'red' : usagePct > 90 ? 'orange' : 'green'}>{usagePct}%</Tag>
                </td>
                <td style={{ padding: '14px 8px' }}>
                  <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(usagePct, 100)}%`, height: '100%', borderRadius: 4,
                      background: `linear-gradient(90deg, ${progressColor.from}, ${progressColor.to})`,
                    }} />
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '14px 8px', color: COLORS.textTertiary }}>—</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )

  return (
    <div>
      {/* 外采成本预警提示条 */}
      <div style={{
        backgroundColor: '#FFF4E5', border: '1px solid #FFE0B2', borderRadius: 12,
        padding: '12px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#E65100',
      }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span>当前有3个项目外采成本即将超出外采成本线，请关注</span>
      </div>

      {/* 第一行：年度收入 / 年度成本（突出） / 年度利润 */}
      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
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

        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, borderLeft: `4px solid ${COLORS.danger}` }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>年度成本</span>
              <span style={{ fontSize: 12, color: totalTrend.color, fontWeight: 600 }}>{totalTrend.icon} {totalTrend.text}</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.danger, marginBottom: 12 }}>
              {fmtAmount(overview.totalActualCost)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(overview.totalPlanCost)}</span>
              <span style={{ fontWeight: 600, color: totalPct > 100 ? COLORS.danger : COLORS.success }}>{totalPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.danger + '30', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(totalPct, 100)}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${COLORS.danger}, ${COLORS.danger}cc)`, transition: 'width 0.3s ease',
              }} />
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}><span style={TEXT_STYLES.caption}>年度利润</span></div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.secondary, marginBottom: 12 }}>
              {fmtAmount(overview.actualRevenue - overview.totalActualCost)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
              收入 {fmtAmount(overview.actualRevenue)} - 成本 {fmtAmount(overview.totalActualCost)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 第二行：年度利润率 */}
      <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
        <div style={TEXT_STYLES.cardTitle}>年度利润率</div>
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.textTertiary }}>计划利润率</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{planProfitRate.toFixed(1)}%</span>
            </div>
            <Progress percent={planProfitRate} stroke={COLORS.primary} showInfo={false} style={{ height: 10, borderRadius: 5 }} />
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.textTertiary }}>
                实际利润率
                {profitRate >= planProfitRate
                  ? <span style={{ color: COLORS.success, marginLeft: 8 }}>↑ 达标</span>
                  : <span style={{ color: COLORS.danger, marginLeft: 8 }}>↓ 未达标</span>
                }
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: profitRate >= planProfitRate ? COLORS.success : COLORS.danger }}>
                {profitRate.toFixed(1)}%
              </span>
            </div>
            <Progress percent={profitRate} stroke={profitRate >= planProfitRate ? COLORS.success : COLORS.danger} showInfo={false} style={{ height: 10, borderRadius: 5 }} />
          </Col>
        </Row>
      </Card>

      {/* 第三行：成本细化卡片 — 总成本 / 内部人力(灰色) / 可变成本(高亮) */}
      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={TEXT_STYLES.caption}>总成本</span>
              <span style={{ fontSize: 12, color: totalTrend.color, fontWeight: 600 }}>{totalTrend.icon} {totalTrend.text}</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.textPrimary, marginBottom: 12 }}>
              {fmtAmount(overview.totalActualCost)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(overview.totalPlanCost)}</span>
              <span style={{ fontWeight: 600 }}>{totalPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(totalPct, 100)}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${getBarGradient(totalPct).from}, ${getBarGradient(totalPct).to})`,
              }} />
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, opacity: 0.7 }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ ...TEXT_STYLES.caption, color: COLORS.textTertiary }}>内部人力（固定）</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: '#999', marginBottom: 12 }}>
              {fmtAmount(fixedActual)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
              年度固定支出，不设限额
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, borderLeft: `4px solid ${COLORS.warning}` }} bodyStyle={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...TEXT_STYLES.caption, color: COLORS.warning, fontWeight: 600 }}>可变成本（管控核心）</span>
              <span style={{ fontSize: 12, color: variableTrend.color, fontWeight: 600 }}>{variableTrend.icon} {variableTrend.text}</span>
            </div>
            <div style={{ ...TEXT_STYLES.valueLarge, color: COLORS.warning, marginBottom: 12 }}>
              {fmtAmount(variableActual)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
              <span>计划 {fmtAmount(variablePlan)}</span>
              <span style={{ fontWeight: 600, color: variablePct > 100 ? COLORS.danger : COLORS.success }}>{variablePct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.bgOrange, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(variablePct, 100)}%`, height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, ${getBarGradient(variablePct).from}, ${getBarGradient(variablePct).to})`,
              }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 第四行：环形图 */}
      <Row gutter={24}>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>成本结构</div>
            <ReactECharts option={costPieOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
          </Card>
        </Col>
        <Col span={12}>
          {renderCostTable()}
        </Col>
      </Row>
    </div>
  )
}
