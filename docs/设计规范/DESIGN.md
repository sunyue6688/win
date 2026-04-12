# 成本管理看板 — 设计规范

> 基于 Design Guide V7，融合 2026 SaaS 仪表板最佳实践

---

## 1. 设计原则

| 原则 | 说明 |
|------|------|
| **清晰优先于密度** | 卡片内边距 24px，确保管理者能快速扫视关键信息 |
| **语义化色彩** | 红色=异常/告警，绿色=健康/正向，蓝色=中性数据 |
| **柔和的企业感** | 暖调米灰背景、圆润卡片、细腻阴影 |
| **响应式友好** | 侧边栏可折叠、表格自适应、移动端改用卡片列表 |

---

## 2. 色彩系统

### 2.1 核心色板

| 角色 | 变量 | 色值 | 用途 |
|------|------|------|------|
| **Primary** | `--color-primary` | `#0F172A` | 主导航、激活状态、主要按钮、关键文字 |
| **Secondary** | `--color-secondary` | `#14C9C9` | 次要强调、图表辅助色 |
| **Background** | `--bg-content` | `#F7F5F2` | 页面全局背景（暖米灰） |
| **Surface** | `--bg-card` | `#FFFFFF` | 卡片、侧边栏、模态框、下拉菜单 |
| **Text Primary** | `--text-primary` | `#0F172A` | 正文、主要标签 |
| **Text Secondary** | `--text-secondary` | `#666666` | 次要文字 |
| **Text Tertiary** | `--text-tertiary` | `#999999` | 辅助文本、占位符 |
| **Border** | `--border-color` | `#E5E7EB` | 卡片边框、表格分隔线 |
| **Divider** | `--divider-color` | `#F0F2F5` | 内容分隔线 |

### 2.2 语义色

| 角色 | 变量 | 色值 | 用途 |
|------|------|------|------|
| **Success** | `--color-success` | `#10B981` | 正向偏差、健康状态、达标 |
| **Warning** | `--color-warning` | `#F59E0B` | 警告、需关注状态 |
| **Danger** | `--color-danger` | `#E11D48` | 负向偏差、关键告警、超标 |
| **Info** | `--color-info` | `#3B82F6` | 图表主色、中性数据、信息提示 |

### 2.3 状态背景色

| 角色 | 色值 | 用途 |
|------|------|------|
| `--bg-green` | `#E8F5E9` | 成功/达标状态背景 |
| `--bg-red` | `#FFEBEE` | 危险/超标状态背景 |
| `--bg-blue` | `#E8F2FF` | 信息状态背景 |
| `--bg-orange` | `#FFF4E5` | 警告状态背景 |
| `--bg-grey` | `#F2F4F8` | 禁用/完成状态背景 |

### 2.4 图表配色

```css
--chart-1: #E5E7EB;  /* 内部人力 - 灰色 */
--chart-2: #3B82F6;  /* 外采 - 蓝色 */
--chart-3: #F59E0B;  /* 商务 - 黄色 */
--chart-4: #E11D48;  /* 其他 - 红色 */
```

### 2.5 CSS 变量汇总

```css
:root {
  /* Colors */
  --color-primary: #0F172A;
  --color-secondary: #14C9C9;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #E11D48;
  --color-info: #3B82F6;

  /* Backgrounds */
  --bg-content: #F7F5F2;
  --bg-card: #FFFFFF;
  --bg-sidebar: #FFFFFF;
  --bg-green: #E8F5E9;
  --bg-red: #FFEBEE;
  --bg-blue: #E8F2FF;
  --bg-orange: #FFF4E5;
  --bg-grey: #F2F4F8;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #666666;
  --text-tertiary: #999999;

  /* Borders */
  --border-color: #E5E7EB;
  --divider-color: #F0F2F5;
}
```

---

## 3. 字体系统

### 3.1 字体族

| 角色 | 字体 | 回退 |
|------|------|------|
| **标题/按钮** | Plus Jakarta Sans | PingFang SC, Microsoft YaHei, sans-serif |
| **正文** | Albert Sans | PingFang SC, Microsoft YaHei, sans-serif |
| **等宽** | ui-monospace | Consolas, monospace |

### 3.2 字号规范

| 名称 | 字号 | 字重 | 用途 |
|------|------|------|------|
| `value-large` | 32px | 700 | KPI 主数值 |
| `value` | 28px | 700 | 大号数值 |
| `title` | 20px | 600 | 页面标题 |
| `card-title` | 15px | 600 | 卡片标题 |
| `body` | 14px | 400 | 正文内容 |
| `caption` | 12px | 400 | 辅助说明、时间戳 |

### 3.3 CSS 变量

```css
:root {
  --font-heading: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-body: 'Albert Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;
}
```

---

## 4. 间距系统

### 4.1 基础单位

基于 `4px` 的间距系统：

| 变量 | 值 | 用途 |
|------|------|------|
| `--space-4` | 4px | 紧凑间距 |
| `--space-8` | 8px | 元素内间距 |
| `--space-12` | 12px | 小组件间距 |
| `--space-16` | 16px | 标准间距 |
| `--space-20` | 20px | 卡片内边距（紧凑） |
| `--space-24` | 24px | 卡片内边距（标准）、内容区边距 |

### 4.2 CSS 变量

```css
:root {
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
}
```

---

## 5. 圆角系统

| 变量 | 值 | 用途 |
|------|------|------|
| `--radius-card` | 8px | 卡片、模态框 |
| `--radius-button` | 8px | 按钮、输入框 |
| `--radius-badge` | 4px | 徽章、标签 |
| `--radius-full` | 9999px | 胶囊按钮、进度条 |

---

## 6. 阴影系统

| 名称 | 值 | 用途 |
|------|------|------|
| **card** | `0 4px 20px rgba(0,0,0,0.03)` | 卡片默认 |
| **card-hover** | `0 8px 30px rgba(0,0,0,0.06)` | 卡片悬停 |
| **dropdown** | `0 4px 12px rgba(0,0,0,0.08)` | 下拉菜单 |

```css
:root {
  --shadow-card: 0 4px 20px rgba(0,0,0,0.03);
  --shadow-card-hover: 0 8px 30px rgba(0,0,0,0.06);
}
```

---

## 7. 布局规范

### 7.1 侧边栏

| 属性 | 展开状态 | 折叠状态 |
|------|------|------|
| 宽度 | 240px | 60px |
| 背景色 | `#FFFFFF` | `#FFFFFF` |
| 右边框 | `1px solid #E5E7EB` | `1px solid #E5E7EB` |

### 7.2 顶部栏

| 属性 | 值 |
|------|------|
| 高度 | 64px |
| 背景色 | `#FFFFFF` |
| 底边框 | `1px solid #E5E7EB` |
| 内边距 | `0 24px` |

### 7.3 内容区

| 属性 | 值 |
|------|------|
| 背景色 | `#F7F5F2` |
| 内边距 | 24px |

### 7.4 响应式断点

| 断点 | 宽度 | 说明 |
|------|------|------|
| `sm` | 640px | 移动端 |
| `md` | 768px | 平板竖屏 |
| `lg` | 1024px | 平板横屏/小桌面 |
| `xl` | 1280px | 标准桌面 |

---

## 8. 核心组件

### 8.1 KPI 卡片

```
┌─────────────────────────────────────┐
│  标签                    趋势徽章   │  ← 12px, text-tertiary
│                                     │
│  ¥1,234,567                         │  ← 32px, 700, primary
│                                     │
│  计划 ¥1,000,000           123%     │  ← 12px, text-tertiary
│  ████████████████████░░░░░░░░░░░░   │  ← 8px 高, 圆角 4px
└─────────────────────────────────────┘
```

**样式规范：**
- 背景：`#FFFFFF`
- 圆角：`16px`
- 阴影：`0 4px 20px rgba(0,0,0,0.03)`
- 边框：`1px solid #E5E7EB`
- 内边距：`20px` 或 `24px`

**异常状态：** 左侧边框 `4px solid #E11D48`

### 8.2 数据表格

| 属性 | 值 |
|------|------|
| 表头背景 | `#F9FAFB` |
| 表头字重 | 500 |
| 表头颜色 | `#999999` |
| 行高 | 56px |
| 悬停背景 | `#F9FAFB` |
| 单元格内边距 | `14px 8px` |

### 8.3 进度条

| 属性 | 值 |
|------|------|
| 高度 | 8px |
| 圆角 | 4px |
| 背景色 | `#E5E7EB` |
| 正常填充 | `linear-gradient(90deg, #3B82F6, #14C9C9)` |
| 警告填充 | `linear-gradient(90deg, #F59E0B, #E11D48)` |
| 超标背景 | `#FFE4E6` |

### 8.4 按钮

**主要按钮：**
- 背景：`#0F172A`
- 文字：白色
- 圆角：8px
- 内边距：`10px 20px`
- 字体：Plus Jakarta Sans, 14px, 600

**次要按钮（幽灵）：**
- 背景：透明
- 边框：`1px solid #E5E7EB`
- 文字：`#0F172A`
- 悬停背景：`#F8FAFC`

### 8.5 标签/徽章

**状态颜色映射：**
| 状态 | tagColor | 背景色 | 文字色 |
|------|------|------|------|
| 进行中 | blue | `#E8F2FF` | `#3B82F6` |
| 已签约 | green | `#E8F5E9` | `#10B981` |
| 待评估 | orange | `#FFF4E5` | `#F59E0B` |
| 已完成 | grey | `#F2F4F8` | `#9CA3AF` |

---

## 9. 交互状态

### 9.1 悬停

| 元素 | 效果 |
|------|------|
| 表格行 | 背景变为 `#F9FAFB` |
| 卡片 | 阴影增强至 `0 8px 30px rgba(0,0,0,0.06)` |
| 告警卡片 | 轻微上移 `translateY(-2px)` |

### 9.2 焦点

```css
:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 2px;
}
```

### 9.3 加载状态

- 使用骨架屏
- 背景色：`#E5E7EB`
- 动画：脉冲效果

---

## 10. 可访问性

### 10.1 按钮触摸目标

- 最小高度：44px
- 最小宽度：44px

### 10.2 颜色对比度

| 组合 | 对比度 | 状态 |
|------|------|------|
| `#0F172A` / `#FFFFFF` | 15.5:1 | ✓ AAA |
| `#666666` / `#FFFFFF` | 5.7:1 | ✓ AA |
| `#999999` / `#FFFFFF` | 2.8:1 | ⚠ 仅用于非关键文字 |

---

## 11. 代码实现

### 11.1 theme.ts 常量

```typescript
// src/styles/theme.ts

export const COLORS = {
  primary: '#0F172A',
  secondary: '#14C9C9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#E11D48',
  info: '#3B82F6',

  sidebar: '#FFFFFF',
  content: '#F7F5F2',
  card: '#FFFFFF',
  hover: '#F9FAFB',

  textPrimary: '#0F172A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  border: '#E5E7EB',
  divider: '#F0F2F5',

  chart: ['#E5E7EB', '#3B82F6', '#F59E0B', '#E11D48'],

  bgGreen: '#E8F5E9',
  bgRed: '#FFEBEE',
  bgBlue: '#E8F2FF',
  bgOrange: '#FFF4E5',
  bgGrey: '#F2F4F8',
}

export const CARD_STYLES = {
  base: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  hover: {
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
  },
}

export const TEXT_STYLES = {
  title: { fontSize: 20, fontWeight: 600, color: COLORS.textPrimary },
  cardTitle: { fontSize: 15, fontWeight: 600, color: COLORS.textPrimary },
  body: { fontSize: 14, fontWeight: 400, color: COLORS.textSecondary },
  caption: { fontSize: 12, fontWeight: 400, color: COLORS.textTertiary },
  value: { fontSize: 28, fontWeight: 700, color: COLORS.textPrimary },
  valueLarge: { fontSize: 32, fontWeight: 700, color: COLORS.textPrimary },
}

export const SIDEBAR_STYLES = {
  width: 240,
  collapsedWidth: 64,
  itemHeight: 48,
  backgroundColor: COLORS.sidebar,
  borderColor: COLORS.border,
}

export const TABLE_STYLES = {
  headerBg: '#F9FAFB',
  rowHeight: 56,
  hoverBg: COLORS.hover,
  borderColor: COLORS.border,
}
```

---

## 12. 规范优化建议

> 基于当前实现和 2026 设计趋势的改进建议

### 12.1 已发现的问题

| 问题 | 当前状态 | 建议 |
|------|------|------|
| 辅助文本对比度 | `#999999` (2.8:1) | 改用 `#6B7280` (4.5:1) |
| 阴影层级单一 | 仅 1 种阴影 | 增加 hover/dropdown 层级 |
| 缺少 z-index 定义 | 无 | 定义浮层层级 scale |
| 响应式断点未定义 | 无 | 明确 sm/md/lg/xl 断点 |

### 12.2 2026 趋势建议

1. **深色模式支持** - 添加深色主题变量
2. **微交互增强** - 数据变化时的动画反馈
3. **个性化视图** - 允许用户自定义仪表板布局
4. **数据叙事** - 图表悬停时提供上下文解释

### 12.3 待补充规范

- [ ] 弹窗/模态框样式
- [ ] 表单输入框样式
- [ ] Toast 通知样式
- [ ] 空状态插图
- [ ] 错误状态样式
- [ ] 深色模式色板

---

*最后更新: 2026-03-25*
