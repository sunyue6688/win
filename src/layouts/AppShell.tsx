/**
 * 共享布局组件 - AppShell
 * 包含侧边栏、顶部工具栏
 */
import { useState } from 'react'
import { Layout, Nav, Dropdown, Avatar, Button, Toast } from '@douyinfe/semi-ui'
import {
  IconRefresh,
  IconDownload,
  IconUser,
  IconChevronDown,
} from '@douyinfe/semi-icons'
import { fmtDateTime } from '../utils/format'
import { COLORS } from '../styles/theme'

const { Sider, Content, Header } = Layout

export type UserRole = 'boss' | 'pm' | 'sales'

export interface NavItem {
  key: string
  text: string
  icon: React.ReactNode
}

interface Props {
  currentPage: string
  onPageChange: (page: string) => void
  userRole: UserRole
  onRoleChange: (role: UserRole) => void
  lastUpdate: Date
  onRefresh: () => void
  navItems: NavItem[]
  children: React.ReactNode
}

const ROLE_LABELS: Record<UserRole, string> = {
  boss: '老板视角',
  pm: '项目经理视角',
  sales: '销售视角',
}

const SIDEBAR_WIDTH = 240
const SIDEBAR_COLLAPSED_WIDTH = 60

export default function AppShell({
  currentPage,
  onPageChange,
  userRole,
  onRoleChange,
  lastUpdate,
  onRefresh,
  navItems,
  children,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const handleExport = () => {
    Toast.info('导出功能开发中...')
  }

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 侧边栏 */}
      <Sider
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          flex: '0 0 auto',
          backgroundColor: '#fff',
          height: '100vh',
          borderRight: `1px solid ${COLORS.border}`,
          transition: 'all 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* 品牌区 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: `1px solid ${COLORS.border}`,
            fontWeight: 700,
            fontSize: 16,
            color: COLORS.textPrimary,
            letterSpacing: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {collapsed ? '成本' : '成本管理看板'}
        </div>

        {/* 导航菜单 - 使用组件库原生样式 */}
        <Nav
          selectedKeys={[currentPage]}
          collapsed={collapsed}
          style={{
            height: 'calc(100vh - 64px)',
            backgroundColor: 'transparent',
          }}
          bodyStyle={{ backgroundColor: 'transparent' }}
          items={navItems.map((item) => ({
            itemKey: item.key,
            text: item.text,
            icon: item.icon,
          }))}
          onClick={({ itemKey }) => onPageChange(itemKey as string)}
          onCollapseChange={setCollapsed}
          footer={{ collapseButton: true }}
        />
      </Sider>

      {/* 右侧主内容区 - flex: 1 自动填充剩余空间 */}
      <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <Header
          style={{
            backgroundColor: '#fff',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 64,
            flexShrink: 0,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
              {navItems.find(item => item.key === currentPage)?.text || ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.textTertiary, fontSize: 13 }}>
              <IconRefresh style={{ fontSize: 14 }} />
              <span>更新于 {fmtDateTime(lastUpdate)}</span>
            </div>

            <Button
              theme="borderless"
              icon={<IconRefresh />}
              onClick={onRefresh}
              style={{ color: COLORS.textSecondary }}
            >
              刷新
            </Button>

            <Button
              theme="borderless"
              icon={<IconDownload />}
              onClick={handleExport}
              style={{ color: COLORS.textSecondary }}
            >
              导出
            </Button>

            <Dropdown
              trigger="click"
              position="bottomRight"
              render={
                <Dropdown.Menu>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                    <Dropdown.Item
                      key={role}
                      onClick={() => onRoleChange(role)}
                      style={{
                        fontWeight: userRole === role ? 600 : 400,
                        color: userRole === role ? COLORS.primary : undefined,
                      }}
                    >
                      {ROLE_LABELS[role]}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              }
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" style={{ backgroundColor: COLORS.primary }}>
                  <IconUser />
                </Avatar>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>
                  {ROLE_LABELS[userRole]}
                </span>
                <IconChevronDown style={{ fontSize: 12, color: COLORS.textTertiary }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            padding: 24,
            backgroundColor: COLORS.content,
            minHeight: 'calc(100vh - 64px)',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
