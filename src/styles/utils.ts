/**
 * 样式工具函数
 * 提取通用样式逻辑，减少代码重复
 */

import { COLORS, SHADOWS, RADII } from './theme'

/**
 * 获取卡片样式
 * @param options 配置选项
 */
export function getCardStyle(options?: {
  hover?: boolean
  alert?: boolean
  padding?: number
}) {
  const { hover = false, alert = false, padding } = options || {}

  return {
    borderRadius: RADII.card,
    backgroundColor: COLORS.card,
    boxShadow: hover ? SHADOWS.cardHover : SHADOWS.card,
    border: alert ? `1px solid ${COLORS.border}` : `1px solid ${COLORS.border}`,
    borderLeft: alert ? `4px solid ${COLORS.danger}` : undefined,
    padding: padding !== undefined ? padding : 20,
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  }
}

/**
 * 进度条颜色配置
 */
export const PROGRESS_GRADIENTS: Record<string, { from: string; to: string }> = {
  normal: { from: COLORS.info, to: COLORS.secondary },
  warning: { from: COLORS.warning, to: COLORS.danger },
  success: { from: COLORS.success, to: COLORS.secondary },
  danger: { from: COLORS.danger, to: '#FB7185' },
}

/**
 * 获取进度条样式
 * @param percent 完成百分比
 * @param isOverBudget 是否超支
 */
export function getProgressStyle(percent: number, isOverBudget: boolean = false) {
  let gradient = PROGRESS_GRADIENTS.normal

  if (isOverBudget || percent > 100) {
    gradient = PROGRESS_GRADIENTS.danger
  } else if (percent >= 80) {
    gradient = PROGRESS_GRADIENTS.warning
  }

  return {
    height: 8,
    borderRadius: RADII.badge,
    backgroundColor: isOverBudget ? '#FFE4E6' : COLORS.border,
    bar: {
      background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
      borderRadius: RADII.badge,
    },
  }
}

/**
 * 状态徽章样式映射
 */
export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  // 项目状态
  '进行中': { bg: COLORS.bgBlue, text: COLORS.info },
  '已签约': { bg: COLORS.bgGreen, text: COLORS.success },
  '待评估': { bg: COLORS.bgOrange, text: COLORS.warning },
  '已完成': { bg: COLORS.bgGrey, text: '#9CA3AF' },
  // 利润率状态
  '达标': { bg: COLORS.bgGreen, text: COLORS.success },
  '未达标': { bg: COLORS.bgRed, text: COLORS.danger },
  // 通用状态
  'success': { bg: COLORS.bgGreen, text: COLORS.success },
  'warning': { bg: COLORS.bgOrange, text: COLORS.warning },
  'danger': { bg: COLORS.bgRed, text: COLORS.danger },
  'info': { bg: COLORS.bgBlue, text: COLORS.info },
} as const

/**
 * 获取状态徽章样式
 * @param status 状态名称
 */
export function getStatusBadgeStyle(status: string) {
  return STATUS_STYLES[status] || STATUS_STYLES['info']
}

/**
 * 趋势指示器
 */
export function getTrendStyle(current: number, target: number) {
  const isGood = current >= target
  return {
    color: isGood ? COLORS.success : COLORS.danger,
    icon: isGood ? '↑' : '↓',
    text: isGood ? '达标' : '未达标',
  }
}

/**
 * 表格行样式
 */
export const TABLE_ROW_STYLE = {
  borderBottom: `1px solid ${COLORS.divider}`,
  height: 56,
  transition: 'background-color 0.2s ease',
}

/**
 * 表格悬停处理
 */
export function createTableRowHoverHandler() {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
      e.currentTarget.style.backgroundColor = COLORS.hover
    },
    onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent'
    },
  }
}

/**
 * 格式化颜色为 CSS 变量引用
 * 用于需要动态颜色的场景
 */
export function cssVar(name: string): string {
  return `var(--${name})`
}
