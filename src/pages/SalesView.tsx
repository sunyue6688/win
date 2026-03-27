import { useMemo, useState } from 'react'
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

// 统一表头断行组件 - 移到组件外部
function TableHeader({ main, unit }: { main: string; unit: string }) {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
      <div>{main}</div>
      <div style={{ fontSize: 11, color: COLORS.textTertiary }}>({unit})</div>
    </div>
  )
}

// 创建列配置的工厂函数
function createColumns(): ColumnProps<SalesTarget>[] {
  return [
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
      title: <TableHeader main="签约金额" unit="万元" />,
      dataIndex: 'totalContractAmount',
      width: 100,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: <TableHeader main="已回款金额" unit="万元" />,
      dataIndex: 'totalReceivedPayment',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="计划成本" unit="万元" />,
      dataIndex: 'totalPlanCost',
      width: 90,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="计划交付成本" unit="万元" />,
      dataIndex: 'totalPlanDeliveryCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="实际成本" unit="万元" />,
      dataIndex: 'actualCost',
      width: 90,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="实际交付成本" unit="万元" />,
      dataIndex: 'actualDeliveryCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '交付成本占比',
      dataIndex: 'deliveryCostRatio',
      width: 110,
      align: 'right' as const,
      render: (v: number) => {
        const overLimit = v > 30  // 超过30%预警
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', borderRadius: 4, minWidth: 60,
            justifyContent: 'center',
            backgroundColor: overLimit ? COLORS.bgRed : COLORS.bgGreen,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {v.toFixed(1)}%
            </span>
          </div>
        )
      },
    },
    {
      title: <TableHeader main="贡献值" unit="万元" />,
      dataIndex: 'contributionValue',
      width: 90,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600, color: COLORS.success }}>{v.toFixed(2)}</span>,
    },
  ]
}

export default function SalesView({ salesTargets, projects = [] }: Props) {
  const [chartView, setChartView] = useState<'treemap' | 'sunburst'>('treemap')

  // V8 KPI 计算
  const totalContractAmount = salesTargets.reduce((s, t) => s + t.totalContractAmount, 0)
  const totalReceivedPayment = salesTargets.reduce((s, t) => s + t.totalReceivedPayment, 0)
  const overallPaymentRate = totalContractAmount > 0 ? Math.round((totalReceivedPayment / totalContractAmount) * 100) : 0

  // 签约项目区县分布 - 树形数据结构（区县 -> 项目）
  const districtTreeData = useMemo(() => {
    // 23个区市县 + 成都市本级 + 四川省级 = 25个
    const allDistricts = [
      '四川省级', '成都市本级',
      '高新区', '天府新区', '东部新区',
      '锦江区', '青羊区', '金牛区', '武侯区', '成华区',
      '龙泉驿区', '青白江区', '新都区', '温江区', '双流区', '郫都区', '新津区',
      '金堂县', '大邑县', '蒲江县',
      '都江堰市', '彭州市', '邛崃市', '崇州市', '简阳市',
    ]

    if (!projects || projects.length === 0) {
      // 模拟数据：成都市本级约800万（占45%），其余24个区县分享剩余55%
      // 使用确定性值替代 Math.random()
      const mockDistrictValues: Record<string, number> = {
        '成都市本级': 800,
        '四川省级': 200,
        '高新区': 125,
        '天府新区': 140,
        '锦江区': 45,
        '青羊区': 38,
        '金牛区': 52,
        '武侯区': 48,
        '成华区': 35,
        '龙泉驿区': 55,
        '青白江区': 28,
        '新都区': 42,
        '温江区': 36,
        '双流区': 58,
        '郫都区': 40,
        '新津区': 25,
        '都江堰市': 32,
        '彭州市': 30,
        '邛崃市': 22,
        '崇州市': 26,
        '金堂县': 20,
        '大邑县': 18,
        '蒲江县': 15,
        '简阳市': 35,
      }
      return allDistricts.map((district) => ({
        name: district,
        value: (mockDistrictValues[district] || 25) * 10000,
      })).sort((a, b) => b.value - a.value)
    }

    // 真实数据：按区县分组
    const districtMap = projects.reduce<Record<string, number>>((acc, p) => {
      if (!acc[p.district]) acc[p.district] = 0
      acc[p.district] += p.contractAmount
      return acc
    }, {})

    // 确保所有区县都有数据（没有的显示小金额）- 使用确定性值
    const fallbackValues: Record<string, number> = {
      '成都市本级': 150000, '四川省级': 120000, '高新区': 100000, '天府新区': 95000,
      '锦江区': 80000, '青羊区': 75000, '金牛区': 85000, '武侯区': 82000,
      '成华区': 70000, '龙泉驿区': 90000, '青白江区': 60000, '新都区': 78000,
      '温江区': 72000, '双流区': 92000, '郫都区': 76000, '新津区': 55000,
      '都江堰市': 65000, '彭州市': 62000, '邛崃市': 48000, '崇州市': 52000,
      '金堂县': 45000, '大邑县': 40000, '蒲江县': 35000, '简阳市': 68000,
    }
    return allDistricts.map((district) => ({
      name: district,
      value: districtMap[district] || fallbackValues[district] || 50000,
    })).sort((a, b) => b.value - a.value)
  }, [projects])

  // 和谐色系 - 蓝色+灰色调，低饱和度
  const harmoniousColors = [
    // 深蓝系
    '#1E3A5F', '#234B72', '#2D5A87', '#366B9C', '#407CB0',
    // 中蓝系
    '#4A8DC4', '#549ED8', '#5EAFEC', '#6BB8F0', '#78C1F4',
    // 浅蓝系
    '#85CAF8', '#92D3FC', '#9FDCFF', '#ACE5FF', '#B9EEFF',
    // 灰蓝系
    '#7C8FA4', '#8A9BB0', '#98A7BC', '#A6B3C8', '#B4BFD4',
    // 青灰系
    '#6B8E9F', '#7A9DAD', '#89ACBB', '#98BBC9', '#A7CAD7',
  ]

  // 一级数据：只有区县
  const districtFlatData = districtTreeData.map(d => ({
    name: d.name,
    value: d.value,
  }))

  // 矩形树图配置（一级）
  const treemapOption = {
    tooltip: {
      formatter: (info: { name: string; value: number }) => {
        return `${info.name}<br/>签约金额: ${(info.value / 10000).toFixed(1)}万`
      },
    },
    series: [{
      type: 'treemap',
      data: districtFlatData.map((d, i) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: harmoniousColors[i % harmoniousColors.length] },
      })),
      width: '90%',
      height: '85%',
      top: '5%',
      left: '5%',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: (info: { name: string; value: number }) => `${info.name}\n${(info.value / 10000).toFixed(1)}万`,
        fontSize: 13,
        color: '#fff',
        fontWeight: 600,
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 3,
        gapWidth: 3,
        borderRadius: 6,
      },
    }],
  }

  // 旭日图配置（一级）
  const sunburstOption = {
    tooltip: {
      formatter: (info: { name: string; value: number }) => {
        return `${info.name}<br/>签约金额: ${(info.value / 10000).toFixed(1)}万`
      },
    },
    series: [{
      type: 'sunburst',
      data: districtFlatData.map((d, i) => ({
        name: d.name,
        value: d.value,
        itemStyle: { color: harmoniousColors[i % harmoniousColors.length] },
      })),
      radius: [0, '85%'],
      center: ['50%', '50%'],
      sort: (a: { value: number }, b: { value: number }) => b.value - a.value,
      label: {
        rotate: 'tangential',
        fontSize: 12,
        color: '#fff',
        fontWeight: 600,
        formatter: (info: { name: string; value: number }) => `${info.name}`,
      },
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
    }],
  }

  const districtBarOption = chartView === 'treemap' ? treemapOption : sunburstOption

  // V8 销售明细表列
  const columns = createColumns()

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

      {/* V8 第二行：签约项目区县分布图 */}
      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
          marginBottom: SPACING.xl,
          height: 480,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <div style={TEXT_STYLES.cardTitle}>签约项目区县分布</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setChartView('treemap')}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                borderRadius: 6,
                border: `1px solid ${chartView === 'treemap' ? COLORS.primary : COLORS.border}`,
                backgroundColor: chartView === 'treemap' ? COLORS.primary : 'transparent',
                color: chartView === 'treemap' ? '#fff' : COLORS.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500,
              }}
            >
              矩形树图
            </button>
            <button
              onClick={() => setChartView('sunburst')}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                borderRadius: 6,
                border: `1px solid ${chartView === 'sunburst' ? COLORS.primary : COLORS.border}`,
                backgroundColor: chartView === 'sunburst' ? COLORS.primary : 'transparent',
                color: chartView === 'sunburst' ? '#fff' : COLORS.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 500,
              }}
            >
              旭日图
            </button>
          </div>
        </div>
        <ReactECharts
          option={districtBarOption}
          style={{ height: 380 }}
          opts={{ renderer: 'canvas' }}
        />
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
        <div style={{ marginTop: SPACING.lg, maxHeight: 500, overflow: 'auto' }}>
          <Table
            className="sales-table"
            columns={columns}
            dataSource={[
              ...salesTargets,
              { ...totalRow, isTotalRow: true } as SalesTarget & { isTotalRow: boolean },
            ]}
            pagination={false}
            size="small"
            rowKey={(record) => (record as { isTotalRow?: boolean }).isTotalRow ? '__total__' : (record as SalesTarget).name}
            onRow={(record) => {
              if ((record as { isTotalRow?: boolean }).isTotalRow) {
                return {
                  style: {
                    backgroundColor: COLORS.hover,
                    fontWeight: 600,
                    borderTop: `2px solid ${COLORS.border}`,
                    position: 'sticky',
                    bottom: 0,
                  } as React.CSSProperties,
                }
              }
              return {}
            }}
          />
        </div>
      </Card>
    </div>
  )
}
