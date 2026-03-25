/**
 * 成本管理看板 - 主题配置
 * 基于 Design Guide V7 规范
 */

/**
 * 字体配置
 */
export const FONTS = {
  heading: '"Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif',
  body: '"Albert Sans", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: 'ui-monospace, Consolas, monospace',
} as const

export const COLORS = {
  // 主色调
  primary: '#0F172A',
  secondary: '#14C9C9',

  // 语义色
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#E11D48',
  info: '#3B82F6',

  // 背景色
  sidebar: '#FFFFFF',
  content: '#F7F5F2',
  card: '#ffffff',
  hover: '#F9FAFB',

  // 文字色
  textPrimary: '#0F172A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // 边框色
  border: '#E5E7EB',
  divider: '#F0F2F5',

  // 图表配色（内部人力灰色、外采蓝色、商务黄色、其他红色）
  chart: ['#E5E7EB', '#3B82F6', '#F59E0B', '#E11D48'],
  chartBlue: '#3B82F6',
  chartCyan: '#14C9C9',
  chartYellow: '#F59E0B',
  chartRed: '#E11D48',

  // 状态背景色
  bgGreen: '#E8F5E9',
  bgRed: '#FFEBEE',
  bgBlue: '#E8F2FF',
  bgOrange: '#FFF4E5',
  bgGrey: '#F2F4F8',
} as const

/**
 * 状态颜色映射
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; tagColor: string }> = {
  '进行中': { bg: '#E8F2FF', text: '#3B82F6', tagColor: 'blue' },
  '已签约': { bg: '#E8F5E9', text: '#10B981', tagColor: 'green' },
  '待评估': { bg: '#FFF4E5', text: '#F59E0B', tagColor: 'orange' },
  '已完成': { bg: '#F2F4F8', text: '#9CA3AF', tagColor: 'grey' },
}

/**
 * 卡片样式
 */
export const CARD_STYLES = {
  base: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    transition: 'box-shadow 0.2s ease',
  },
  hover: {
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
  },
  header: {
    fontSize: 16,
    fontWeight: 500,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  body: {
    padding: 24,
  },
} as const

/**
 * 进度条样式
 */
export const PROGRESS_COLORS = {
  warning: { from: '#F59E0B', to: '#E11D48' },
  normal: { from: '#3B82F6', to: '#14C9C9' },
  good: { from: '#10B981', to: '#14C9C9' },
} as const

/**
 * 文字样式
 */
export const TEXT_STYLES = {
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: 400,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: 400,
    color: COLORS.textTertiary,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  valueLarge: {
    fontSize: 32,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
} as const

/**
 * 侧边栏样式
 */
export const SIDEBAR_STYLES = {
  width: 240,
  collapsedWidth: 64,
  itemHeight: 48,
  backgroundColor: COLORS.sidebar,
  hoverBackground: '#F3F4F6',
  activeBorder: `4px solid ${COLORS.info}`,
  borderColor: COLORS.border,
} as const

/**
 * 表格样式
 */
export const TABLE_STYLES = {
  headerBg: '#F9FAFB',
  rowHeight: 56,
  hoverBg: COLORS.hover,
  borderColor: COLORS.border,
} as const
