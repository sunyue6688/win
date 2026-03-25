/**
 * 专注成本版 - 项目成本明细
 * P1: 项目维度 - 含存量/新增区分、成本占比预警、抽屉详情
 */
import { useState } from 'react'
import { Card, Table, Tag, Input, Row, Col, Progress, SideSheet, Radio } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project, CostRecord } from '../mockData'
import { generateCostRecords } from '../mockData'
import { fmtAmountShort } from '../../../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES } from '../theme'

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
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('全部')
  const [searchText, setSearchText] = useState('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // 全量成本记录
  const costRecords = generateCostRecords()

  // 筛选
  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === '全部' || p.status === statusFilter
    const matchType = projectTypeFilter === '全部' ||
      (projectTypeFilter === '存量' && p.projectType === '存量') ||
      (projectTypeFilter === '新增' && p.projectType === '新增')
    const matchSearch = !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.district.toLowerCase().includes(searchText.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  // 打开抽屉
  const showDetail = (project: Project) => {
    setSelectedProject(project)
    setDrawerVisible(true)
  }

  // 获取项目的成本记录
  const getProjectCostRecords = (projectId: string): CostRecord[] => {
    return costRecords.filter(r => r.projectId === projectId)
  }

  // 统计
  const statusCounts = {
    '全部': projects.length,
    '进行中': projects.filter((p) => p.status === '进行中').length,
    '已签约': projects.filter((p) => p.status === '已签约').length,
    '待评估': projects.filter((p) => p.status === '待评估').length,
    '已完成': projects.filter((p) => p.status === '已完成').length,
  }

  // 区县分布
  const districtData = projects.reduce<Record<string, { count: number; amount: number }>>((acc, p) => {
    if (!acc[p.district]) acc[p.district] = { count: 0, amount: 0 }
    acc[p.district].count++
    acc[p.district].amount += p.contractAmount
    return acc
  }, {})

  const sortedDistricts = Object.entries(districtData)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 10)
    .map(([district, data]) => ({ district, amount: data.amount }))

  const districtBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)} 万` },
    },
    yAxis: {
      type: 'category',
      data: sortedDistricts.map(d => d.district),
      axisLabel: { fontSize: 11 },
    },
    series: [{
      type: 'bar',
      data: sortedDistricts.map(d => ({
        value: d.amount,
        itemStyle: { color: COLORS.primary, borderRadius: [0, 4, 4, 0] },
      })),
      barWidth: 14,
    }],
  }

  // 表格列
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 200,
      render: (text: string, record: Project) => (
        <div>
          <div style={{ fontWeight: 600, color: COLORS.textPrimary }}>
            {text}
            <Tag
              size="small"
              color={record.projectType === '存量' ? 'grey' : 'blue'}
              style={{ marginLeft: 6 }}
            >
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
      render: (status: string) => (
        <Tag color={statusColor[status] || 'grey'} size="small">{status}</Tag>
      ),
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
        if (record.projectType === '存量') {
          return <span style={{ color: COLORS.textTertiary }}>—</span>
        }
        const ratio = record.costBreakdown
          ? record.costBreakdown.externalHR / record.contractAmount
          : 0
        const overLimit = ratio > record.externalHRRatioLimit
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 4,
            backgroundColor: overLimit ? COLORS.bgRed : 'transparent',
          }}>
            <span style={{
              fontWeight: 600, fontSize: 13,
              color: overLimit ? COLORS.danger : COLORS.textPrimary,
            }}>
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
            <span style={{ fontSize: 11, color: COLORS.textTertiary, marginLeft: 4 }}>
              目标{record.planProfitRate}%
            </span>
            <span style={{ color: isGood ? COLORS.success : COLORS.danger, marginLeft: 2 }}>
              {isGood ? '↑' : '↓'}
            </span>
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
    {
      title: '操作',
      width: 80,
      render: (_: unknown, record: Project) => (
        <a
          style={{ color: COLORS.primary, cursor: 'pointer', fontSize: 13 }}
          onClick={() => showDetail(record)}
        >
          详情
        </a>
      ),
    },
  ]

  return (
    <div>
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
            {/* 状态筛选 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>项目状态：</span>
              <Radio.Group
                type="button"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string)}
                options={Object.entries(statusCounts).map(([key, count]) => ({
                  label: `${key === '全部' ? '全部' : key} (${count})`,
                  value: key,
                }))}
              />
            </div>
            {/* 项目类型筛选 + 搜索 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>项目类型：</span>
              <Radio.Group
                type="button"
                value={projectTypeFilter}
                onChange={(e) => setProjectTypeFilter(e.target.value as string)}
                options={[
                  { label: '全部', value: '全部' },
                  { label: `存量 (${projects.filter(p => p.projectType === '存量').length})`, value: '存量' },
                  { label: `新增 (${projects.filter(p => p.projectType === '新增').length})`, value: '新增' },
                ]}
              />
              <Input
                placeholder="搜索项目名称或区县..."
                value={searchText}
                onChange={(v) => setSearchText(v)}
                style={{ width: 200, marginLeft: 'auto' }}
              />
              <span style={{ fontSize: 13, color: COLORS.textTertiary }}>
                共 {filtered.length} 个
              </span>
            </div>
          </Card>
          {/* 项目表格 */}
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 6, showSizeChanger: false }}
            size="small"
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Col>
      </Row>

      {/* 项目详情抽屉 */}
      <SideSheet
        title={selectedProject ? `${selectedProject.name} - 成本详情` : '项目详情'}
        visible={drawerVisible}
        onCancel={() => setDrawerVisible(false)}
        width={480}
        maskStyle={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        {selectedProject && (
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 20, padding: 16, backgroundColor: COLORS.hover, borderRadius: 12 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>签约金额</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>
                    {fmtAmountShort(selectedProject.contractAmount)}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>已回款</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
                    {fmtAmountShort(selectedProject.receivedPayment)}
                  </div>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>总成本</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.danger }}>
                    {fmtAmountShort(selectedProject.actualCost)}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: COLORS.textTertiary, marginBottom: 4 }}>利润率</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.success }}>
                    {selectedProject.contractAmount > 0
                      ? (((selectedProject.contractAmount - selectedProject.actualCost) / selectedProject.contractAmount) * 100).toFixed(1)
                      : '0'
                    }%
                  </div>
                </Col>
              </Row>
            </div>

            {/* 成本明细 */}
            {selectedProject.projectType === '存量' ? (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.textTertiary }}>
                存量项目成本视为沉没成本，仅展示总成本 {fmtAmountShort(selectedProject.actualCost)}
              </div>
            ) : selectedProject.costBreakdown ? (
              <div>
                <div style={TEXT_STYLES.cardTitle}>成本四大类</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: COLORS.textTertiary }}>类目</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: COLORS.textTertiary }}>金额</th>
                      <th style={{ textAlign: 'right', padding: '8px', color: COLORS.textTertiary }}>占比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '内部人力', value: selectedProject.costBreakdown.internalHR, color: COLORS.chart[0] },
                      { label: '外采人力', value: selectedProject.costBreakdown.externalHR, color: COLORS.chart[1] },
                      { label: '商务费用', value: selectedProject.costBreakdown.businessCost, color: COLORS.chart[2] },
                      { label: '其他', value: selectedProject.costBreakdown.otherCost, color: COLORS.chart[3] },
                    ].map(item => (
                      <tr key={item.label} style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            display: 'inline-block', width: 8, height: 8,
                            borderRadius: '50%', backgroundColor: item.color, marginRight: 8,
                          }} />
                          {item.label}
                        </td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 600 }}>
                          {fmtAmountShort(item.value)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', color: COLORS.textTertiary }}>
                          {selectedProject.actualCost > 0
                            ? ((item.value / selectedProject.actualCost) * 100).toFixed(1) + '%'
                            : '0%'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 外采/商务/其他 明细记录 */}
                <div style={{ marginTop: 20 }}>
                  <div style={TEXT_STYLES.cardTitle}>成本发生记录</div>
                  {getProjectCostRecords(selectedProject.id).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: COLORS.textTertiary, fontSize: 13 }}>
                      暂无明细记录
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      {getProjectCostRecords(selectedProject.id).map(record => (
                        <div key={record.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 0', borderBottom: `1px solid ${COLORS.divider}`,
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{record.costCategory}</div>
                            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
                              {record.occurDate} {record.supplier ? `· ${record.supplier}` : ''}
                            </div>
                            {record.remark && <div style={{ fontSize: 12, color: COLORS.textTertiary }}>{record.remark}</div>}
                          </div>
                          <div style={{ fontWeight: 600, color: COLORS.danger, fontSize: 13 }}>
                            {fmtAmountShort(record.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </SideSheet>
    </div>
  )
}
