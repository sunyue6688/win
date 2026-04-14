import { useState, useMemo, useEffect } from 'react'
import { Toast } from '@douyinfe/semi-ui'
// Refreshed imports for Vite resolution
import { 
  IconPieChartStroked, 
  IconBriefcaseStroked, 
  IconUserListStroked, 
  IconBox, 
  IconSetting,
  IconEdit,
  IconClock,
  IconUserGroup
} from '@douyinfe/semi-icons'
import AppShell from './layouts/AppShell'
import type { UserRole, NavItem } from './layouts/AppShell'

import Dashboard from './pages/Dashboard'
import ProjectView from './pages/ProjectView'
import SalesView from './pages/SalesView'
import ImportManager from './pages/ImportManager'
import OpportunityView from './pages/OpportunityView'
import StaffView from './pages/StaffView'
import ConfigManager from './pages/ConfigManager'
import ManualCostManager from './pages/ManualCostManager'
import LoginPage from './pages/LoginPage'

import { generateProjects, generateSalesTargets, generateOverview } from './mockData'
import { StoreProvider, useStore } from './lib/store'
import { computeProjects } from './lib/costEngine'
import { computeOverview } from './lib/computeOverview'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('win6688_isLoggedIn') === 'true'
  })

  const handleLogin = (role: 'boss' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role === 'boss' ? 'boss' : 'pm');
    localStorage.setItem('win6688_isLoggedIn', 'true');
    localStorage.setItem('win6688_userRole', role === 'boss' ? 'boss' : 'pm');
  }

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('win6688_isLoggedIn');
    localStorage.removeItem('win6688_userRole');
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <StoreProvider>
      <AppContent onLogout={handleLogout} />
    </StoreProvider>
  )
}

function AppContent({ onLogout }: { onLogout: () => void }) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('win6688_userRole') as UserRole) || 'boss'
  })
  const dataState = useStore()

  // 计算全量项目数据
  const projects = useMemo(() => {
    const computed = computeProjects(dataState)
    // 如果没有导入数据，Fallback 到 Mock
    return computed.length > 0 ? computed : generateProjects()
  }, [dataState])

  // 计算总览数据
  const overview = useMemo(() => {
    if (dataState.projects.length > 0) {
      return computeOverview(dataState, computeProjects(dataState))
    }
    return generateOverview()
  }, [dataState])

  // 销售目标数据
  const salesTargets = useMemo(() => {
    if (projects.length === 0) return generateSalesTargets()
    
    const map = new Map<string, any>();
    projects.forEach(p => {
      const existing = map.get(p.sales) || {
        name: p.sales,
        district: p.district, // 取第一个记录的区域
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
      map.set(p.sales, existing);
    });

    return Array.from(map.values()).map(s => ({
      ...s,
      deliveryCostRatio: s.actualCost > 0 ? (s.actualDeliveryCost / s.actualCost) * 100 : 0,
      deliveryCostProgress: s.totalPlanDeliveryCost > 0 ? (s.actualDeliveryCost / s.totalPlanDeliveryCost) * 100 : 0,
      contributionValue: s.totalContractAmount - s.actualCost
    }));
  }, [projects])

  const handleRefresh = () => {
    Toast.success('数据已刷新')
  }

  const navItems: NavItem[] = [
    { key: 'dashboard', text: '总览看板', icon: <IconPieChartStroked /> },
    { key: 'project', text: '项目看板', icon: <IconBriefcaseStroked /> },
    { key: 'opportunity', text: '商机看板', icon: <IconBox /> },
    { key: 'sales', text: '销售看板', icon: <IconUserListStroked /> },
    { key: 'staff', text: '人员管理', icon: <IconUserGroup /> },
    { key: 'import', text: '导入管理', icon: <IconClock /> },
    { key: 'manual', text: '成本录入', icon: <IconEdit /> },
    { key: 'config', text: '固定配置', icon: <IconSetting /> },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard overview={overview} />
      case 'project':
        return <ProjectView projects={projects} />
      case 'opportunity':
        return <OpportunityView />
      case 'sales':
        return <SalesView salesTargets={salesTargets} projects={projects} />
      case 'staff':
        return <StaffView />
      case 'import':
        return <ImportManager />
      case 'manual':
        return <ManualCostManager />
      case 'config':
        return <ConfigManager />
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
      lastUpdate={new Date()}
      onRefresh={handleRefresh}
      navItems={navItems}
    >
      {renderPage()}
    </AppShell>
  )
}

export default App
