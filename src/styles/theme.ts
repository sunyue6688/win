/**
 * 成本管理看板 - 主题配置
 * 明亮专业风格，适合企业成本管理场景
 */

/**
 * 字体配置
 */
export const FONTS = {
  heading: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  body: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: 'ui-monospace, Consolas, monospace',
} as const

export const COLORS = {
  // 主色调 - 明亮蓝
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',

  // 语义色
  success: '#16A34A',
  successLight: '#22C55E',
  warning: '#D97706',
  warningLight: '#F59E0B',
  danger: '#DC2626',
  dangerLight: '#EF4444',
  info: '#1E40AF',

  // 参考设计中的别名
  tertiary: '#16A34A',
  quaternary: '#D97706',

  // 背景色 - 明亮干净
  sidebar: '#FFFFFF',
  content: '#F8FAFC',
  card: '#FFFFFF',
  hover: '#F1F5F9',

  // 文字色
  textPrimary: '#1E293B',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  onSurfaceVariant: '#64748B',

  // 边框色
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  // 图表配色 - 统一蓝色系，避免杂乱
  chart: ['#94A3B8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  chartPrimary: '#3B82F6',
  chartSecondary: '#94A3B8',
  chartTertiary: '#CBD5E1',
  // 语义色 - 仅用于状态指示，不用于图表主色
  chartSuccess: '#22C55E',
  chartWarning: '#F59E0B',
  chartDanger: '#EF4444',

  // 状态背景色
  bgGreen: '#DCFCE7',
  bgRed: '#FEE2E2',
  bgBlue: '#DBEAFE',
  bgOrange: '#FEF3C7',
  bgGrey: '#F1F5F9',
} as const

/**
 * 阴影配置 - 更有层次感
 */
export const SHADOWS = {
  card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
  dropdown: '0 4px 16px rgba(0, 0, 0, 0.12)',
  elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
} as const

/**
 * 圆角配置 - 更精致
 */
export const RADII = {
  card: 12,
  cardLarge: 16,
  button: 8,
  badge: 6,
  full: 9999,
} as const

/**
 * Z-Index 层级配置
 */
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  modal: 1050,
  tooltip: 1080,
} as const

/**
 * 响应式断点配置
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

/**
 * 媒体查询字符串
 */
export const MEDIA_QUERIES = {
  sm: `@media (max-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (max-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (max-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (max-width: ${BREAKPOINTS.xl}px)`,
} as const

/**
 * 状态颜色映射
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; tagColor: string }> = {
  '进行中': { bg: '#DBEAFE', text: '#1E40AF', tagColor: 'blue' },
  '已签约': { bg: '#DCFCE7', text: '#16A34A', tagColor: 'green' },
  '待评估': { bg: '#FEF3C7', text: '#D97706', tagColor: 'orange' },
  '已完成': { bg: '#F1F5F9', text: '#64748B', tagColor: 'grey' },
}

/**
 * 卡片样式
 */
export const CARD_STYLES = {
  base: {
    borderRadius: RADII.card,
    backgroundColor: COLORS.card,
    boxShadow: SHADOWS.card,
    border: `1px solid ${COLORS.border}`,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  hover: {
    boxShadow: SHADOWS.cardHover,
    transform: 'translateY(-2px)',
  },
  alert: {
    borderLeft: `4px solid ${COLORS.danger}`,
  },
  header: {
    fontSize: 15,
    fontWeight: 600,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  body: {
    padding: 20,
  },
} as const

/**
 * 进度条样式
 */
export const PROGRESS_COLORS = {
  warning: { from: '#F59E0B', to: '#D97706' },
  normal: { from: '#3B82F6', to: '#1E40AF' },
  good: { from: '#22C55E', to: '#16A34A' },
} as const

/**
 * 文字样式
 */
export const TEXT_STYLES = {
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontSize: 14,
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
    fontWeight: 500,
    color: COLORS.textTertiary,
  },
  value: {
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  valueLarge: {
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
} as const

/**
 * 侧边栏样式
 */
export const SIDEBAR_STYLES = {
  width: 240,
  collapsedWidth: 64,
  itemHeight: 44,
  backgroundColor: COLORS.sidebar,
  hoverBackground: COLORS.hover,
  activeBorder: `3px solid ${COLORS.primary}`,
  borderColor: COLORS.border,
} as const

/**
 * 表格样式
 */
export const TABLE_STYLES = {
  headerBg: '#F8FAFC',
  rowHeight: 52,
  hoverBg: COLORS.hover,
  borderColor: COLORS.border,
} as const

/**
 * 间距配置
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const
