import { useState } from 'react'
import { Card, Table, Tag, Input, Row, Col, Progress } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project } from '../mockData'
import { fmtAmountShort } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../styles/theme'

import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag'

interface Props {
  projects: Project[]
  userRole?: 'boss' | 'pm' | 'sales'
}

const statusColor: Record<string, TagColor> = {
  '进行中': 'blue',
  '已签约': 'green',
  '待评估': 'orange',
  '已完成': 'grey',
}

export default function ProjectView({ projects }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')

  // 根据状态和搜索过滤
  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSearch = !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.district.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchSearch
  })

  // 统计各区县金额
  const districtData = projects.reduce<Record<string, { count: number; amount: number }>>((acc, p) => {
    if (!acc[p.district]) acc[p.district] = { count: 0, amount: 0 }
    acc[p.district].count++
    acc[p.district].amount += p.actualAmount
    return acc
  }, {})

  const sortedDistricts = Object.entries(districtData)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 12)
    .map(([district, data], i) => ({
      district,
      amount: data.amount,
      isTop3: i < 3,
    }))

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)} 万` },
    },
    yAxis: {
      type: 'category',
      data: sortedDistricts.map((d) => d.isTop3 ? `🏆 ${d.district}` : d.district),
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: sortedDistricts.map((d) => ({
          value: d.amount,
          itemStyle: {
            color: d.isTop3 ? '#FAC858' : COLORS.primary,
            borderRadius: [0, 4, 4, 0],
          },
        })),
        barWidth: 16,
      },
    ],
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 200,
      render: (text: string, record: Project) => (
        <div>
          <div style={{ fontWeight: 600, color: COLORS.textPrimary }}>{text}</div>
          <div style={{ fontSize: 12, color: COLORS.textTertiary }}>{record.district}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColor[status] || 'grey'} size="small">{status}</Tag>
      ),
    },
    {
      title: '签约金额',
      dataIndex: 'actualAmount',
      width: 120,
      sorter: (a?: Project, b?: Project) => (a?.actualAmount || 0) - (b?.actualAmount || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '成本',
      dataIndex: 'actualCost',
      width: 100,
      sorter: (a?: Project, b?: Project) => (a?.actualCost || 0) - (b?.actualCost || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: '利润率',
      width: 140,
      sorter: (a?: Project, b?: Project) => {
        if (!a || !b) return 0
        const rA = ((a.actualAmount - a.actualCost) / a.actualAmount) * 100
        const rB = ((b.actualAmount - b.actualCost) / b.actualAmount) * 100
        return rA - rB
      },
      render: (_: unknown, record: Project) => {
        const rate = ((record.actualAmount - record.actualCost) / record.actualAmount) * 100
        const isGood = rate >= record.costLimitPercent
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 12px',
              borderRadius: 4,
              backgroundColor: isGood ? '#E8F5E9' : '#FFEBEE',
            }}
          >
            <span style={{ fontWeight: 600, color: isGood ? COLORS.success : COLORS.danger, fontSize: 13 }}>
              {rate.toFixed(1)}%
            </span>
            <span style={{ fontSize: 11, color: COLORS.textTertiary }}>
              {isGood ? '↑' : '↓'} 目标{record.costLimitPercent}%
            </span>
          </div>
        )
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 140,
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress percent={v} showInfo={false} size="small" stroke={COLORS.primary} style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: COLORS.textTertiary, minWidth: 36 }}>{v}%</span>
        </div>
      ),
    },
    {
      title: '预估总成本',
      width: 130,
      render: (_: unknown, record: Project) => {
        const showWarning = record.estimatedTotalCost > record.actualCost * 1.2
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 600 }}>{fmtAmountShort(record.estimatedTotalCost)}</span>
            {showWarning && <span style={{ fontSize: 14 }}>⚠️</span>}
          </div>
        )
      },
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
    all: projects.length,
    '进行中': projects.filter((p) => p.status === '进行中').length,
    '已签约': projects.filter((p) => p.status === '已签约').length,
    '待评估': projects.filter((p) => p.status === '待评估').length,
    '已完成': projects.filter((p) => p.status === '已完成').length,
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={10}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16, height: 460 }} bodyStyle={{ padding: 20 }}>
            <div style={TEXT_STYLES.cardTitle}>区县项目金额分布（前12）</div>
            <ReactECharts option={districtBarOption} style={{ height: 380 }} />
          </Card>
        </Col>
        <Col span={14}>
          <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>项目状态：</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['all', '进行中', '已签约', '待评估', '已完成'] as const).map((key) => (
                  <Tag
                    key={key}
                    color={statusFilter === key ? 'blue' : 'grey'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setStatusFilter(key)}
                  >
                    {key === 'all' ? '全部' : key} ({statusCounts[key]})
                  </Tag>
                ))}
              </div>
              <Input
                placeholder="搜索项目名称或区县..."
                value={searchText}
                onChange={(v) => setSearchText(v)}
                style={{ width: 200, marginLeft: 12 }}
              />
              <span style={{ fontSize: 13, color: COLORS.textTertiary, marginLeft: 'auto' }}>
                共 {filtered.length} 个项目
              </span>
            </div>
          </Card>
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            size="small"
            rowKey="id"
          />
        </Col>
      </Row>
    </div>
  )
}
