import { useState } from 'react'
import { Card, Table, Tag, Input, Row, Col, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project } from '../mockData'
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

  // 筛选
  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === '全部' || p.status === statusFilter
    const matchSearch = !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.district.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchSearch
  })

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
      district,
      amount: data.amount,
      isTop3: i < 3,
    }))

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 20, bottom: 20 },
    xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)} 万` } },
    yAxis: {
      type: 'category',
      data: sortedDistricts.map((d) => d.isTop3 ? `🏆 ${d.district}` : d.district),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: sortedDistricts.map((d) => ({
        value: d.amount,
        itemStyle: { color: d.isTop3 ? '#FAC858' : COLORS.primary, borderRadius: [0, 4, 4, 0] },
      })),
      barWidth: 16,
    }],
  }

  // 项目列表列（复用 cost 版列定义）
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
      {/* TODO: Task 4 将完全重写此页面，增加分布看板、PM 列表、筛选项 */}

      {/* 区县分布图 + 筛选区 */}
      <Row gutter={16}>
        <Col span={10}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, height: 400 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>区县项目金额分布（前10）</div>
            <ReactECharts option={districtBarOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col span={14}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>项目状态：</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['全部', '进行中', '已签约', '待评估', '已完成'] as const).map((key) => (
                  <Tag key={key} color={statusFilter === key ? 'blue' : 'grey'}
                    style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(key)}>
                    {key} ({statusCounts[key]})
                  </Tag>
                ))}
              </div>
              <Input placeholder="搜索项目名称或区县..." value={searchText}
                onChange={(v) => setSearchText(v)} style={{ width: 200, marginLeft: 12 }} />
              <span style={{ fontSize: 13, color: COLORS.textTertiary, marginLeft: 'auto' }}>
                共 {filtered.length} 个
              </span>
            </div>
          </Card>
          <Table columns={columns} dataSource={filtered}
            pagination={{ pageSize: 6, showSizeChanger: false }} size="small" rowKey="id" scroll={{ x: 1200 }} />
        </Col>
      </Row>
    </div>
  )
}
