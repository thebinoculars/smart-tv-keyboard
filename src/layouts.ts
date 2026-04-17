import type { KeyboardLayout, KeyConfig } from './types'

const createKey = (
  label: string,
  action: KeyConfig['action'],
  value?: string,
  width = 1,
): KeyConfig => ({
  label,
  value: value || label,
  action,
  width,
  disabled: false,
})

export const qwertyLayout: KeyboardLayout = {
  name: 'QWERTY',
  rows: [
    [
      createKey('1', 'input', '1'),
      createKey('2', 'input', '2'),
      createKey('3', 'input', '3'),
      createKey('4', 'input', '4'),
      createKey('5', 'input', '5'),
      createKey('6', 'input', '6'),
      createKey('7', 'input', '7'),
      createKey('8', 'input', '8'),
      createKey('9', 'input', '9'),
      createKey('0', 'input', '0'),
    ],
    [
      createKey('Q', 'input', 'q'),
      createKey('W', 'input', 'w'),
      createKey('E', 'input', 'e'),
      createKey('R', 'input', 'r'),
      createKey('T', 'input', 't'),
      createKey('Y', 'input', 'y'),
      createKey('U', 'input', 'u'),
      createKey('I', 'input', 'i'),
      createKey('O', 'input', 'o'),
      createKey('P', 'input', 'p'),
    ],
    [
      createKey('A', 'input', 'a'),
      createKey('S', 'input', 's'),
      createKey('D', 'input', 'd'),
      createKey('F', 'input', 'f'),
      createKey('G', 'input', 'g'),
      createKey('H', 'input', 'h'),
      createKey('J', 'input', 'j'),
      createKey('K', 'input', 'k'),
      createKey('L', 'input', 'l'),
      createKey('⌫', 'backspace', undefined, 1.5),
    ],
    [
      createKey('⇧', 'shift', undefined, 1.5),
      createKey('Z', 'input', 'z'),
      createKey('X', 'input', 'x'),
      createKey('C', 'input', 'c'),
      createKey('V', 'input', 'v'),
      createKey('B', 'input', 'b'),
      createKey('N', 'input', 'n'),
      createKey('M', 'input', 'm'),
      createKey(',', 'input', ','),
      createKey('.', 'input', '.'),
    ],
    [
      createKey('?123', 'symbol', undefined, 2),
      createKey('Space', 'space', ' ', 5),
      createKey('Enter', 'enter', undefined, 2),
      createKey('✕', 'close', undefined, 1),
    ],
  ],
}

export const numberLayout: KeyboardLayout = {
  name: 'Number',
  rows: [
    [createKey('1', 'input', '1'), createKey('2', 'input', '2'), createKey('3', 'input', '3')],
    [createKey('4', 'input', '4'), createKey('5', 'input', '5'), createKey('6', 'input', '6')],
    [createKey('7', 'input', '7'), createKey('8', 'input', '8'), createKey('9', 'input', '9')],
    [
      createKey('⌫', 'backspace', undefined, 1),
      createKey('0', 'input', '0'),
      createKey('✕', 'close', undefined, 1),
    ],
  ],
}

export const numpadLayout: KeyboardLayout = {
  name: 'Numpad',
  rows: [
    [createKey('1', 'input', '1'), createKey('2', 'input', '2'), createKey('3', 'input', '3')],
    [createKey('4', 'input', '4'), createKey('5', 'input', '5'), createKey('6', 'input', '6')],
    [createKey('7', 'input', '7'), createKey('8', 'input', '8'), createKey('9', 'input', '9')],
    [
      createKey('.', 'input', '.'),
      createKey('0', 'input', '0'),
      createKey('⌫', 'backspace', undefined, 1),
    ],
    [createKey('Clear', 'clear', undefined, 1.5), createKey('Enter', 'enter', undefined, 1.5)],
  ],
}

export const symbolLayout: KeyboardLayout = {
  name: 'Symbol',
  rows: [
    [
      createKey('1', 'input', '1'),
      createKey('2', 'input', '2'),
      createKey('3', 'input', '3'),
      createKey('4', 'input', '4'),
      createKey('5', 'input', '5'),
      createKey('6', 'input', '6'),
      createKey('7', 'input', '7'),
      createKey('8', 'input', '8'),
      createKey('9', 'input', '9'),
      createKey('0', 'input', '0'),
    ],
    [
      createKey('!', 'input', '!'),
      createKey('@', 'input', '@'),
      createKey('#', 'input', '#'),
      createKey('$', 'input', '$'),
      createKey('%', 'input', '%'),
      createKey('^', 'input', '^'),
      createKey('&', 'input', '&'),
      createKey('*', 'input', '*'),
      createKey('(', 'input', '('),
      createKey(')', 'input', ')'),
    ],
    [
      createKey('~', 'input', '~'),
      createKey('`', 'input', '`'),
      createKey('_', 'input', '_'),
      createKey('-', 'input', '-'),
      createKey('+', 'input', '+'),
      createKey('=', 'input', '='),
      createKey('{', 'input', '{'),
      createKey('}', 'input', '}'),
      createKey('[', 'input', '['),
      createKey(']', 'input', ']'),
    ],
    [
      createKey('\\', 'input', '\\'),
      createKey('|', 'input', '|'),
      createKey(';', 'input', ';'),
      createKey(':', 'input', ':'),
      createKey("'", 'input', "'"),
      createKey('"', 'input', '"'),
      createKey('<', 'input', '<'),
      createKey('>', 'input', '>'),
      createKey(',', 'input', ','),
      createKey('.', 'input', '.'),
    ],
    [
      createKey('ABC', 'symbol', undefined, 2),
      createKey('Space', 'space', ' ', 5),
      createKey('/', 'input', '/'),
      createKey('?', 'input', '?'),
      createKey('✕', 'close', undefined, 1),
    ],
  ],
}

export const defaultLayouts = {
  qwerty: qwertyLayout,
  number: numberLayout,
  numpad: numpadLayout,
  symbol: symbolLayout,
}
