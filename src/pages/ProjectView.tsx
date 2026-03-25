import { useState, useMemo } from 'react'
import { Card, Table, Tag, Input, Row, Col, Progress, Select } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project, PMSummary } from '../mockData'
import { generatePMSummaries } from '../mockData'
import { fmtAmountShort } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../styles/theme'

import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag'

interface Props {
  projects: Project[]
}

const statusColor: Record<string, TagColor> = {
  '进行中': 'blue',
  '已签约': 'green',
  '待评估': 'orange',
  '已完成': 'grey',
}

export default function ProjectView({ projects }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [searchText, setSearchText] = useState('')
  const [pmFilter, setPmFilter] = useState<string>('全部')
  const [salesFilter, setSalesFilter] = useState<string>('全部')
  const [pmSearchText, setPmSearchText] = useState('')
  const [pmSelectFilter, setPmSelectFilter] = useState<string>('全部')

  // PM 汇总数据
  const pmSummaries = useMemo(() => generatePMSummaries(), [projects])

  // PM 列表筛选
  const filteredPmSummaries = useMemo(() => {
    return pmSummaries.filter((pm) => {
      const matchSearch = !pmSearchText || pm.pm.toLowerCase().includes(pmSearchText.toLowerCase())
      // 可以根据 pmSelectFilter 添加更多筛选逻辑
      return matchSearch
    })
  }, [pmSummaries, pmSearchText])

  // 获取所有 PM 和销售名
  const pmNames = useMemo(() => [...new Set(projects.map(p => p.pm))], [projects])
  const salesNames = useMemo(() => [...new Set(projects.map(p => p.sales))], [projects])

  // 筛选
  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === '全部' || p.status === statusFilter
    const matchPM = pmFilter === '全部' || p.pm === pmFilter
    const matchSales = salesFilter === '全部' || p.sales === salesFilter
    const matchSearch = !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.district.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchPM && matchSales && matchSearch
  })

  // 项目分布统计
  const totalProjects = projects.length
  const existingProjects = projects.filter(p => p.projectType === '存量').length
  const newProjects = projects.filter(p => p.projectType === '新增').length
  const newPending = projects.filter(p => p.projectType === '新增' && p.status === '待评估').length
  const newSigned = projects.filter(p => p.projectType === '新增' && p.status === '已签约').length
  const newInProgress = projects.filter(p => p.projectType === '新增' && p.status === '进行中').length
  const newCompleted = projects.filter(p => p.projectType === '新增' && p.status === '已完成').length

  // 统计各区县金额
  const districtData = projects.reduce<Record<string, { count: number; amount: number }>>((acc, p) => {
    if (!acc[p.district]) acc[p.district] = { count: 0, amount: 0 }
    acc[p.district].count++
    acc[p.district].amount += p.contractAmount
    return acc
  }, {})

  const sortedDistricts = Object.entries(districtData)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 10)
    .map(([district, data], i) => ({
      district, amount: data.amount, isTop3: i < 3,
    }))

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)} 万` } },
    yAxis: {
      type: 'category',
      data: sortedDistricts.map(d => d.isTop3 ? `🏆 ${d.district}` : d.district),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: sortedDistricts.map(d => ({
        value: d.amount,
        itemStyle: { color: d.isTop3 ? '#FAC858' : COLORS.primary, borderRadius: [0, 4, 4, 0] },
      })),
      barWidth: 16,
    }],
  }

  // PM 列表列
  const pmColumns = [
    {
      title: '项目经理',
      dataIndex: 'pm',
      width: 100,
      render: (text: string) => <span style={{ fontWeight: 600, color: COLORS.textPrimary }}>{text}</span>,
    },
    {
      title: '项目数量',
      dataIndex: 'projectCount',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '签约总金额',
      dataIndex: 'totalContractAmount',
      width: 120,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '已回款总金额',
      dataIndex: 'totalReceivedPayment',
      width: 120,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '预计成本',
      dataIndex: 'estimatedCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '预计利润（利润率）',
      width: 150,
      render: (_: unknown, record: PMSummary) => {
        const isGood = record.estimatedProfitRate >= 25
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: isGood ? COLORS.bgGreen : COLORS.bgRed,
          }}>
            <span style={{ fontWeight: 600, fontSize: 12 }}>{fmtAmountShort(record.estimatedProfit)}</span>
            <span style={{ fontWeight: 600, color: isGood ? COLORS.success : COLORS.danger, fontSize: 13 }}>
              {record.estimatedProfitRate.toFixed(1)}%
            </span>
            <span style={{ color: isGood ? COLORS.success : COLORS.danger }}>{isGood ? '↑' : '↓'}</span>
          </div>
        )
      },
    },
    {
      title: '实际消耗成本',
      dataIndex: 'actualCost',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '实际外采成本占比',
      width: 140,
      render: (_: unknown, record: PMSummary) => {
        const overLimit = record.externalHRRatio > record.externalHRRatioLimit
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: overLimit ? COLORS.bgRed : 'transparent',
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.textPrimary }}>
              {record.externalHRRatio.toFixed(1)}%
            </span>
            {overLimit && <span style={{ fontSize: 14 }}>⚠️</span>}
          </div>
        )
      },
    },
  ]

  // 项目列表列（复用 cost 版）
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 200,
      render: (text: string, record: Project) => (
        <div>
          <div style={{ fontWeight: 600, color: COLORS.textPrimary }}>
            {text}
            <Tag size="small" color={record.projectType === '存量' ? 'grey' : 'blue'} style={{ marginLeft: 6 }}>
              {record.projectType}
            </Tag>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary }}>{record.district}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: string) => <Tag color={statusColor[status] || 'grey'} size="small">{status}</Tag>,
    },
    {
      title: '签约金额',
      dataIndex: 'contractAmount',
      width: 120,
      align: 'right' as const,
      sorter: (a?: Project, b?: Project) => (a?.contractAmount || 0) - (b?.contractAmount || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '已回款',
      dataIndex: 'receivedPayment',
      width: 100,
      align: 'right' as const,
      sorter: (a?: Project, b?: Project) => (a?.receivedPayment || 0) - (b?.receivedPayment || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '总成本',
      dataIndex: 'actualCost',
      width: 100,
      align: 'right' as const,
      sorter: (a?: Project, b?: Project) => (a?.actualCost || 0) - (b?.actualCost || 0),
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '外采成本占比',
      width: 130,
      render: (_: unknown, record: Project) => {
        if (record.projectType === '存量') return <span style={{ color: COLORS.textTertiary }}>—</span>
        const ratio = record.costBreakdown ? record.costBreakdown.externalHR / record.contractAmount : 0
        const overLimit = ratio > record.externalHRRatioLimit
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: overLimit ? COLORS.bgRed : 'transparent',
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.textPrimary }}>
              {(ratio * 100).toFixed(1)}%
            </span>
            {overLimit && <span style={{ fontSize: 14 }}>⚠️</span>}
          </div>
        )
      },
    },
    {
      title: '利润率',
      width: 130,
      sorter: (a?: Project, b?: Project) => {
        if (!a || !b) return 0
        const rA = a.contractAmount > 0 ? ((a.contractAmount - a.actualCost) / a.contractAmount) * 100 : 0
        const rB = b.contractAmount > 0 ? ((b.contractAmount - b.actualCost) / b.contractAmount) * 100 : 0
        return rA - rB
      },
      render: (_: unknown, record: Project) => {
        const rate = record.contractAmount > 0
          ? ((record.contractAmount - record.actualCost) / record.contractAmount) * 100
          : 0
        const isGood = rate >= record.planProfitRate
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: isGood ? COLORS.bgGreen : COLORS.bgRed,
          }}>
            <span style={{ fontWeight: 600, color: isGood ? COLORS.success : COLORS.danger, fontSize: 13 }}>
              {rate.toFixed(1)}%
            </span>
            <span style={{ fontSize: 11, color: COLORS.textTertiary, marginLeft: 4 }}>目标{record.planProfitRate}%</span>
            <span style={{ color: isGood ? COLORS.success : COLORS.danger, marginLeft: 2 }}>{isGood ? '↑' : '↓'}</span>
          </div>
        )
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 130,
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={v} showInfo={false} size="small" stroke={COLORS.primary} style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: COLORS.textTertiary, minWidth: 36 }}>{v}%</span>
        </div>
      ),
    },
    {
      title: '销售 / 项目经理',
      width: 140,
      render: (_: unknown, record: Project) => (
        <div style={{ fontSize: 13 }}>
          <div style={{ fontWeight: 600 }}>{record.sales}</div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary }}>{record.pm || '待分配'}</div>
        </div>
      ),
    },
  ]

  const statusCounts = {
    '全部': projects.length,
    '进行中': projects.filter((p) => p.status === '进行中').length,
    '已签约': projects.filter((p) => p.status === '已签约').length,
    '待评估': projects.filter((p) => p.status === '待评估').length,
    '已完成': projects.filter((p) => p.status === '已完成').length,
  }

  return (
    <div>
      {/* 第一块：项目分布看板 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{totalProjects}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>总项目数</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#999' }}>{existingProjects}</div>
              <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>存量项目</div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={CARD_STYLES.base} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{newProjects}</div>
                <div style={{ fontSize: 13, color: COLORS.textTertiary, marginTop: 4 }}>新增项目</div>
              </div>
              <div style={{ flex: 2, paddingLeft: 24 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: COLORS.textTertiary }}>
                  <span>待评估({newPending})</span>
                  <span>已签约({newSigned})</span>
                  <span>进行中({newInProgress})</span>
                  <span>已完成({newCompleted})</span>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: COLORS.border }}>
                  {[
                    { value: newPending, color: COLORS.warning },
                    { value: newSigned, color: COLORS.success },
                    { value: newInProgress, color: COLORS.primary },
                    { value: newCompleted, color: '#999' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      width: `${newProjects > 0 ? (item.value / newProjects) * 100 : 0}%`,
                      backgroundColor: item.color,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 第二块：区县分布图 + 项目经理列表（1:1 等高双栏） */}
      <Row gutter={16}>
        <Col span={12}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, minHeight: 320 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>区县项目金额分布（前10）</div>
            <ReactECharts option={districtBarOption} style={{ height: 260 }} />
          </Card>
        </Col>
        <Col span={12}>
          {/* 项目经理列表卡片 */}
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, minHeight: 320 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>项目经理列表</div>
            {/* 筛选区 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, marginTop: 12 }}>
              <Select placeholder="筛选" value={pmSelectFilter} onChange={(v) => setPmSelectFilter(v as string)} style={{ width: 120 }} size="small">
                <Select.Option value="全部">全部</Select.Option>
                <Select.Option value="利润率达标">利润率达标</Select.Option>
                <Select.Option value="外采超标">外采超标</Select.Option>
              </Select>
              <Input placeholder="搜索项目经理" value={pmSearchText} onChange={(v) => setPmSearchText(v)} style={{ flex: 1 }} size="small" />
            </div>
            {/* 表格滚动容器 */}
            <div style={{ height: 240, overflow: 'auto' }}>
              <Table
                columns={pmColumns}
                dataSource={filteredPmSummaries}
                pagination={false}
                size="small"
                rowKey="pm"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 第三块：项目列表卡片（全宽） */}
      <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
        <div style={TEXT_STYLES.cardTitle}>项目列表</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ fontSize: 14, color: COLORS.textSecondary }}>状态：</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['全部', '进行中', '已签约', '待评估', '已完成'] as const).map((key) => (
              <Tag key={key} color={statusFilter === key ? 'blue' : 'grey'}
                style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(key)}>
                {key} ({statusCounts[key]})
              </Tag>
            ))}
          </div>
          <Select placeholder="项目经理" value={pmFilter} onChange={(v) => setPmFilter(v as string)}
            style={{ width: 120 }} size="small">
            <Select.Option value="全部">全部 PM</Select.Option>
            {pmNames.map(name => <Select.Option key={name} value={name}>{name}</Select.Option>)}
          </Select>
          <Select placeholder="销售" value={salesFilter} onChange={(v) => setSalesFilter(v as string)}
            style={{ width: 120 }} size="small">
            <Select.Option value="全部">全部销售</Select.Option>
            {salesNames.map(name => <Select.Option key={name} value={name}>{name}</Select.Option>)}
          </Select>
          <Input placeholder="搜索项目名称或区县..." value={searchText}
            onChange={(v) => setSearchText(v)} style={{ width: 200, marginLeft: 'auto' }} />
          <span style={{ fontSize: 13, color: COLORS.textTertiary }}>
            共 {filtered.length} 个
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="small"
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </div>
      </Card>
    </div>
  )
}
