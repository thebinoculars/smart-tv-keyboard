import { SmartTVKeyboard, qwertyLayout, numpadLayout, numberLayout } from './src/index'
import type { KeyboardLayout, KeyConfig } from './src/types'

let mainKeyboard: SmartTVKeyboard | null = null
let modalKeyboard: SmartTVKeyboard | null = null
let currentDemo = 'basic'

function getContainer(kb: SmartTVKeyboard): HTMLElement | null {
  return (kb as any).container
}

const gamepadLayout: KeyboardLayout = {
  name: 'Gamepad',
  rows: [
    [
      { label: 'A', action: 'input', value: 'A' },
      { label: 'B', action: 'input', value: 'B' },
      { label: 'X', action: 'input', value: 'X' },
      { label: 'Y', action: 'input', value: 'Y' },
    ],
    [
      { label: '▲', action: 'input', value: '↑' },
      { label: '▼', action: 'input', value: '↓' },
      { label: '◀', action: 'input', value: '←' },
      { label: '▶', action: 'input', value: '→' },
    ],
    [
      { label: 'L', action: 'input', value: 'L' },
      { label: 'R', action: 'input', value: 'R' },
      { label: 'Start', action: 'enter', width: 1.5 },
      { label: '✕', action: 'close', width: 0.8 },
    ],
  ],
}

;(window as any).switchDemo = (demoId: string) => {
  currentDemo = demoId

  document.querySelectorAll('.demo-panel').forEach((el) => {
    ;(el as HTMLElement).style.display = 'none'
  })

  document.querySelectorAll('.demo-panel input').forEach((input) => {
    ;(input as HTMLInputElement).value = ''
  })
  const status = document.getElementById('validation-status')
  if (status) {
    status.textContent = '0/5 chars'
    status.style.color = '#a0a0c0'
  }

  const selectedPanel = document.getElementById(`${demoId}-demo`)
  if (selectedPanel) {
    selectedPanel.style.display = 'block'
  }

  updateDemoCode(demoId)

  if (document.activeElement && document.activeElement !== document.body) {
    ;(document.activeElement as HTMLElement).blur()
  }

  window.scrollTo({ top: 0, behavior: 'auto' })

  createKeyboardForDemo(demoId)
}

const demoCodes: Record<string, string> = {
  basic: `import { SmartTVKeyboard, qwertyLayout } from 'smart-tv-keyboard';
import 'smart-tv-keyboard/dist/smart-tv-keyboard.css';

const keyboard = new SmartTVKeyboard({
  layout: qwertyLayout,
  displayMode: 'inline',
  theme: 'dark',
  focusColor: '#2196f3',
  onInput: (value, key) => {
    input.value = value;
  },
  onEnter: () => {
    alert('Submitted: ' + input.value);
  }
});

document.getElementById('keyboard-host').appendChild(
  keyboard.container
);
keyboard.show();`,

  numpad: `import { SmartTVKeyboard, numpadLayout } from 'smart-tv-keyboard';
import 'smart-tv-keyboard/dist/smart-tv-keyboard.css';

const keyboard = new SmartTVKeyboard({
  layout: numpadLayout,
  displayMode: 'inline',
  maxLength: 6,
  allowEmpty: false,
  onInput: (value) => {
    input.value = value;
    if (value.length === 6) {
      validatePIN(value);
    }
  },
  onEnter: () => {
    if (input.value.length === 6) {
      validatePIN(input.value);
    }
  }
});`,

  custom: `import { SmartTVKeyboard } from 'smart-tv-keyboard';
import 'smart-tv-keyboard/dist/smart-tv-keyboard.css';

const gamepadLayout = {
  name: 'gamepad',
  rows: [
    [{ value: 'A' }, { value: 'B' }, { value: 'X' }],
    [{ value: 'Y' }, { value: '△' }, { value: '□' }],
    [{ action: 'shift', label: 'Shift' },
     { value: '○' },
     { value: '★' }],
    [{ action: 'clear', label: 'Clear', width: 2 },
     { action: 'enter', label: 'OK' }]
  ]
};

const keyboard = new SmartTVKeyboard({
  layout: gamepadLayout,
  onInput: (value, key) => {
    console.log('Pressed:', key.label);
    input.value = value;
  }
});`,

  validation: `import { SmartTVKeyboard, qwertyLayout } from 'smart-tv-keyboard';
import 'smart-tv-keyboard/dist/smart-tv-keyboard.css';

const keyboard = new SmartTVKeyboard({
  layout: qwertyLayout,
  maxLength: 5,
  onInput: (value) => {
    input.value = value;
    status.textContent = \`\${value.length}/5 chars\`;

    const isMax = value.length >= 5;
    if (isMax) {
      keyboard.disableAllKeysExcept(['⌫', 'Enter']);
    } else {
      keyboard.enableKeys([
        '0','1','2','3','4','5','6','7','8','9',
        'q','w','e','r','t','y','u','i','o','p',
        'a','s','d','f','g','h','j','k','l',
        'z','x','c','v','b','n','m',
        ',','.','⌫','Enter'
      ]);
    }
  },
  onEnter: () => {
    if (input.value.length <= 5) {
      submitForm(input.value);
    }
  }
});`,

  modal: `import { SmartTVKeyboard, qwertyLayout } from 'smart-tv-keyboard';

const keyboard = new SmartTVKeyboard({
  layout: qwertyLayout,
  displayMode: 'modal',
  theme: 'dark',
  focusColor: '#a78bfa',
  zIndex: 10000,
  modalBackdrop: true,
  onInput: (value) => {
    input.value = value;
  },
  onEnter: () => {
    keyboard.hide();
    submitForm(input.value);
  },
  onClose: () => {
    document.getElementById('open-btn').focus();
  }
});

keyboard.setValue('');
keyboard.show();`,

  spatial: `import { SmartTVKeyboard, qwertyLayout } from 'smart-tv-keyboard';
import 'smart-tv-keyboard/dist/smart-tv-keyboard.css';

const keyboard = new SmartTVKeyboard({
  layout: qwertyLayout,
  displayMode: 'inline',
  trapFocus: false,
  onInput: (value) => input.value = value,
  onEnter: () => submitForm(),
  onEdgeExit: (direction) => {
    switch(direction) {
      case 'up':
        focusElement('top-menu');
        break;
      case 'down':
        focusElement('submit-btn');
        break;
      case 'left':
        focusElement('suggestions');
        break;
      case 'right':
        focusElement('filters');
        break;
    }
  }
});`,
}

function updateDemoCode(demoId: string) {
  const codeElement = document.getElementById('demo-code-content')
  if (codeElement) {
    codeElement.textContent = demoCodes[demoId] || ''
  }
}

function createKeyboardForDemo(demoId: string) {
  if (mainKeyboard) {
    mainKeyboard.destroy()
    mainKeyboard = null
  }
  if (modalKeyboard) {
    modalKeyboard.destroy()
    modalKeyboard = null
  }

  let container: HTMLElement | null
  if (demoId === 'spatial') {
    container = document.getElementById('keyboard-host-spatial')
  } else {
    container = document.getElementById('keyboard-host')
  }
  if (!container) return

  const regularHost = document.getElementById('keyboard-host')
  const spatialHost = document.getElementById('keyboard-host-spatial')
  if (regularHost) regularHost.style.display = demoId === 'spatial' ? 'none' : 'block'
  if (spatialHost) spatialHost.innerHTML = ''

  let layout = qwertyLayout
  let focusColor = '#667eea'
  let maxLength: number | undefined
  let onInput: (value: string) => void
  let onEnter: () => void

  switch (demoId) {
    case 'basic':
    case 'numpad':
    case 'custom':
    case 'validation':
      break

    case 'spatial':
      break

    case 'modal':
      setTimeout(() => {
        const btn = document.getElementById('modal-open-btn')
        if (btn) btn.focus()
      }, 100)
      return

    default:
      return
  }

  switch (demoId) {
    case 'basic':
      onInput = (value) => {
        const input = document.getElementById('basic-input') as HTMLInputElement
        if (input) input.value = value
      }
      onEnter = () => {
        const val = (document.getElementById('basic-input') as HTMLInputElement)?.value
        if (mainKeyboard) mainKeyboard.blur()
        alert(`Entered: ${val}`)
      }
      break

    case 'numpad':
      layout = numpadLayout
      focusColor = '#4caf50'
      maxLength = 6
      onInput = (value) => {
        const input = document.getElementById('numpad-input') as HTMLInputElement
        if (input) input.value = value
      }
      onEnter = () => {
        const val = (document.getElementById('numpad-input') as HTMLInputElement)?.value
        if (mainKeyboard) mainKeyboard.blur()
        alert(`PIN: ${val}`)
      }
      break

    case 'custom':
      layout = gamepadLayout
      focusColor = '#ff9800'
      onInput = (value) => {
        const input = document.getElementById('custom-input') as HTMLInputElement
        if (input) input.value = value
      }
      onEnter = () => {
        const val = (document.getElementById('custom-input') as HTMLInputElement)?.value
        if (mainKeyboard) mainKeyboard.blur()
        alert(`Code: ${val}`)
      }
      break

    case 'validation':
      focusColor = '#f44336'
      maxLength = 5
      onInput = (value) => {
        const input = document.getElementById('validation-input') as HTMLInputElement
        const status = document.getElementById('validation-status')
        if (input) input.value = value
        if (status) {
          const isMax = value.length >= 5
          status.textContent = isMax ? 'Max reached! Use backspace.' : `${value.length}/5 chars`
          status.style.color = isMax ? '#f44336' : '#a0a0c0'
        }

        const isMaxReached = value.length >= 5
        if (isMaxReached) {
          mainKeyboard?.disableAllKeysExcept(['⌫', 'Enter'])
        } else {
          mainKeyboard?.enableKeys([
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'q',
            'w',
            'e',
            'r',
            't',
            'y',
            'u',
            'i',
            'o',
            'p',
            'a',
            's',
            'd',
            'f',
            'g',
            'h',
            'j',
            'k',
            'l',
            'z',
            'x',
            'c',
            'v',
            'b',
            'n',
            'm',
            ',',
            '.',
            '⌫',
            'Enter',
          ])
        }
      }
      onEnter = () => {
        const val = (document.getElementById('validation-input') as HTMLInputElement)?.value
        if (mainKeyboard) mainKeyboard.blur()
        alert(`Promo: ${val}`)
      }
      break

    case 'spatial':
      onInput = (value) => {
        const input = document.getElementById('spatial-input') as HTMLInputElement
        if (input) input.value = value
      }
      onEnter = () => {
        const val = (document.getElementById('spatial-input') as HTMLInputElement)?.value
        if (mainKeyboard) mainKeyboard.blur()
        alert(`Text: ${val}`)
      }
      break

    default:
      return
  }

  mainKeyboard = new SmartTVKeyboard({
    layout,
    displayMode: 'inline',
    theme: 'dark',
    focusColor,
    maxLength: maxLength ?? Infinity,
    onInput: (value) => onInput(value),
    onEnter: onEnter,
    trapFocus: demoId !== 'spatial',
    onEdgeExit:
      demoId === 'spatial'
        ? (direction) => {
            const cornerMap: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
              up: 'top',
              down: 'bottom',
              left: 'left',
              right: 'right',
            }
            focusCornerElement(cornerMap[direction])
          }
        : undefined,
  })

  const kbContainer = getContainer(mainKeyboard)
  if (kbContainer) {
    container.innerHTML = ''
    container.appendChild(kbContainer)
    mainKeyboard.show()
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
      kbContainer.click()
    }, 100)
  }
}

;(window as any).openModalDemo = () => {
  const input = document.getElementById('modal-input') as HTMLInputElement
  if (!input) return

  if (modalKeyboard) {
    modalKeyboard.destroy()
  }

  modalKeyboard = new SmartTVKeyboard({
    layout: qwertyLayout,
    displayMode: 'modal',
    theme: 'dark',
    focusColor: '#a78bfa',
    onInput: (value) => {
      input.value = value
    },
    onEnter: () => {
      modalKeyboard?.hide()
      alert(`Modal value: ${input.value}`)
    },
    onClose: () => {},
  })

  modalKeyboard.setValue(input.value)
  modalKeyboard.show()
}

function focusCornerElement(position: 'top' | 'bottom' | 'left' | 'right') {
  const corners: Record<string, string> = {
    top: 'corner-top',
    bottom: 'corner-bottom',
    left: 'corner-left',
    right: 'corner-right',
  }

  const element = document.getElementById(corners[position])
  if (element) {
    document.querySelectorAll('.corner-element').forEach((el) => {
      el.classList.remove('focused')
    })
    element.classList.add('focused')
    element.focus()

    element.removeEventListener('keydown', handleCornerKeydown)
    element.addEventListener('keydown', handleCornerKeydown)
  }
}

function handleCornerKeydown(e: KeyboardEvent) {
  const target = e.currentTarget as HTMLElement
  const id = target.id

  e.preventDefault()
  e.stopPropagation()

  if (e.key === 'Enter') {
    target.click()
    return
  }

  const backToKeyboard: Record<string, string[]> = {
    'corner-top': ['ArrowDown'],
    'corner-bottom': ['ArrowUp'],
    'corner-left': ['ArrowRight'],
    'corner-right': ['ArrowLeft'],
  }

  const allowedKeys = backToKeyboard[id] || []
  const isEscape = e.key === 'Escape' || e.key === 'Back'

  if (allowedKeys.includes(e.key) || isEscape) {
    target.classList.remove('focused')
    target.blur()
    if (mainKeyboard && currentDemo === 'spatial') {
      const kbContainer = getContainer(mainKeyboard)
      if (kbContainer) {
        kbContainer.click()
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ;(window as any).switchDemo('basic')

  const modalBtn = document.getElementById('modal-open-btn')
  if (modalBtn) {
    modalBtn.addEventListener('focus', () => {
      modalBtn.classList.add('focused')
    })
    modalBtn.addEventListener('blur', () => {
      modalBtn.classList.remove('focused')
    })
  }

  const copyBtn = document.getElementById('copy-code-btn')
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const codeElement = document.getElementById('demo-code-content')
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent || '').then(() => {
          copyBtn.textContent = 'Copied!'
          setTimeout(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`
          }, 1500)
        })
      }
    })
  }
})
