/**
 * 格式化金额
 * @param v 金额（元）
 * @returns 格式化后的字符串
 */
export function fmtAmount(v: number): string {
  if (v >= 10000) {
    return `${(v / 10000).toFixed(0)} 万`
  }
  return `${v} 元`
}

/**
 * 格式化金额（简短版，用于表头已有单位的场景）
 * @param v 金额（元）
 * @returns 格式化后的字符串（纯数字，保留一位小数，不带单位）
 */
export function fmtAmountShort(v: number): string {
  if (v >= 10000) {
    return `${(v / 10000).toFixed(1)}`
  }
  return `${v.toFixed(1)}`
}

/**
 * 计算百分比
 * @param actual 实际值
 * @param plan 计划值
 * @returns 百分比（0-100+）
 */
export function calcPct(actual: number, plan: number): number {
  if (plan === 0) return 0
  return Math.round((actual / plan) * 100)
}

/**
 * 计算差异百分比
 * @param actual 实际值
 * @param plan 计划值
 * @returns 差异百分比（正数表示超计划，负数表示低于计划）
 */
export function calcDiffPct(actual: number, plan: number): number {
  if (plan === 0) return 0
  return Math.round(((actual - plan) / plan) * 100)
}

/**
 * 获取趋势标识
 * @param actual 实际值
 * @param plan 计划值
 * @returns 趋势信息
 */
export function getTrend(actual: number, plan: number): {
  isUp: boolean
  icon: string
  color: string
  text: string
} {
  const diff = actual - plan
  const diffPct = calcDiffPct(actual, plan)
  const isUp = diff >= 0

  return {
    isUp,
    icon: isUp ? '↑' : '↓',
    color: isUp ? '#3DC779' : '#EE6666',
    text: `${isUp ? '+' : ''}${diffPct}%`
  }
}

/**
 * 格式化日期时间
 * @param date 日期对象
 * @returns 格式化后的字符串 YYYY-MM-DD HH:MM
 */
export function fmtDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 获取进度条颜色
 * @param pct 百分比
 * @returns 颜色配置
 */
export function getProgressColor(pct: number): {
  stroke: string
  gradient?: { from: string; to: string }
} {
  if (pct >= 100) {
    return {
      stroke: '#3DC779',
      gradient: { from: '#3DC779', to: '#14C9C9' }
    }
  } else if (pct >= 80) {
    return {
      stroke: '#4080FF',
      gradient: { from: '#4080FF', to: '#14C9C9' }
    }
  } else {
    return {
      stroke: '#FAC858',
      gradient: { from: '#FAC858', to: '#EE6666' }
    }
  }
}

/**
 * 格式化金额为万元（保留两位小数）
 * @param v 金额（元）
 * @returns 格式化后的字符串，如 "123.45 万"
 */
export function fmtAmountWan(v: number): string {
  return `${(v / 10000).toFixed(2)} 万`
}

/**
 * 获取完成率颜色
 * @param pct 百分比
 * @returns 颜色值
 */
export function getCompletionColor(pct: number): string {
  if (pct >= 100) return '#3DC779'
  if (pct >= 80) return '#FAC858'
  return '#EE6666'
}
