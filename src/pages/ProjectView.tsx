import { useState, useMemo } from 'react'
import { Card, Table, Tag, Input, Progress, Select } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import type { Project, PMSummary } from '../mockData'
import { generatePMSummaries } from '../mockData'
import { fmtAmountShort } from '../utils/format'
import { COLORS, CARD_STYLES, TEXT_STYLES, SPACING, RADII, SHADOWS } from '../styles/theme'

import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag'
import { useResponsiveGrid } from '../hooks/useMediaQuery'

// 统一表头断行组件
function TableHeader({ main, unit }: { main: string; unit: string }) {
  return (
    <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
      <div>{main}</div>
      <div style={{ fontSize: 11, color: COLORS.textTertiary }}>({unit})</div>
    </div>
  )
}

interface Props {
  projects: Project[]
}

// V8 新状态枚举
const statusColor: Record<string, TagColor> = {
  '交付中': 'blue',
  '验收完成': 'green',
  '已验收运维中': 'cyan',
  '已结项': 'grey',
}

export default function ProjectView({ projects }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [searchText, setSearchText] = useState('')
  const [pmFilter, setPmFilter] = useState<string>('全部')
  const [salesFilter, setSalesFilter] = useState<string>('全部')
  const kpiCols = useResponsiveGrid('1fr 1fr 2fr', '1fr 1fr', '1fr')

  // PM 汇总数据
  const pmSummaries = useMemo<PMSummary[]>(() => {
    const map = new Map<string, PMSummary>();
    projects.forEach(p => {
      const existing = map.get(p.pm) || {
        pm: p.pm,
        projectCount: 0,
        totalContractAmount: 0,
        totalReceivedPayment: 0,
        totalPlanCost: 0,
        totalPlanDeliveryCost: 0,
        totalPlanBusinessCost: 0,
        actualCost: 0,
        actualDeliveryCost: 0,
        deliveryCostRatio: 0,
        deliveryCostProgress: 0,
        contributionValue: 0
      };
      existing.projectCount += 1;
      existing.totalContractAmount += p.contractAmount;
      existing.totalReceivedPayment += p.receivedPayment;
      existing.totalPlanCost += p.totalPlanCost;
      existing.totalPlanDeliveryCost += p.totalPlanDeliveryCost;
      existing.totalPlanBusinessCost += p.totalPlanBusinessCost;
      existing.actualCost += p.actualCost;
      existing.actualDeliveryCost += p.actualDeliveryCost;
      map.set(p.pm, existing);
    });

    return Array.from(map.values()).map(s => ({
      ...s,
      deliveryCostRatio: s.actualCost > 0 ? (s.actualDeliveryCost / s.actualCost) * 100 : 0,
      deliveryCostProgress: s.totalPlanDeliveryCost > 0 ? (s.actualDeliveryCost / s.totalPlanDeliveryCost) * 100 : 0,
      contributionValue: s.totalContractAmount - s.actualCost
    }));
  }, [projects])

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

  // V8 新增项目状态细分
  const newDelivering = projects.filter(p => p.projectType === '新增' && p.status === '交付中').length
  const newAcceptanceDone = projects.filter(p => p.projectType === '新增' && p.status === '验收完成').length
  const newMaintenance = projects.filter(p => p.projectType === '新增' && p.status === '已验收运维中').length
  const newClosed = projects.filter(p => p.projectType === '新增' && p.status === '已结项').length

  // V8 PM 列表列 - 扩充字段
  const pmColumns = [
    {
      title: '项目经理',
      dataIndex: 'pm',
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
      width: 110,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: <TableHeader main="已回款金额" unit="万元" />,
      dataIndex: 'totalReceivedPayment',
      width: 110,
      align: 'right' as const,
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: <TableHeader main="计划成本" unit="万元" />,
      dataIndex: 'totalPlanCost',
      width: 100,
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
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="实际交付成本" unit="万元" />,
      dataIndex: 'actualDeliveryCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 500 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '交付成本占比',
      width: 110,
      render: (_: unknown, record: PMSummary & { isTotalRow?: boolean }) => {
        const overLimit = record.deliveryCostRatio > 30
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', borderRadius: 4, minWidth: 60,
            justifyContent: 'center',
            backgroundColor: overLimit ? COLORS.bgRed : COLORS.bgGreen,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {record.deliveryCostRatio.toFixed(1)}%
            </span>
            {overLimit && !record.isTotalRow && <AlertIconSmall />}
          </div>
        )
      },
    },
    {
      title: '整体交付效率',
      width: 100,
      render: (_: unknown, record: PMSummary & { isTotalRow?: boolean }) => {
        const eff = record.deliveryCostProgress
        const overLimit = eff > 100
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {eff.toFixed(1)}%
            </span>
            {overLimit && !record.isTotalRow && <AlertIconSmall />}
          </div>
        )
      },
    },
    {
      title: '贡献值',
      dataIndex: 'contributionValue',
      width: 90,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600, color: COLORS.success }}>{v.toFixed(2)}</span>,
    },
  ]

  // V8 项目列表列 - 字段调整
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      width: 180,
      render: (text: string, record: Project & { isTotalRow?: boolean }) => {
        if (record.isTotalRow) {
          return <span style={{ fontWeight: 600 }}>{text}</span>
        }
        return (
          <div>
            <div style={{ fontWeight: 600, color: COLORS.textPrimary }}>
              {text}
              <Tag size="small" color={record.projectType === '存量' ? 'grey' : 'blue'} style={{ marginLeft: 6 }}>
                {record.projectType}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary }}>{record.district}</div>
          </div>
        )
      },
    },
    {
      title: '项目状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record: Project & { isTotalRow?: boolean }) => {
        if (record.isTotalRow) return null
        return <Tag color={statusColor[status] || 'grey'} size="small">{status}</Tag>
      },
    },
    {
      title: <TableHeader main="签约总金额" unit="万元" />,
      dataIndex: 'contractAmount',
      width: 110,
      align: 'right' as const,
      sorter: (a?: Project, b?: Project) => (a?.contractAmount || 0) - (b?.contractAmount || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: <TableHeader main="已回款金额" unit="万元" />,
      dataIndex: 'receivedPayment',
      width: 110,
      align: 'right' as const,
      sorter: (a?: Project, b?: Project) => (a?.receivedPayment || 0) - (b?.receivedPayment || 0),
      render: (v: number) => fmtAmountShort(v),
    },
    {
      title: <TableHeader main="总计划成本" unit="万元" />,
      dataIndex: 'totalPlanCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="总计划交付成本" unit="万元" />,
      dataIndex: 'totalPlanDeliveryCost',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="实际总成本" unit="万元" />,
      dataIndex: 'actualCost',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: <TableHeader main="实际交付成本" unit="万元" />,
      dataIndex: 'actualDeliveryCost',
      width: 120,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 500 }}>{fmtAmountShort(v)}</span>,
    },
    {
      title: '交付成本占比',
      width: 110,
      render: (_: unknown, record: Project & { isTotalRow?: boolean }) => {
        const ratio = record.deliveryCostRatio
        const overLimit = ratio > (record.externalHRRatioLimit || 30)
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', borderRadius: 4, minWidth: 60,
            justifyContent: 'center',
            backgroundColor: overLimit ? COLORS.bgRed : COLORS.bgGreen,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {ratio.toFixed(1)}%
            </span>
            {overLimit && !record.isTotalRow && <AlertIconSmall />}
          </div>
        )
      },
    },
    {
      title: '交付成本消耗进度',
      width: 120,
      render: (_: unknown, record: Project & { isTotalRow?: boolean }) => {
        const progress = record.deliveryCostProgress
        const overLimit = progress > 100
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 6px', borderRadius: 4, minWidth: 60,
            justifyContent: 'center',
            backgroundColor: overLimit ? COLORS.bgRed : COLORS.bgGreen,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: overLimit ? COLORS.danger : COLORS.success }}>
              {progress.toFixed(1)}%
            </span>
            {overLimit && !record.isTotalRow && <AlertIconSmall />}
          </div>
        )
      },
    },
    {
      title: '项目进度',
      dataIndex: 'progress',
      width: 100,
      render: (v: number, record: Project & { isTotalRow?: boolean }) => {
        // 预警：交付成本消耗进度 > 项目进度
        const warning = !record.isTotalRow && record.deliveryCostProgress > v
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={Math.round(v)} showInfo={false} size="small"
              stroke={warning ? COLORS.danger : COLORS.primary} style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: warning ? COLORS.danger : COLORS.textTertiary, minWidth: 36 }}>
              {Math.round(v)}%
            </span>
            {warning && <AlertIconSmall />}
          </div>
        )
      },
    },
  ]

  // 预警图标组件
  function AlertIconSmall() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill={COLORS.danger} />
        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0 0 1 0" stroke={COLORS.danger} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  // V8 状态统计
  const statusCounts = {
    '全部': projects.length,
    '交付中': projects.filter((p) => p.status === '交付中').length,
    '验收完成': projects.filter((p) => p.status === '验收完成').length,
    '已验收运维中': projects.filter((p) => p.status === '已验收运维中').length,
    '已结项': projects.filter((p) => p.status === '已结项').length,
  }

  // PM 表格总计数据
  const pmTotals = useMemo(() => {
    const data = pmSummaries
    const totalActualCost = data.reduce((s, r) => s + r.actualCost, 0)
    const totalActualDeliveryCost = data.reduce((s, r) => s + r.actualDeliveryCost, 0)
    const totalPlanDeliveryCost = data.reduce((s, r) => s + r.totalPlanDeliveryCost, 0)
    return {
      projectCount: data.reduce((s, r) => s + r.projectCount, 0),
      totalContractAmount: data.reduce((s, r) => s + r.totalContractAmount, 0),
      totalReceivedPayment: data.reduce((s, r) => s + r.totalReceivedPayment, 0),
      totalPlanCost: data.reduce((s, r) => s + r.totalPlanCost, 0),
      totalPlanDeliveryCost,
      actualCost: totalActualCost,
      actualDeliveryCost: totalActualDeliveryCost,
      deliveryCostRatio: totalActualCost > 0 ? Math.round((totalActualDeliveryCost / totalActualCost) * 100 * 10) / 10 : 0,
      deliveryCostProgress: totalPlanDeliveryCost > 0 ? Math.round((totalActualDeliveryCost / totalPlanDeliveryCost) * 100 * 10) / 10 : 0,
      contributionValue: data.reduce((s, r) => s + r.contributionValue, 0),
    }
  }, [pmSummaries])

  // 项目表格总计数据（基于筛选后的数据）
  const projectTotals = useMemo(() => {
    const contractAmount = filtered.reduce((s, p) => s + p.contractAmount, 0)
    const receivedPayment = filtered.reduce((s, p) => s + p.receivedPayment, 0)
    const totalPlanCost = filtered.reduce((s, p) => s + p.totalPlanCost, 0)
    const totalPlanDeliveryCost = filtered.reduce((s, p) => s + p.totalPlanDeliveryCost, 0)
    const totalPlanBusinessCost = filtered.reduce((s, p) => s + p.totalPlanBusinessCost, 0)
    const actualCost = filtered.reduce((s, p) => s + p.actualCost, 0)
    const actualDeliveryCost = filtered.reduce((s, p) => s + p.actualDeliveryCost, 0)
    const deliveryCostRatio = actualCost > 0 ? Math.round((actualDeliveryCost / actualCost) * 100 * 10) / 10 : 0
    const deliveryCostProgress = totalPlanDeliveryCost > 0 ? Math.round((actualDeliveryCost / totalPlanDeliveryCost) * 100 * 10) / 10 : 0
    const progress = filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.progress, 0) / filtered.length) : 0
    return {
      contractAmount, receivedPayment, totalPlanCost, totalPlanDeliveryCost, totalPlanBusinessCost,
      actualCost, actualDeliveryCost, deliveryCostRatio, deliveryCostProgress, progress,
    }
  }, [filtered])

  return (
    <div>
      {/* 第一块：项目分布看板 - V8 三张 KPI 卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: kpiCols,
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
        {/* 总项目数 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: RADII.card,
          padding: SPACING.xl,
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
          borderTop: `3px solid ${COLORS.primary}`,
        }}>
          <div style={TEXT_STYLES.label}>项目总数</div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.primary }}>{totalProjects}</div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 4 }}>个项目</div>
          </div>
        </div>

        {/* 存量项目 */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: RADII.card,
          padding: SPACING.xl,
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
          borderTop: `3px solid ${COLORS.textSecondary}`,
        }}>
          <div style={TEXT_STYLES.label}>存量项目</div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.textSecondary }}>{existingProjects}</div>
            <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 4 }}>个项目</div>
          </div>
        </div>

        {/* 新增项目（含状态细分） */}
        <div style={{
          backgroundColor: COLORS.card,
          borderRadius: RADII.card,
          padding: SPACING.xl,
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
          borderTop: `3px solid ${COLORS.success}`,
        }}>
          <div style={TEXT_STYLES.label}>新增项目</div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.success }}>{newProjects}</div>
              <div style={{ fontSize: 12, color: COLORS.textTertiary, marginTop: 4 }}>个项目</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: COLORS.textTertiary }}>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: COLORS.chartPrimary, marginRight: 4 }} />交付中 {newDelivering}</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: COLORS.success, marginRight: 4 }} />验收 {newAcceptanceDone}</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: COLORS.chartTertiary, marginRight: 4 }} />运维 {newMaintenance}</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, backgroundColor: COLORS.textTertiary, marginRight: 4 }} />结项 {newClosed}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params: { name: string; value: number }[]) => {
                      return params.map(p => `${p.name}: ${p.value}个`).join('<br/>')
                    },
                  },
                  grid: { left: 8, right: 8, top: 24, bottom: 32 },
                  xAxis: {
                    type: 'category',
                    data: ['交付中', '验收完成', '运维中', '已结项'],
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { fontSize: 10, color: COLORS.textTertiary, interval: 0 },
                  },
                  yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { show: false },
                    splitLine: { show: false },
                  },
                  series: [{
                    type: 'bar',
                    data: [
                      { value: newDelivering, itemStyle: { color: COLORS.chartPrimary, borderRadius: [3, 3, 0, 0] } },
                      { value: newAcceptanceDone, itemStyle: { color: COLORS.success, borderRadius: [3, 3, 0, 0] } },
                      { value: newMaintenance, itemStyle: { color: COLORS.chartTertiary, borderRadius: [3, 3, 0, 0] } },
                      { value: newClosed, itemStyle: { color: COLORS.textTertiary, borderRadius: [3, 3, 0, 0] } },
                    ],
                    barWidth: 20,
                    label: {
                      show: true,
                      position: 'top',
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      distance: 4,
                    },
                  }],
                }}
                style={{ height: 110, width: 220 }}
                opts={{ renderer: 'svg' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 第二块：项目经理列表（全宽，删除区县分布图） */}
      <Card
        style={{
          borderRadius: RADII.card,
          backgroundColor: COLORS.card,
          boxShadow: SHADOWS.card,
          border: `1px solid ${COLORS.border}`,
          marginBottom: SPACING.xl,
        }}
        bodyStyle={{ padding: SPACING.xl }}
      >
        <div style={TEXT_STYLES.cardTitle}>项目经理列表</div>
        {/* 表格滚动容器 - 合计行作为数据的一部分 */}
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Table
            className="pm-table"
            columns={pmColumns}
            dataSource={[
              ...pmSummaries,
              {
                pm: '合计',
                projectCount: pmTotals.projectCount,
                totalContractAmount: pmTotals.totalContractAmount,
                totalReceivedPayment: pmTotals.totalReceivedPayment,
                totalPlanCost: pmTotals.totalPlanCost,
                totalPlanDeliveryCost: pmTotals.totalPlanDeliveryCost,
                actualCost: pmTotals.actualCost,
                actualDeliveryCost: pmTotals.actualDeliveryCost,
                deliveryCostRatio: pmTotals.deliveryCostRatio,
                deliveryCostProgress: pmTotals.deliveryCostProgress,
                contributionValue: pmTotals.contributionValue,
                isTotalRow: true,
              } as PMSummary & { isTotalRow: boolean },
            ]}
            pagination={false}
            size="small"
            rowKey={(record) => (record as { isTotalRow?: boolean }).isTotalRow ? '__total__' : (record as PMSummary).pm}
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
                };
              }
              return {};
            }}
          />
        </div>
      </Card>

      {/* 第三块：项目列表卡片（全宽） */}
      <Card style={{ ...CARD_STYLES.base, marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
        <div style={TEXT_STYLES.cardTitle}>项目列表</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <span style={{ fontSize: 14, color: COLORS.textSecondary }}>状态：</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['全部', '交付中', '验收完成', '已验收运维中', '已结项'] as const).map((key) => (
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
            className="project-table"
            scroll={{ y: 400 }}
            columns={columns}
            dataSource={[
              ...filtered,
              {
                id: '__total__',
                name: `合计（${filtered.length}个项目）`,
                district: '',
                status: '已结项' as const,
                projectType: '存量' as const,
                pm: '',
                sales: '',
                contractAmount: projectTotals.contractAmount,
                receivedPayment: projectTotals.receivedPayment,
                totalPlanCost: projectTotals.totalPlanCost,
                totalPlanDeliveryCost: projectTotals.totalPlanDeliveryCost,
                totalPlanBusinessCost: projectTotals.totalPlanBusinessCost,
                actualCost: projectTotals.actualCost,
                actualDeliveryCost: projectTotals.actualDeliveryCost,
                deliveryCostRatio: projectTotals.deliveryCostRatio,
                deliveryCostProgress: projectTotals.deliveryCostProgress,
                progress: projectTotals.progress,
                planProfitRate: 0,
                externalHRRatioLimit: 30,
                isTotalRow: true,
              } as Project & { isTotalRow: boolean },
            ]}
            pagination={false}
            size="small"
            rowKey={(record) => (record as { isTotalRow?: boolean }).isTotalRow ? '__total__' : (record as Project).id}
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
