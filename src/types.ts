export type KeyAction =
  | 'input'
  | 'backspace'
  | 'enter'
  | 'space'
  | 'shift'
  | 'symbol'
  | 'close'
  | 'clear'
  | 'move-left'
  | 'move-right'
  | 'move-up'
  | 'move-down'
  | 'custom'

export interface KeyConfig {
  label: string
  value?: string
  action: KeyAction
  width?: number
  disabled?: boolean
  col?: number
  rowSpan?: number
  colSpan?: number
  className?: string
}

export interface KeyboardLayout {
  name: string
  rows: KeyConfig[][]
}

export type DisplayMode = 'inline' | 'modal'

export interface KeyboardOptions {
  layout?: KeyboardLayout
  displayMode?: DisplayMode
  onInput?: (value: string, key: KeyConfig) => void
  onEnter?: () => void
  onClose?: () => void
  maxLength?: number
  allowEmpty?: boolean
  theme?: 'light' | 'dark' | 'auto'
  focusColor?: string
  zIndex?: number
  modalBackdrop?: boolean
  containerClass?: string
  trapFocus?: boolean
  onEdgeExit?: (direction: 'up' | 'down' | 'left' | 'right') => void
}

export interface Position {
  row: number
  col: number
}
