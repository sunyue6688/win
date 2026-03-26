/**
 * 成本管理看板 - 主题配置
 * 基于参考设计规范
 */

/**
 * 字体配置
 */
export const FONTS = {
  heading: '"Manrope", "PingFang SC", "Microsoft YaHei", sans-serif',
  body: '"Manrope", "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: 'ui-monospace, Consolas, monospace',
} as const

export const COLORS = {
  // 主色调
  primary: '#0066ff',
  secondary: '#ff3b30',

  // 语义色
  success: '#34c759',
  warning: '#ff9500',
  danger: '#ff3b30',
  info: '#0066ff',

  // 参考设计中的别名
  tertiary: '#34c759',
  quaternary: '#ff9500',

  // 背景色
  sidebar: '#FFFFFF',
  content: '#fcfcfc',
  card: '#ffffff',
  hover: '#F9FAFB',

  // 文字色
  textPrimary: '#1d1d1f',
  textSecondary: '#666666',
  textTertiary: '#86868b',
  onSurfaceVariant: '#86868b',

  // 边框色
  border: '#d2d2d7',
  divider: '#f0f0f0',

  // 图表配色（与环形图语义一致：内部灰、外采蓝、商务橙、其他红）
  chart: ['#cbd5e1', '#0066ff', '#ff9500', '#ff3b30'],
  chartBlue: '#0066ff',
  chartCyan: '#0066ff',
  chartYellow: '#ff9500',
  chartRed: '#ff3b30',

  // 状态背景色
  bgGreen: '#E8F5E9',
  bgRed: '#FFEBEE',
  bgBlue: '#E8F2FF',
  bgOrange: '#FFF4E5',
  bgGrey: '#F2F4F8',
} as const

/**
 * 阴影配置
 */
export const SHADOWS = {
  card: '0 4px 24px rgba(0, 0, 0, 0.04)',
  cardHover: '0 8px 30px rgba(0, 0, 0, 0.06)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.08)',
} as const

/**
 * 圆角配置
 */
export const RADII = {
  card: 16,
  button: 8,
  badge: 4,
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
  sm: 640,   /* 移动端 */
  md: 768,   /* 平板竖屏 */
  lg: 1024,  /* 平板横屏/小桌面 */
  xl: 1280,  /* 标准桌面 */
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
  '进行中': { bg: '#E8F2FF', text: '#0066ff', tagColor: 'blue' },
  '已签约': { bg: '#E8F5E9', text: '#34c759', tagColor: 'green' },
  '待评估': { bg: '#FFF4E5', text: '#ff9500', tagColor: 'orange' },
  '已完成': { bg: '#F2F4F8', text: '#9CA3AF', tagColor: 'grey' },
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
  warning: { from: '#ff9500', to: '#ff3b30' },
  normal: { from: '#0066ff', to: '#0066ff' },
  good: { from: '#34c759', to: '#34c759' },
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
