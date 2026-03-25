import { useState, useMemo } from 'react'
import { Toast } from '@douyinfe/semi-ui'
import { IconPieChartStroked, IconBriefcaseStroked, IconUserListStroked } from '@douyinfe/semi-icons'
import AppShell from './layouts/AppShell'
import type { AppVersion, UserRole, NavItem } from './layouts/AppShell'

// 基础版
import BasicDashboard from './versions/basic/pages/Dashboard'
import BasicProjectView from './versions/basic/pages/ProjectView'
import BasicSalesView from './versions/basic/pages/SalesView'
import { generateProjects as basicGenProjects, generateSalesTargets as basicGenSales, generateOverview as basicGenOverview } from './versions/basic/mockData'

// 专注成本版
import CostDashboard from './versions/cost/pages/Dashboard'
import CostProjectView from './versions/cost/pages/ProjectView'
import CostSalesView from './versions/cost/pages/SalesView'
import { generateProjects as costGenProjects, generateOverview as costGenOverview } from './versions/cost/mockData'

function App() {
  const [version, setVersion] = useState<AppVersion>('basic')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [userRole, setUserRole] = useState<UserRole>('boss')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 基础版数据
  const basicProjects = useMemo(() => basicGenProjects(), [lastUpdate])
  const basicSalesTargets = useMemo(() => basicGenSales(), [lastUpdate])
  const basicOverview = useMemo(() => basicGenOverview(), [lastUpdate])

  // 专注成本版数据
  const costProjects = useMemo(() => costGenProjects(), [lastUpdate])
  const costOverview = useMemo(() => costGenOverview(), [lastUpdate])

  const handleRefresh = () => {
    setLastUpdate(new Date())
    Toast.success('数据已刷新')
  }

  const handleVersionChange = (v: AppVersion) => {
    setVersion(v)
    setCurrentPage('dashboard')
  }

  // 根据版本生成导航项
  const navItems: NavItem[] = version === 'basic'
    ? [
        { key: 'dashboard', text: '总览看板', icon: <IconPieChartStroked /> },
        { key: 'project', text: '项目维度', icon: <IconBriefcaseStroked /> },
        { key: 'sales', text: '销售维度', icon: <IconUserListStroked /> },
      ]
    : [
        { key: 'dashboard', text: '成本总览', icon: <IconPieChartStroked /> },
        { key: 'project', text: '项目成本明细', icon: <IconBriefcaseStroked /> },
        { key: 'sales', text: '收入与利润', icon: <IconUserListStroked /> },
      ]

  // 渲染页面
  const renderPage = () => {
    if (version === 'basic') {
      switch (currentPage) {
        case 'dashboard':
          return <BasicDashboard overview={basicOverview} />
        case 'project':
          return <BasicProjectView projects={basicProjects} userRole={userRole} />
        case 'sales':
          return <BasicSalesView salesTargets={basicSalesTargets} userRole={userRole} />
        default:
          return <BasicDashboard overview={basicOverview} />
      }
    } else {
      switch (currentPage) {
        case 'dashboard':
          return <CostDashboard overview={costOverview} />
        case 'project':
          return <CostProjectView projects={costProjects} />
        case 'sales':
          return <CostSalesView overview={costOverview} />
        default:
          return <CostDashboard overview={costOverview} />
      }
    }
  }

  return (
    <AppShell
      version={version}
      onVersionChange={handleVersionChange}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      userRole={userRole}
      onRoleChange={setUserRole}
      lastUpdate={lastUpdate}
      onRefresh={handleRefresh}
      navItems={navItems}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
