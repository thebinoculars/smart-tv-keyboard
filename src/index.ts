import { SmartTVKeyboard } from './smart-tv-keyboard'
import { qwertyLayout, numberLayout, numpadLayout, symbolLayout, defaultLayouts } from './layouts'
import type {
  KeyboardOptions,
  KeyboardLayout,
  KeyConfig,
  KeyAction,
  DisplayMode,
  Position,
} from './types'

import './styles.css'

export { SmartTVKeyboard, qwertyLayout, numberLayout, numpadLayout, symbolLayout, defaultLayouts }

export type { KeyboardOptions, KeyboardLayout, KeyConfig, KeyAction, DisplayMode, Position }

export default SmartTVKeyboard

if (typeof window !== 'undefined') {
  ;(window as any).SmartTVKeyboard = SmartTVKeyboard
}
