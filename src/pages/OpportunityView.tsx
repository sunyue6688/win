/**
 * 商机看板
 * 包含：漏斗分析、场景分布、商机列表
 */
import { useState, useMemo } from 'react'
import { Card, Table, Tag, Input, Empty } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import { fmtAmountShort } from '../utils/format'
import { COLORS, TEXT_STYLES, SPACING, RADII, SHADOWS } from '../styles/theme'
import { useResponsiveGrid } from '../hooks/useMediaQuery'
import { useStore } from '../lib/store'

// ========== 类型 ==========

interface Opportunity {
  id: string
  seq: number
  region: string
  sales: string
  oppTotalAmount: number
  planEstimatedTotal: number
  budgetMatch: string
  budgetStatus: string
  nextStep: string
  note: string
  scenes: Record<string, string>
}

// ========== 配置 ==========

const SCENE_KEYS = [
  { key: 'scene_xingjiu', label: '新就业群体' },
  { key: 'scene_renminjianyi', label: '人民建议征集' },
  { key: 'scene_xiehui', label: '行业协会商会' },
  { key: 'scene_redian', label: '社会热点信息' },
  { key: 'scene_lianggefugai', label: '两个覆盖' },
  { key: 'scene_yizhangtu', label: '一张图' },
]

// ========== 组件 ==========

export default function OpportunityView() {
  const { opportunities: rawData, projectOpportunityMapping, projects } = useStore()
  const [searchText, setSearchText] = useState('')
  const kpiCols = useResponsiveGrid('1fr 1fr', '1fr', '1fr')

  // 如果没有数据，展示空状态或 Fallback
  const opportunities = useMemo(() => {
    return rawData.map((o, i) => ({
      id: o.id || `opp-${i}`,
      seq: o.seq || i + 1,
      region: o.region || '',
      sales: o.sales || '',
      oppTotalAmount: o.opp_total_amount || 0,
      planEstimatedTotal: o.plan_estimated_total || 0,
      budgetMatch: o.budget_match || '',
      budgetStatus: o.budget_status || '',
      nextStep: o.next_step || '',
      note: o.note || '',
      scenes: {
        scene_xingjiu: o.scene_xingjiu,
        scene_renminjianyi: o.scene_renminjianyi,
        scene_xiehui: o.scene_xiehui,
        scene_redian: o.scene_redian,
        scene_lianggefugai: o.scene_lianggefugai,
        scene_yizhangtu: o.scene_yizhangtu,
      }
    }));
  }, [rawData])

  const filtered = opportunities.filter(o =>
    !searchText ||
    o.region.includes(searchText) ||
    o.sales.includes(searchText)
  )

  // 漏斗数据
  const funnelData = useMemo(() => {
    const planTotal = opportunities.reduce((s, o) => s + o.planEstimatedTotal, 0)
    const oppTotal = opportunities.reduce((s, o) => s + o.oppTotalAmount, 0)
    
    // 关联项目总额：通过 mapping 查找
    const oppCodes = new Set(rawData.map(o => o.seq)); // 假设 mapping 用 seq 或者 code 匹配
    const projectTotal = projects
      .filter(p => {
        const mapping = projectOpportunityMapping.find(m => m.project_code === p.code || m.project_name === p.name);
        return !!mapping;
      })
      .reduce((s, p) => s + (p.contract_amount || 0), 0);

    return [
      { name: '铺排测算商机总额', value: planTotal },
      { name: '商机总额', value: oppTotal },
      { name: '关联项目总额', value: projectTotal },
    ]
  }, [opportunities, projects, projectOpportunityMapping, rawData])

  // 场景分布
  const sceneDistribution = useMemo(() => {
    return SCENE_KEYS.map(s => {
      const count = opportunities.filter(o => o.scenes[s.key] === '是').length
      return { name: s.label, value: count }
    })
  }, [opportunities])

  if (opportunities.length === 0) {
    return (
      <Card style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="请先在导入管理中上传「商机表」" />
      </Card>
    );
  }

  // 漏斗图配置
  const funnelOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 万' },
    series: [{
      type: 'funnel',
      left: '15%',
      top: 40,
      bottom: 20,
      width: '70%',
      min: 0,
      max: funnelData[0]?.value || 100,
      minSize: '20%',
      maxSize: '100%',
      sort: 'descending',
      gap: 4,
      label: {
        show: true,
        position: 'inside',
        formatter: (p: any) => `${p.name}\n${fmtAmountShort(p.value || 0)}万`,
        fontSize: 13,
        color: '#fff',
        lineHeight: 20,
      },
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: funnelData[0]?.value || 0, name: '铺排测算商机总额', itemStyle: { color: '#3B82F6' } },
        { value: funnelData[1]?.value || 0, name: '商机总额', itemStyle: { color: '#60A5FA' } },
        { value: funnelData[2]?.value || 0, name: '关联项目总额', itemStyle: { color: '#93C5FD' } },
      ],
    }],
  }

  // 场景分布图配置
  const sceneBarOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 40, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { color: COLORS.textSecondary },
      splitLine: { lineStyle: { color: COLORS.divider, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: sceneDistribution.map(s => s.name),
      axisLabel: { color: COLORS.textPrimary, fontSize: 12 },
    },
    series: [{
      type: 'bar',
      data: sceneDistribution.map(s => s.value),
      barWidth: 20,
      itemStyle: {
        color: '#3B82F6',
        borderRadius: [0, 4, 4, 0],
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c} 个',
        fontSize: 12,
        color: COLORS.textSecondary,
      },
    }],
  }

  // 商机列表列
  const columns = [
    { title: '序号', dataIndex: 'seq', width: 60, align: 'center' as const },
    {
      title: '区县',
      dataIndex: 'region',
      width: 100,
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>,
    },
    { title: '销售', dataIndex: 'sales', width: 80 },
    {
      title: '商机总额（万元）',
      dataIndex: 'oppTotalAmount',
      width: 130,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '铺排测算（万元）',
      dataIndex: 'planEstimatedTotal',
      width: 130,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '预算匹配',
      dataIndex: 'budgetMatch',
      width: 100,
      render: (v: string) => (
        <Tag color={v === '匹配' ? 'green' : 'orange'} size="small">{v}</Tag>
      ),
    },
    {
      title: '预算情况',
      dataIndex: 'budgetStatus',
      width: 100,
      render: (v: string) => (
        <Tag color={v === '已落实' ? 'blue' : 'grey'} size="small">{v}</Tag>
      ),
    },
    { title: '下一步', dataIndex: 'nextStep', width: 160 },
  ]

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: kpiCols,
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
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
          <div style={TEXT_STYLES.cardTitle}>漏斗分析</div>
          <ReactECharts
            option={funnelOption}
            style={{ height: 290 }}
            opts={{ renderer: 'svg' }}
          />
        </Card>

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
          <div style={TEXT_STYLES.cardTitle}>场景分布</div>
          <ReactECharts
            option={sceneBarOption}
            style={{ height: 290 }}
            opts={{ renderer: 'svg' }}
          />
        </Card>
      </div>

      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <div style={TEXT_STYLES.cardTitle}>商机列表</div>
          <Input
            placeholder="搜索区县或销售..."
            value={searchText}
            onChange={v => setSearchText(v)}
            style={{ width: 200 }}
            size="small"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={false}
          size="small"
          rowKey="id"
          scroll={{ y: 400 }}
        />
      </Card>
    </div>
  )
}
