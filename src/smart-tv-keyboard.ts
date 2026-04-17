import type { KeyboardOptions, KeyboardLayout, KeyConfig, KeyAction, Position } from './types'
import { qwertyLayout, symbolLayout } from './layouts'

export class SmartTVKeyboard {
  private static activeModalKeyboard: SmartTVKeyboard | null = null
  private static focusedKeyboard: SmartTVKeyboard | null = null
  private container: HTMLElement | null = null
  private keyboardElement: HTMLElement | null = null
  private backdropElement: HTMLElement | null = null
  private keys: HTMLElement[][] = []
  private currentPosition: Position = { row: 0, col: 0 }
  private focusedKey: HTMLElement | null = null
  private isShiftActive = false
  private isSymbolActive = false
  private currentLayout: KeyboardLayout
  private originalLayout: KeyboardLayout
  private value = ''
  private isVisible = false
  private isDestroyed = false
  private exitTargets: {
    up?: () => void
    down?: () => void
    left?: () => void
    right?: () => void
  } = {}

  private options: Required<KeyboardOptions> = {
    layout: qwertyLayout,
    displayMode: 'inline',
    onInput: () => {},
    onEnter: () => {},
    onClose: () => {},
    maxLength: Infinity,
    allowEmpty: true,
    theme: 'auto',
    focusColor: '#2196f3',
    zIndex: 9999,
    modalBackdrop: true,
    containerClass: '',
    trapFocus: true,
    onEdgeExit: () => {},
  }

  constructor(options: KeyboardOptions = {}) {
    this.options = { ...this.options, ...options }
    this.originalLayout = this.options.layout
    this.currentLayout = this.originalLayout

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleBackdropClick = this.handleBackdropClick.bind(this)
    this.handleContainerClick = this.handleContainerClick.bind(this)

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown)
    }

    if (this.options.displayMode === 'inline') {
      this.render()
    }
  }

  private handleContainerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    if (target && !target.classList.contains('tvk-key')) {
      this.setFocus()
    }
  }

  private setFocus(): void {
    if (SmartTVKeyboard.focusedKeyboard && SmartTVKeyboard.focusedKeyboard !== this) {
      SmartTVKeyboard.focusedKeyboard.blur()
    }
    SmartTVKeyboard.focusedKeyboard = this

    if (!this.focusedKey && this.keys.length > 0) {
      this.focusKey({ row: 0, col: 0 })
    }
  }

  private getKeyAt(row: number, col: number): HTMLElement | null {
    if (row < 0 || row >= this.keys.length) return null
    if (col < 0 || col >= this.keys[row].length) return null
    return this.keys[row][col]
  }

  private getKeyVisualPosition(key: HTMLElement): { left: number; center: number; right: number } {
    const rect = key.getBoundingClientRect()
    return {
      left: rect.left,
      center: rect.left + rect.width / 2,
      right: rect.right,
    }
  }

  private findNextFocusableKey(
    startRow: number,
    startCol: number,
    direction: 'up' | 'down' | 'left' | 'right',
  ): Position | null {
    const rowCount = this.keys.length
    const currentKey = this.getKeyAt(startRow, startCol)
    if (!currentKey) return null

    const currentPos = this.getKeyVisualPosition(currentKey)

    switch (direction) {
      case 'up': {
        let bestPos: Position | null = null
        let bestDistance = Infinity
        for (let r = startRow - 1; r >= 0; r--) {
          for (let c = 0; c < this.keys[r].length; c++) {
            const key = this.keys[r][c]
            if (key.classList.contains('disabled') || key.classList.contains('hidden')) continue
            const pos = this.getKeyVisualPosition(key)
            const horizontalDistance = Math.abs(pos.center - currentPos.center)
            const verticalDistance = Math.abs(
              key.getBoundingClientRect().bottom - currentKey.getBoundingClientRect().top,
            )
            const distance = horizontalDistance + verticalDistance * 2
            if (distance < bestDistance) {
              bestDistance = distance
              bestPos = { row: r, col: c }
            }
          }
        }
        return bestPos
      }

      case 'down': {
        let bestPos: Position | null = null
        let bestDistance = Infinity
        for (let r = startRow + 1; r < rowCount; r++) {
          for (let c = 0; c < this.keys[r].length; c++) {
            const key = this.keys[r][c]
            if (key.classList.contains('disabled') || key.classList.contains('hidden')) continue
            const pos = this.getKeyVisualPosition(key)
            const horizontalDistance = Math.abs(pos.center - currentPos.center)
            const verticalDistance = Math.abs(
              key.getBoundingClientRect().top - currentKey.getBoundingClientRect().bottom,
            )
            const distance = horizontalDistance + verticalDistance * 2
            if (distance < bestDistance) {
              bestDistance = distance
              bestPos = { row: r, col: c }
            }
          }
        }
        return bestPos
      }

      case 'left': {
        for (let c = startCol - 1; c >= 0; c--) {
          const key = this.getKeyAt(startRow, c)
          if (key && !key.classList.contains('disabled') && !key.classList.contains('hidden')) {
            return { row: startRow, col: c }
          }
        }
        return null
      }

      case 'right': {
        for (let c = startCol + 1; c < this.keys[startRow].length; c++) {
          const key = this.getKeyAt(startRow, c)
          if (key && !key.classList.contains('disabled') && !key.classList.contains('hidden')) {
            return { row: startRow, col: c }
          }
        }
        return null
      }
    }
  }

  private focusKey(position: Position): void {
    const key = this.getKeyAt(position.row, position.col)
    if (!key) return

    if (this.focusedKey) {
      this.focusedKey.classList.remove('focused')
      this.focusedKey.style.boxShadow = ''
    }

    this.currentPosition = position
    this.focusedKey = key
    key.classList.add('focused')
    key.style.boxShadow = `0 0 0 4px ${this.options.focusColor}`
    key.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isVisible) return

    if (SmartTVKeyboard.activeModalKeyboard && SmartTVKeyboard.activeModalKeyboard !== this) {
      return
    }

    if (this.options.displayMode === 'modal' && SmartTVKeyboard.activeModalKeyboard !== this) {
      return
    }

    if (this.options.displayMode === 'inline' && SmartTVKeyboard.focusedKeyboard !== this) {
      return
    }

    let newPosition: Position | null = null
    let exitDirection: 'up' | 'down' | 'left' | 'right' | null = null

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        newPosition = this.findNextFocusableKey(
          this.currentPosition.row,
          this.currentPosition.col,
          'up',
        )
        if (!newPosition) exitDirection = 'up'
        break
      case 'ArrowDown':
        event.preventDefault()
        newPosition = this.findNextFocusableKey(
          this.currentPosition.row,
          this.currentPosition.col,
          'down',
        )
        if (!newPosition) exitDirection = 'down'
        break
      case 'ArrowLeft':
        event.preventDefault()
        newPosition = this.findNextFocusableKey(
          this.currentPosition.row,
          this.currentPosition.col,
          'left',
        )
        if (!newPosition) exitDirection = 'left'
        break
      case 'ArrowRight':
        event.preventDefault()
        newPosition = this.findNextFocusableKey(
          this.currentPosition.row,
          this.currentPosition.col,
          'right',
        )
        if (!newPosition) exitDirection = 'right'
        break
      case 'Enter':
      case 'OK':
      case 'Select':
        event.preventDefault()
        this.activateKey(this.currentPosition)
        return
      case 'Escape':
      case 'Back':
        event.preventDefault()
        if (this.options.displayMode === 'modal') {
          this.hide()
        } else {
          this.blur()
        }
        return
    }

    if (newPosition) {
      this.focusKey(newPosition)
    } else if (exitDirection && this.options.displayMode === 'inline') {
      const exitTarget = this.exitTargets[exitDirection]
      if (exitTarget) {
        this.blur()
        exitTarget()
      } else if (!this.options.trapFocus && this.options.onEdgeExit) {
        this.blur()
        this.options.onEdgeExit(exitDirection)
      }
    }
  }

  private activateKey(position: Position): void {
    const keyElement = this.getKeyAt(position.row, position.col)
    if (!keyElement) return

    const action = keyElement.dataset.action as KeyAction
    const value = keyElement.dataset.value || ''
    const keyConfig: KeyConfig = {
      label: keyElement.textContent || '',
      value,
      action,
    }

    keyElement.classList.add('active')
    setTimeout(() => keyElement.classList.remove('active'), 150)

    switch (action) {
      case 'input':
        this.handleInput(value, keyConfig)
        break
      case 'space':
        this.handleInput(' ', keyConfig)
        break
      case 'backspace':
        this.handleBackspace()
        break
      case 'enter':
        this.handleEnter()
        break
      case 'shift':
        this.toggleShift()
        break
      case 'symbol':
        this.toggleSymbol()
        break
      case 'close':
        this.hide()
        break
      case 'clear':
        this.clear()
        break
    }
  }

  private handleInput(char: string, keyConfig: KeyConfig): void {
    if (this.value.length >= this.options.maxLength) return

    const inputChar = this.isShiftActive ? char.toUpperCase() : char
    this.value += inputChar

    this.options.onInput(this.value, keyConfig)
  }

  private handleBackspace(): void {
    if (this.value.length === 0) return

    this.value = this.value.slice(0, -1)
    this.options.onInput(this.value, { label: '⌫', action: 'backspace' })
  }

  private handleEnter(): void {
    this.options.onEnter()
    if (this.options.displayMode === 'modal') {
      this.hide()
    }
  }

  private toggleShift(): void {
    this.isShiftActive = !this.isShiftActive
    this.rebuildKeys()
    const shiftKey = this.findKeyByAction('shift')
    if (shiftKey) {
      shiftKey.classList.toggle('active-shift', this.isShiftActive)
    }
  }

  private toggleSymbol(): void {
    this.isSymbolActive = !this.isSymbolActive
    this.currentLayout = this.isSymbolActive ? symbolLayout : this.originalLayout
    this.rebuildKeys()
    this.focusKey({ row: 0, col: 0 })
  }

  private findKeyByAction(action: KeyAction): HTMLElement | null {
    for (const row of this.keys) {
      for (const key of row) {
        if (key.dataset.action === action) {
          return key
        }
      }
    }
    return null
  }

  private clear(): void {
    this.value = ''
    this.options.onInput(this.value, { label: 'Clear', action: 'clear' })
  }

  private createKeyElement(key: KeyConfig): HTMLElement {
    const keyElement = document.createElement('button')
    keyElement.className = `tvk-key ${key.className || ''}`
    keyElement.textContent = key.label
    keyElement.dataset.action = key.action
    keyElement.dataset.value = key.value || key.label

    if (key.width && key.width !== 1) {
      keyElement.style.flex = `${key.width}`
    }

    if (key.disabled) {
      keyElement.classList.add('disabled')
      keyElement.disabled = true
    }

    keyElement.setAttribute('type', 'button')

    return keyElement
  }

  private rebuildKeys(): void {
    if (!this.keyboardElement) return

    const oldKeys = this.keys
    const oldPosition = { ...this.currentPosition }

    this.keys = []

    const rowsContainer = this.keyboardElement.querySelector('.tvk-rows')
    if (!rowsContainer) return

    rowsContainer.innerHTML = ''

    this.currentLayout.rows.forEach((row) => {
      const rowElement = document.createElement('div')
      rowElement.className = 'tvk-row'

      const keyRow: HTMLElement[] = []

      row.forEach((key) => {
        const keyElement = this.createKeyElement(key)

        if (key.action === 'input' && this.isShiftActive) {
          keyElement.textContent = key.value?.toUpperCase() || key.label.toUpperCase()
          keyElement.dataset.value = key.value?.toUpperCase() || key.label.toUpperCase()
        }

        rowElement.appendChild(keyElement)
        keyRow.push(keyElement)
      })

      rowsContainer.appendChild(rowElement)
      this.keys.push(keyRow)
    })

    if (oldKeys.length > 0) {
      const maxRow = Math.min(oldPosition.row, this.keys.length - 1)
      const maxCol = Math.min(oldPosition.col, this.keys[maxRow]?.length - 1 || 0)
      this.focusKey({ row: maxRow, col: maxCol })
    } else {
      this.focusKey({ row: 0, col: 0 })
    }
  }

  private render(): void {
    if (this.container) return

    this.container = document.createElement('div')
    this.container.className = `smart-tv-keyboard tvk-${this.options.displayMode} ${this.options.containerClass}`
    this.container.style.zIndex = String(this.options.zIndex)
    this.container.addEventListener('click', this.handleContainerClick)

    if (this.options.theme !== 'auto') {
      this.container.dataset.theme = this.options.theme
    }

    this.keyboardElement = document.createElement('div')
    this.keyboardElement.className = 'tvk-keyboard-inner'

    const rowsContainer = document.createElement('div')
    rowsContainer.className = 'tvk-rows'
    this.keyboardElement.appendChild(rowsContainer)

    this.container.appendChild(this.keyboardElement)

    if (this.options.displayMode === 'modal') {
      this.backdropElement = document.createElement('div')
      this.backdropElement.className = 'tvk-backdrop'
      if (!this.options.modalBackdrop) {
        this.backdropElement.style.backgroundColor = 'transparent'
      }
      this.backdropElement.addEventListener('click', this.handleBackdropClick)
      this.container.appendChild(this.backdropElement)
    }

    document.body.appendChild(this.container)

    this.rebuildKeys()
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.backdropElement) {
      this.hide()
    }
  }

  show(): void {
    if (this.isDestroyed) return

    if (!this.container) {
      this.render()
    }

    if (this.container) {
      this.container.classList.add('visible')
      this.isVisible = true

      if (this.options.displayMode === 'modal') {
        SmartTVKeyboard.activeModalKeyboard = this
        requestAnimationFrame(() => {
          this.focusKey({ row: 0, col: 0 })
        })
      }
    }
  }

  hide(): void {
    if (this.container) {
      this.container.classList.remove('visible')
      this.isVisible = false
    }

    if (SmartTVKeyboard.activeModalKeyboard === this) {
      SmartTVKeyboard.activeModalKeyboard = null
    }

    this.options.onClose()
  }

  setValue(value: string): void {
    this.value = value
  }

  getValue(): string {
    return this.value
  }

  setLayout(layout: KeyboardLayout): void {
    this.originalLayout = layout
    this.currentLayout = layout
    this.isSymbolActive = false
    this.rebuildKeys()
  }

  disableKeys(keyValues: string[]): void {
    for (const row of this.keys) {
      for (const key of row) {
        const keyValue = key.dataset.value
        if (keyValue && keyValues.includes(keyValue)) {
          key.classList.add('disabled')
          ;(key as HTMLButtonElement).disabled = true
        }
      }
    }
  }

  enableKeys(keyValues: string[]): void {
    for (const row of this.keys) {
      for (const key of row) {
        const keyValue = key.dataset.value
        if (keyValue && keyValues.includes(keyValue)) {
          key.classList.remove('disabled')
          ;(key as HTMLButtonElement).disabled = false
        }
      }
    }
  }

  disableAllKeysExcept(keyValues: string[]): void {
    for (const row of this.keys) {
      for (const key of row) {
        key.classList.add('disabled')
        ;(key as HTMLButtonElement).disabled = true
      }
    }
    for (const row of this.keys) {
      for (const key of row) {
        const keyValue = key.dataset.value
        if (keyValue && keyValues.includes(keyValue)) {
          key.classList.remove('disabled')
          ;(key as HTMLButtonElement).disabled = false
        }
      }
    }
  }

  enableAllKeysExcept(keyValues: string[]): void {
    for (const row of this.keys) {
      for (const key of row) {
        key.classList.remove('disabled')
        ;(key as HTMLButtonElement).disabled = false
      }
    }
    for (const row of this.keys) {
      for (const key of row) {
        const keyValue = key.dataset.value
        if (keyValue && keyValues.includes(keyValue)) {
          key.classList.add('disabled')
          ;(key as HTMLButtonElement).disabled = true
        }
      }
    }
  }

  focus(): void {
    if (this.focusedKey) {
      this.focusedKey.focus()
    } else if (this.keys.length > 0 && this.keys[0].length > 0) {
      this.focusKey({ row: 0, col: 0 })
    }
  }

  blur(): void {
    if (SmartTVKeyboard.focusedKeyboard === this) {
      SmartTVKeyboard.focusedKeyboard = null
    }
    if (this.focusedKey) {
      this.focusedKey.classList.remove('focused')
      this.focusedKey.style.boxShadow = ''
      this.focusedKey = null
    }
  }

  setExitTarget(direction: 'up' | 'down' | 'left' | 'right', target: (() => void) | null): void {
    if (target) {
      this.exitTargets[direction] = target
    } else {
      delete this.exitTargets[direction]
    }
  }

  destroy(): void {
    this.isDestroyed = true

    window.removeEventListener('keydown', this.handleKeyDown)

    if (this.backdropElement) {
      this.backdropElement.removeEventListener('click', this.handleBackdropClick)
    }

    if (this.container) {
      this.container.removeEventListener('click', this.handleContainerClick)
    }

    if (SmartTVKeyboard.focusedKeyboard === this) {
      SmartTVKeyboard.focusedKeyboard = null
    }

    if (this.container) {
      this.container.remove()
      this.container = null
    }

    this.keyboardElement = null
    this.backdropElement = null
    this.keys = []
    this.focusedKey = null
  }
}
