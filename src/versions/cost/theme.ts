/**
 * 专注成本版 - 颜色主题配置
 * 遵循 UI 规范 V1
 */
export const COLORS = {
  // 主色调
  primary: '#4080FF',
  secondary: '#14C9C9',

  // 语义色
  success: '#3DC779',
  warning: '#FAC858',
  danger: '#EE6666',

  // 背景色（V1 规范）
  sidebar: '#1a2740',
  content: '#F8FAFC',
  card: '#ffffff',
  hover: '#F9FAFB',

  // 文字色
  textPrimary: '#1a2740',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // 边框色
  border: '#E5E7EB',
  divider: '#F0F2F5',

  // 图表配色（V1 规范：固定成本 灰、外采 蓝、商务 黄、其他 红）
  chart: ['#E5E7EB', '#4080FF', '#FAC858', '#EE6666'],
  chartBlue: '#4080FF',
  chartCyan: '#14C9C9',
  chartYellow: '#FAC858',
  chartRed: '#EE6666',

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
  '进行中': { bg: '#E8F2FF', text: '#4080FF', tagColor: 'blue' },
  '已签约': { bg: '#E8F5E9', text: '#3DC779', tagColor: 'green' },
  '待评估': { bg: '#FFF4E5', text: '#FAC858', tagColor: 'orange' },
  '已完成': { bg: '#F2F4F8', text: '#9CA3AF', tagColor: 'grey' },
}

/**
 * 卡片样式（V1 规范：圆角 16px）
 */
export const CARD_STYLES = {
  base: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s ease',
  },
  hover: {
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  header: {
    fontSize: 16,
    fontWeight: 500,
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
  warning: { from: '#FAC858', to: '#EE6666' },
  normal: { from: '#4080FF', to: '#14C9C9' },
  good: { from: '#3DC779', to: '#14C9C9' },
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
  hoverBackground: 'rgba(255,255,255,0.1)',
  activeBorder: `4px solid ${COLORS.primary}`,
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
