import { useState, useMemo } from 'react'
import { Toast } from '@douyinfe/semi-ui'
import { IconPieChartStroked, IconBriefcaseStroked, IconUserListStroked } from '@douyinfe/semi-icons'
import AppShell from './layouts/AppShell'
import type { UserRole, NavItem } from './layouts/AppShell'

import Dashboard from './pages/Dashboard'
import ProjectView from './pages/ProjectView'
import SalesView from './pages/SalesView'
import { generateProjects, generateSalesTargets, generateOverview } from './mockData'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [userRole, setUserRole] = useState<UserRole>('boss')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const projects = useMemo(() => generateProjects(), [lastUpdate])
  const salesTargets = useMemo(() => generateSalesTargets(), [lastUpdate])
  const overview = useMemo(() => generateOverview(), [lastUpdate])

  const handleRefresh = () => {
    setLastUpdate(new Date())
    Toast.success('数据已刷新')
  }

  const navItems: NavItem[] = [
    { key: 'dashboard', text: '总览看板', icon: <IconPieChartStroked /> },
    { key: 'project', text: '项目看板', icon: <IconBriefcaseStroked /> },
    { key: 'sales', text: '销售看板', icon: <IconUserListStroked /> },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard overview={overview} />
      case 'project':
        return <ProjectView projects={projects} />
      case 'sales':
        return <SalesView salesTargets={salesTargets} />
      default:
        return <Dashboard overview={overview} />
    }
  }

  return (
    <AppShell
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
