/**
 * 共享布局组件 - AppShell
 * 包含侧边栏、顶部工具栏、AI 悬浮按钮
 */
import { useState } from 'react'
import { Layout, Nav, Dropdown, Avatar, Button, Toast, Modal } from '@douyinfe/semi-ui'
import {
  IconRefresh,
  IconDownload,
  IconUser,
  IconChevronDown,
  IconAIFilledLevel1,
  IconBolt,
} from '@douyinfe/semi-icons'
import { fmtDateTime } from '../utils/format'
import { COLORS, SIDEBAR_STYLES, SPACING } from '../styles/theme'

// 品牌图标组件
function BrandLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <svg
        viewBox="0 0 1053 1024"
        width={collapsed ? 28 : 32}
        height={collapsed ? 28 : 32}
        style={{ flexShrink: 0 }}
      >
        <path d="M349.4007553 105.23526594s-48.96347813 228.14023219-54.9606825 303.63928594c144.42582937-85.43962594 179.09460094-48.88132406 54.9606825-303.63928594zM711.20471061 105.23526594s48.96347813 228.14023219 54.96068251 303.63928594c-144.42582937-85.43962594-179.09460094-48.88132406-54.9606825-303.63928594zM526.44151874 540.40228438h1.72522313v-0.08215407c-0.65722781 0.08215312-1.31445562 0.08215312-1.72522313 0.08215406z" fill="#94A3B8" />
        <path d="M281.95274249 522.5749775c0-63.58679906 51.51023625-115.09703437 115.09703531-115.09703437 63.58679906 0 115.09703437 51.51023625 115.09703438 115.09703437 0 5.99720437-0.49292063 11.8301025-1.31445562 17.58084656 6.16151156 0 18.48453469 0.08215312 21.4420603 0.16430625l0.24646032-258.78348281S63.9995428 348.90250719 165.62340562 779.14031655c0 0 67.44801281-131.69203875 133.33510875-196.42898717-10.84426031-17.41653937-17.00577187-38.03706469-17.00577188-60.13635188zM534.2461003 540.40228438h-1.72522312v-0.08215407c0.65722781 0.08215312 1.2323025 0.08215312 1.72522312 0.08215406z" fill="#94A3B8" />
        <path d="M778.65272249 522.5749775c0-63.58679906-51.51023625-115.09703437-115.09703437-115.09703437-63.58679906 0-115.09703437 51.51023625-115.09703438 115.09703437 0 5.99720437 0.49292063 11.8301025 1.31445563 17.58084656-6.16151156 0-18.48453469 0.08215312-21.44206032 0.16430625l-0.24646031-258.78348281s468.52133437 67.36585875 366.89747156 497.60366905c0 0-67.44801281-131.69203875-133.33510968-196.42898718 10.84426031-17.41653937 17.00577187-38.03706469 17.00577187-60.13635187z" fill="#94A3B8" />
        <path d="M530.30273249 992c-34.25800406 0-154.11994125-3.77906063-260.42655187-51.83884969C157.16159624 889.14383469 97.60031905 804.93651125 97.60031905 696.57606219c0-75.00613312 16.34854406-146.06889938 48.71701688-211.13446031 7.47596719-15.11624156 25.79619469-21.27775312 40.91243718-13.80178594 15.11624156 7.47596719 21.27775312 25.79619469 13.801785 40.91243625-28.0964925 56.6037525-42.30904594 118.4653275-42.309045 184.02381 0 83.71440281 45.92379938 146.9725875 136.3747875 187.88502375 95.13373781 43.04842688 204.15141375 46.41672 235.28758594 46.41672 31.13617125 0 140.15384812-3.36829313 235.287585-46.41672 90.53314219-40.99458937 136.3747875-104.17062094 136.37478844-187.88502375 0-69.33754313-18.89530219-139.41446719-54.71422219-202.59049781-8.29750219-14.70547406-3.12183281-33.27216187 11.50148813-41.56966407 14.70547406-8.29750219 33.27216187-3.12183281 41.56966405 11.50148813 40.91243625 72.37722188 62.60095687 152.80548469 62.60095688 232.65867375 0 108.278295-59.56127813 192.48561937-172.27586156 243.50293406-106.22445844 48.14194313-226.16854875 51.92100375-260.42655281 51.92100375z" fill="#1E293B" />
        <path d="M157.73667093 570.96338094c-1.72522313 0-3.36829313-0.16430719-5.09351625-0.4107675-16.59500437-2.79321844-27.85003219-18.56668781-25.05681282-35.16169219 0.65722781-4.02552094 17.17007906-100.72017469 51.42808219-209.9021578C226.49913936 174.490655 283.51365936 77.30307969 348.49706718 36.63710469c7.31166-4.60059562 16.26639001-5.83289719 24.56389219-3.45044719 8.29750219 2.38245094 15.19839469 8.133195 19.05960937 15.85562344 54.46776188 110.66074688 79.27811438 212.77753031 80.26395562 217.04951156 3.94336781 16.43069719-6.16151156 32.86139438-22.59220875 36.80476219-16.43069719 3.94336781-32.86139438-6.16151156-36.80476125-22.59220875-0.24646031-0.90368812-19.22391563-79.03165406-59.39697094-169.48264313-41.73397125 42.63765937-81.49625906 122.08008094-116.32933781 232.98728813-33.02570156 105.15646313-49.29209156 200.7009675-49.45639874 201.68680968-2.54675813 14.86978125-15.44485594 25.46758125-30.06817594 25.46758032zM903.1152553 570.96338094c-14.62332094 0-27.52141781-10.51564594-30.06817594-25.46758032-0.24646031-1.2323025-16.59500437-97.26972844-49.70286-202.34403749-34.75092469-110.57859281-74.43105844-189.77455406-116.0007225-232.33006032-40.25520844 90.69744937-59.15051062 168.57895406-59.39697093 169.48264313-3.94336781 16.43069719-20.374065 26.53557657-36.80476219 22.59220875-16.43069719-3.94336781-26.53557657-20.374065-22.59220875-36.80476219 0.98584219-4.27198125 25.79619469-106.38876469 80.26395656-217.04951156 3.77906063-7.7224275 10.76210719-13.55532563 19.05960844-15.85562344 8.29750219-2.38245094 17.25223219-1.06799531 24.56389219 3.45044719 64.90125469 40.66597594 121.91577375 137.85355031 169.40049 288.85165876 34.34015719 109.18198406 50.77085437 205.79448375 51.42808219 209.9021578 2.79321844 16.59500437-8.37965531 32.36847375-25.05681282 35.16169219-1.64306999 0.24646031-3.36829313 0.4107675-5.09351625 0.4107675zM549.85526249 658.45684438h-38.283525c-24.72819937 0-40.17305531 26.78203687-27.76787812 48.14194312l19.14176249 19.71683719c13.71963187 13.14455812 41.24105062 13.14455812 55.61791032 0l19.1417625-19.71683719c12.32302313-21.35990625-3.12183281-48.14194313-27.85003219-48.14194313z" fill="#1E293B" />
        <path d="M397.37839124 636.11109594c-16.84146469 0-30.47894343-13.63747875-30.47894344-30.47894344v-69.17323593c0-16.84146469 13.63747875-30.47894343 30.47894344-30.47894344s30.47894343 13.63747875 30.47894344 30.47894344v69.17323593c0.08215312 16.75931156-13.63747875 30.47894343-30.47894344 30.47894344zM663.22707374 636.11109594c-16.84146469 0-30.47894343-13.63747875-30.47894344-30.47894344v-69.17323593c0-16.84146469 13.63747875-30.47894343 30.47894344-30.47894344s30.47894343 13.63747875 30.47894438 30.47894344v69.17323593c0 16.75931156-13.63747875 30.47894343-30.47894438 30.47894344z" fill="#1E293B" />
        <path d="M481.91432905 809.53710594h-0.57507468c-38.11921781-0.49292063-61.53296156-54.79637531-64.07971876-60.95788688-3.20398594-7.80458156 0.49292063-16.6771575 8.29750219-19.88114344 7.80458156-3.20398594 16.6771575 0.49292063 19.88114344 8.29750219 6.98304656 16.92361781 23.41374375 41.98043156 36.31184063 42.06258469h0.08215406c9.85841813 0 22.67436187-15.8556225 34.42231031-42.47335219 3.36829313-7.7224275 12.40517625-11.17287375 20.12760469-7.80458156s11.17287375 12.40517625 7.80458156 20.12760469c-17.90946 40.74812906-38.283525 60.62927344-62.27234344 60.6292725z" fill="#1E293B" />
        <path d="M578.69113688 809.53710594c-23.90666437 0-44.28072937-19.79899031-62.35449658-60.6292725-3.36829313-7.7224275 0.08215312-16.6771575 7.80458063-20.12760469 7.7224275-3.36829313 16.6771575 0.08215312 20.12760469 7.80458156 11.74794844 26.61772969 24.64604625 42.47335219 34.42231124 42.47335219h0.08215312c13.47317156-0.16430719 30.31463625-27.52141781 36.31184064-42.06258469 3.20398594-7.80458156 12.15871594-11.50148812 19.88114437-8.29750219 7.80458156 3.20398594 11.50148812 12.15871594 8.29750219 19.88114344-2.54675813 6.16151156-25.96050188 60.46496625-64.07971969 60.95788688h-0.49292063z" fill="#1E293B" />
      </svg>
      {!collapsed && (
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          color: COLORS.textPrimary,
          letterSpacing: '-0.01em',
        }}>
          成本管理
        </span>
      )}
    </div>
  )
}

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
  const [aiModalVisible, setAiModalVisible] = useState(false)

  const handleExport = () => {
    Toast.info('导出功能开发中...')
  }

  const handleAiClick = () => {
    setAiModalVisible(true)
  }

  const sidebarWidth = collapsed ? SIDEBAR_STYLES.collapsedWidth : SIDEBAR_STYLES.width

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 侧边栏 */}
      <Sider
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          flex: '0 0 auto',
          backgroundColor: SIDEBAR_STYLES.backgroundColor,
          height: '100vh',
          borderRight: `1px solid ${COLORS.border}`,
          transition: 'width 0.2s ease',
          overflow: 'auto',
          position: 'sticky',
          top: 0,
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
          }}
        >
          <BrandLogo collapsed={collapsed} />
        </div>

        {/* 导航菜单 */}
        <Nav
          selectedKeys={[currentPage]}
          collapsed={collapsed}
          style={{
            height: 'calc(100vh - 64px)',
            backgroundColor: 'transparent',
            overflowY: 'auto',
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

      {/* 右侧主内容区 */}
      <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <Header
          style={{
            backgroundColor: '#fff',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${SPACING.xxl}px`,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: COLORS.textTertiary,
              fontSize: 13,
              padding: '6px 10px',
              backgroundColor: COLORS.hover,
              borderRadius: 6,
            }}>
              <IconRefresh style={{ fontSize: 14 }} />
              <span>{fmtDateTime(lastUpdate)}</span>
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: 8,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
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
            padding: SPACING.xxl,
            backgroundColor: COLORS.content,
            minHeight: 'calc(100vh - 64px)',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>

      {/* AI 悬浮按钮 - Semi Design AI colorful 风格 */}
      <div
        onClick={handleAiClick}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.4)'
        }}
      >
        <IconAIFilledLevel1 style={{ fontSize: 28, color: '#fff' }} />
      </div>

      {/* AI 对话框（占位符） */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBolt style={{ color: COLORS.primary }} />
            <span>AI 助手</span>
          </div>
        }
        visible={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        footer={null}
        style={{ width: 480 }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: COLORS.textTertiary,
        }}>
          <IconBolt style={{ fontSize: 48, color: COLORS.textTertiary, marginBottom: 16 }} />
          <p style={{ fontSize: 14, marginBottom: 8 }}>AI 助手功能开发中...</p>
          <p style={{ fontSize: 12 }}>后续将接入真实 AI 能力，支持数据查询和分析</p>
        </div>
      </Modal>
    </Layout>
  )
}
