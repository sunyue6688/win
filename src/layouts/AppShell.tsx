/**
 * 共享布局组件 - AppShell
 * 包含侧边栏、顶部工具栏
 */
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

const SIDEBAR = {
  width: 240,
  collapsedWidth: 64,
  itemHeight: 48,
  backgroundColor: '#1a2740',
  hoverBackground: 'rgba(255,255,255,0.1)',
  activeBorder: `4px solid #4080FF`,
}

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
  const collapsed = false

  const handleExport = () => {
    Toast.info('导出功能开发中...')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        style={{
          backgroundColor: SIDEBAR.backgroundColor,
          width: collapsed ? SIDEBAR.collapsedWidth : SIDEBAR.width,
          transition: 'width 0.2s ease',
        }}
      >
        {/* 品牌区 */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontWeight: 700,
            fontSize: collapsed ? 12 : 16,
            color: '#fff',
            letterSpacing: collapsed ? 0 : 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? '成本' : '成本管理看板'}
        </div>

        {/* 导航菜单 */}
        <Nav
          selectedKeys={[currentPage]}
          style={{
            maxWidth: collapsed ? SIDEBAR.collapsedWidth : SIDEBAR.width,
            height: 'calc(100vh - 64px)',
            backgroundColor: 'transparent',
          }}
          bodyStyle={{ backgroundColor: 'transparent' }}
          items={navItems.map((item) => ({
            itemKey: item.key,
            text: item.text,
            icon: item.icon,
            style: {
              height: SIDEBAR.itemHeight,
              borderRadius: 8,
              margin: '4px 8px',
              color: currentPage === item.key ? '#fff' : 'rgba(255,255,255,0.65)',
              backgroundColor: currentPage === item.key ? 'rgba(64,128,255,0.2)' : 'transparent',
              borderLeft: currentPage === item.key ? SIDEBAR.activeBorder : '4px solid transparent',
              transition: 'all 0.2s ease',
            },
          }))}
          onClick={({ itemKey }) => onPageChange(itemKey as string)}
          renderItem={(item: { itemKey: string; text: string; icon: React.ReactNode }) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 8px',
              }}
              onMouseEnter={(e) => {
                if (item.itemKey !== currentPage) {
                  e.currentTarget.style.backgroundColor = SIDEBAR.hoverBackground
                }
              }}
              onMouseLeave={(e) => {
                if (item.itemKey !== currentPage) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {item.icon}
              {!collapsed && <span>{item.text}</span>}
            </div>
          )}
          footer={{ collapseButton: true }}
        />
      </Sider>

      <Layout>
        {/* 顶部工具栏 */}
        <Header
          style={{
            backgroundColor: '#fff',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 56,
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
            padding: 20,
            backgroundColor: '#F8FAFC',
            minHeight: 'calc(100vh - 56px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
