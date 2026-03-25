import { Card, Row, Col, Tag, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { DepartmentOverview } from '../mockData'
import { fmtAmount, calcPct, getTrend, getProgressColor } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../styles/theme'

interface Props {
  overview: DepartmentOverview
}

export default function Dashboard({ overview }: Props) {
  const profitRate = (overview.totalActualProfit / overview.actualRevenue) * 100
  const planProfitRate = (overview.totalPlanProfit / overview.planRevenue) * 100

  // 环形图配置 - 成本结构
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
    graphic: {
      type: 'text',
      left: 'center',
      top: '38%',
      style: {
        text: '总成本',
        textAlign: 'center',
        fill: COLORS.textTertiary,
        fontSize: 12,
      },
    },
    graphic2: {
      type: 'text',
      left: 'center',
      top: '50%',
      style: {
        text: fmtAmount(overview.totalActualCost),
        textAlign: 'center',
        fill: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: 600,
      },
    },
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

  // 柱状图配置 - 收入对比
  const revenueBarOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: COLORS.border,
      borderWidth: 1,
      borderRadius: 8,
      shadowBlur: 8,
      shadowColor: 'rgba(0,0,0,0.1)',
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

  // 核心指标卡片配置
  const statCards = [
    {
      title: '年度收入',
      plan: overview.planRevenue,
      actual: overview.actualRevenue,
      color: COLORS.primary,
    },
    {
      title: '年度成本',
      plan: overview.totalPlanCost,
      actual: overview.totalActualCost,
      color: COLORS.warning,
    },
    {
      title: '年度利润',
      plan: overview.totalPlanProfit,
      actual: overview.totalActualProfit,
      color: COLORS.secondary,
    },
  ]

  // 项目状态配置
  const statusItems = [
    { label: '进行中', value: overview.projectStats.inProgress, color: COLORS.primary },
    { label: '已签约', value: overview.projectStats.signed, color: COLORS.success },
    { label: '待评估', value: overview.projectStats.pending, color: COLORS.warning },
    { label: '已完成', value: overview.projectStats.completed, color: '#666' },
  ]

  // 利润率差异
  const profitTrend = getTrend(profitRate, planProfitRate)

  return (
    <div>
      {/* 核心指标卡片 */}
      <Row gutter={24}>
        {statCards.map((s) => {
          const pct = calcPct(s.actual, s.plan)
          const trend = getTrend(s.actual, s.plan)
          const progressColor = getProgressColor(pct)

          return (
            <Col span={8} key={s.title}>
              <Card
                style={{
                  ...CARD_STYLES.base,
                  marginBottom: 16,
                }}
                bodyStyle={{ padding: 20 }}
              >
                {/* 指标名称 */}
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={TEXT_STYLES.caption}>{s.title}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: trend.color,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {trend.icon} {trend.text}
                  </span>
                </div>

                {/* 主数值 */}
                <div style={{ ...TEXT_STYLES.valueLarge, color: s.color, marginBottom: 12 }}>
                  {fmtAmount(s.actual)}
                </div>

                {/* 对比信息 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.textTertiary, marginBottom: 12 }}>
                  <span>计划 {fmtAmount(s.plan)}</span>
                  <span style={{ color: COLORS.textSecondary, fontWeight: 500 }}>{pct}%</span>
                </div>

                {/* 进度条 - 渐变色 */}
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.border,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${progressColor.gradient?.from || progressColor.stroke}, ${progressColor.gradient?.to || progressColor.stroke})`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* 项目概况 + 收入对比 + 成本结构 */}
      <Row gutter={24}>
        <Col span={8}>
          <Card
            style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={TEXT_STYLES.cardTitle}>项目概况</div>

            {/* 状态分布 - 2x2 对称网格 */}
            <div style={{ marginTop: 20 }}>
              {/* 上排 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {statusItems.slice(0, 2).map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      background: COLORS.hover,
                      borderRadius: 12,
                      padding: '18px 16px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: item.color,
                        borderRadius: '12px 12px 0 0',
                      }}
                    />
                    <div style={{ fontSize: 30, fontWeight: 700, color: item.color, lineHeight: 1.2 }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 6 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {/* 下排 */}
              <div style={{ display: 'flex', gap: 16 }}>
                {statusItems.slice(2, 4).map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      background: COLORS.hover,
                      borderRadius: 12,
                      padding: '18px 16px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: item.color,
                        borderRadius: '12px 12px 0 0',
                      }}
                    />
                    <div style={{ fontSize: 30, fontWeight: 700, color: item.color, lineHeight: 1.2 }}>
                      {item.value}
                    </div>
                    <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 6 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 总数 */}
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: COLORS.textSecondary }}>
              共 <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{overview.projectStats.total}</span> 个项目
            </div>

            {/* 迷你进度条 - 各状态占比 */}
            <div style={{ marginTop: 16, display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
              {statusItems.map((item) => {
                const pct = (item.value / overview.projectStats.total) * 100
                return (
                  <div
                    key={item.label}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                )
              })}
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={TEXT_STYLES.cardTitle}>收入对比</div>
            <ReactECharts
              option={revenueBarOption}
              style={{ height: 220 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{ ...CARD_STYLES.base, marginBottom: 16, height: 300 }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={TEXT_STYLES.cardTitle}>成本结构</div>
            <ReactECharts
              option={{
                ...costPieOption,
                // 添加中间文字的 graphic
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
                      fontSize: 16,
                      fontWeight: 600,
                    },
                  },
                ],
              }}
              style={{ height: 220 }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 成本分类明细表 */}
      <Card
        style={{ ...CARD_STYLES.base, marginBottom: 16 }}
        bodyStyle={{ padding: 20 }}
      >
        <div style={TEXT_STYLES.cardTitle}>成本分类明细</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>成本类型</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>计划金额</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>实际金额</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>差异</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', color: COLORS.textTertiary, fontWeight: 500 }}>完成率</th>
              <th style={{ width: 200, padding: '10px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {overview.costCategories.map((c, i) => {
              const diff = c.actual - c.plan
              const rate = calcPct(c.actual, c.plan)
              const progressColor = getProgressColor(rate)

              return (
                <tr
                  key={c.category}
                  style={{
                    borderBottom: `1px solid ${COLORS.divider}`,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: COLORS.chart[i],
                        marginRight: 8,
                      }}
                    />
                    {c.category}
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 8px' }}>{fmtAmount(c.plan)}</td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', fontWeight: 600 }}>{fmtAmount(c.actual)}</td>
                  <td style={{ textAlign: 'right', padding: '14px 8px', color: diff > 0 ? COLORS.danger : COLORS.success }}>
                    {diff > 0 ? '+' : ''}{fmtAmount(diff)}
                  </td>
                  <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                    <Tag color={rate > 100 ? 'red' : rate > 90 ? 'orange' : 'green'}>{rate}%</Tag>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: COLORS.border,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(rate, 100)}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${progressColor.gradient?.from || progressColor.stroke}, ${progressColor.gradient?.to || progressColor.stroke})`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* 利润率对比 - 双进度条形式 */}
      <Card
        style={CARD_STYLES.base}
        bodyStyle={{ padding: 20 }}
      >
        <div style={TEXT_STYLES.cardTitle}>利润率对比</div>
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: COLORS.textTertiary, marginBottom: 8 }}>计划利润率</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.primary }}>
                {planProfitRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 8 }}>
                (收入 {fmtAmount(overview.planRevenue)} - 成本 {fmtAmount(overview.totalPlanCost)}) / 收入
              </div>
              <div style={{ marginTop: 16, padding: '0 20px' }}>
                <Progress
                  percent={planProfitRate}
                  stroke={COLORS.primary}
                  showInfo={false}
                  size="large"
                  style={{ height: 12, borderRadius: 6 }}
                />
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: COLORS.textTertiary, marginBottom: 8 }}>
                实际利润率
                {profitTrend.isUp ? (
                  <span style={{ color: COLORS.success, marginLeft: 8 }}>↑ 达标</span>
                ) : (
                  <span style={{ color: COLORS.danger, marginLeft: 8 }}>↓ 未达标</span>
                )}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: profitTrend.isUp ? COLORS.success : COLORS.danger }}>
                {profitRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 8 }}>
                (收入 {fmtAmount(overview.actualRevenue)} - 成本 {fmtAmount(overview.totalActualCost)}) / 收入
              </div>
              <div style={{ marginTop: 16, padding: '0 20px' }}>
                <Progress
                  percent={profitRate}
                  stroke={profitTrend.isUp ? COLORS.success : COLORS.danger}
                  showInfo={false}
                  size="large"
                  style={{ height: 12, borderRadius: 6 }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
