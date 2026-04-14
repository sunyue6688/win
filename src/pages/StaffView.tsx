/**
 * 人员管理看板
 * 包含：人员工时总览、人员列表
 */
import { useState, useMemo } from 'react'
import { Card, Table, Tag, Input, Progress, Empty } from '@douyinfe/semi-ui'
import ReactECharts from 'echarts-for-react'
import { COLORS, TEXT_STYLES, SPACING, RADII, SHADOWS } from '../styles/theme'
import { useResponsiveGrid } from '../hooks/useMediaQuery'
import { useStore } from '../lib/store'

// ========== 类型 ==========

interface StaffMember {
  id: string
  name: string
  role: string
  department: string
  isActive: boolean
  // 工时分布
  projectHours: number
  opportunityHours: number
  departmentHours: number
  externalHours: number
  totalHours: number
}

// ========== 组件 ==========

export default function StaffView() {
  const { staff: rawStaff, projectLogs, opportunityLogs, departmentLogs } = useStore()
  const [searchText, setSearchText] = useState('')
  const kpiCols = useResponsiveGrid('1fr 1fr', '1fr', '1fr')

  const staffList = useMemo(() => {
    return rawStaff.map((s, i) => {
      const name = s.name;
      
      // 项目工时 (project_logs 中 reporter = name)
      const projH = projectLogs
        .filter(l => l.reporter === name)
        .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
        
      // 商机工时 (opportunity_logs 中 reporter = name)
      const oppH = opportunityLogs
        .filter(l => l.reporter === name)
        .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
        
      // 部门工时 (department_logs 中 reporter = name)
      const deptH = departmentLogs
        .filter(l => l.reporter === name)
        .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
        
      // 外部门工时 (暂时定义为 department_logs 中的 external_amount 对应的工时，或由逻辑决定)
      // 这里根据设计文档 §3.2，暂记为 0 or simple calc
      const extH = 0;

      return {
        id: s.id || `staff-${i}`,
        name,
        role: s.role,
        department: s.department,
        isActive: s.is_active === '是' || s.is_active === true,
        projectHours: Math.round(projH * 10) / 10,
        opportunityHours: Math.round(oppH * 10) / 10,
        departmentHours: Math.round(deptH * 10) / 10,
        externalHours: extH,
        totalHours: Math.round((projH + oppH + deptH + extH) * 10) / 10,
      };
    });
  }, [rawStaff, projectLogs, opportunityLogs, departmentLogs])

  const filtered = staffList.filter(s =>
    !searchText || s.name.includes(searchText) || s.role.includes(searchText)
  )

  const totalProjectHours = staffList.reduce((s, m) => s + m.projectHours, 0)
  const totalOppHours = staffList.reduce((s, m) => s + m.opportunityHours, 0)
  const totalDeptHours = staffList.reduce((s, m) => s + m.departmentHours, 0)
  const totalExtHours = staffList.reduce((s, m) => s + m.externalHours, 0)
  const totalAll = Math.round((totalProjectHours + totalOppHours + totalDeptHours + totalExtHours) * 10) / 10 || 1

  if (staffList.length === 0) {
    return (
      <Card style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="请先在导入管理中上传「内部人员名单」" />
      </Card>
    );
  }

  // 工时分布饼图
  const hoursPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}h ({d}%)' },
    legend: {
      bottom: 0,
      data: ['项目投入', '商机投入', '部门日志'],
      textStyle: { fontSize: 12, color: COLORS.textSecondary },
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '40%'],
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 11,
        color: COLORS.textSecondary,
      },
      data: [
        { value: totalProjectHours, name: '项目投入', itemStyle: { color: '#3B82F6' } },
        { value: totalOppHours, name: '商机投入', itemStyle: { color: '#60A5FA' } },
        { value: totalDeptHours, name: '部门日志', itemStyle: { color: '#94A3B8' } },
      ],
    }],
  }

  // 每人工时柱状图 (取前 15 名)
  const topStaff = staffList.sort((a, b) => b.totalHours - a.totalHours).slice(0, 15);
  const staffBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['项目', '商机', '部门'],
      top: 0,
      textStyle: { fontSize: 11, color: COLORS.textSecondary },
    },
    grid: { left: 80, right: 30, top: 40, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}h', color: COLORS.textSecondary, fontSize: 11 },
      splitLine: { lineStyle: { color: COLORS.divider, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: topStaff.map(s => s.name).reverse(),
      axisLabel: { color: COLORS.textPrimary, fontSize: 12 },
    },
    series: [
      {
        name: '项目',
        type: 'bar',
        stack: 'total',
        data: topStaff.map(s => s.projectHours).reverse(),
        itemStyle: { color: '#3B82F6' },
        barWidth: 14,
      },
      {
        name: '商机',
        type: 'bar',
        stack: 'total',
        data: topStaff.map(s => s.opportunityHours).reverse(),
        itemStyle: { color: '#60A5FA' },
      },
      {
        name: '部门',
        type: 'bar',
        stack: 'total',
        data: topStaff.map(s => s.departmentHours).reverse(),
        itemStyle: { color: '#94A3B8' },
      },
    ],
  }

  // 人员列表列
  const roleColors: Record<string, string> = {
    '项目经理': 'blue',
    '销售': 'green',
    '研发': 'purple',
    '运营': 'cyan',
    '售前': 'orange',
    '产品': 'teal',
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 100,
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (v: string) => (
        <Tag color={(roleColors[v] || 'grey') as any} size="small">{v}</Tag>
      ),
    },
    { title: '部门', dataIndex: 'department', width: 140 },
    {
      title: '项目投入 (h)',
      dataIndex: 'projectHours',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#3B82F6' }}>{v}</span>,
    },
    {
      title: '商机投入 (h)',
      dataIndex: 'opportunityHours',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: '#60A5FA' }}>{v}</span>,
    },
    {
      title: '部门日志 (h)',
      dataIndex: 'departmentHours',
      width: 110,
      align: 'right' as const,
      render: (v: number) => <span style={{ color: COLORS.textSecondary }}>{v}</span>,
    },
    {
      title: '总工时 (h)',
      dataIndex: 'totalHours',
      width: 100,
      align: 'right' as const,
      render: (v: number) => <span style={{ fontWeight: 700 }}>{v}</span>,
    },
    {
      title: '工时分布',
      width: 180,
      render: (_: unknown, record: StaffMember) => {
        const total = record.totalHours || 1
        const projPct = Math.round((record.projectHours / total) * 100)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Progress percent={projPct} showInfo={false} stroke="#3B82F6" style={{ flex: 1, height: 6 }} />
            <span style={{ fontSize: 11, color: COLORS.textTertiary, minWidth: 32 }}>{projPct}%</span>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
      }}>
        {[
          { label: '在职人数', value: staffList.filter(s => s.isActive).length, unit: '人', color: COLORS.primary },
          { label: '总工时', value: Math.round(totalAll), unit: 'h', color: '#3B82F6' },
          { label: '项目投入占比', value: Math.round((totalProjectHours / totalAll) * 100), unit: '%', color: COLORS.success },
          { label: '人均工时', value: Math.round(totalAll / (staffList.length || 1)), unit: 'h', color: COLORS.warning },
        ].map((kpi, i) => (
          <Card key={i} style={{ borderRadius: RADII.card, backgroundColor: COLORS.card, boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}` }} bodyStyle={{ padding: SPACING.xl }}>
            <div style={TEXT_STYLES.label}>{kpi.label}</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: kpi.color }}>
              {kpi.value}
              <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textTertiary, marginLeft: 4 }}>{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: kpiCols, gap: SPACING.lg, marginBottom: SPACING.xl }}>
        <Card style={{ borderRadius: RADII.card, backgroundColor: COLORS.card, boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`, height: 380 }} bodyStyle={{ padding: SPACING.xl }}>
          <div style={TEXT_STYLES.cardTitle}>全量工时分布</div>
          <ReactECharts option={hoursPieOption} style={{ height: 310 }} opts={{ renderer: 'svg' }} />
        </Card>

        <Card style={{ borderRadius: RADII.card, backgroundColor: COLORS.card, boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}`, height: 380 }} bodyStyle={{ padding: SPACING.xl }}>
          <div style={TEXT_STYLES.cardTitle}>人员工时排行 (Top 15)</div>
          <ReactECharts option={staffBarOption} style={{ height: 310 }} opts={{ renderer: 'svg' }} />
        </Card>
      </div>

      <Card style={{ borderRadius: RADII.card, backgroundColor: COLORS.card, boxShadow: SHADOWS.card, border: `1px solid ${COLORS.border}` }} bodyStyle={{ padding: SPACING.xl }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <div style={TEXT_STYLES.cardTitle}>人员工时明细表</div>
          <Input placeholder="搜索姓名或角色..." value={searchText} onChange={v => setSearchText(v)} style={{ width: 200 }} size="small" />
        </div>
        <Table columns={columns} dataSource={filtered} pagination={{ pageSize: 20 }} size="small" rowKey="id" />
      </Card>
    </div>
  )
}
