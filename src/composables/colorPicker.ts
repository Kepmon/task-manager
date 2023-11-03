const addStylesToButtons = (colorPickerWrapper: HTMLDivElement) => {
  const colorPickerButtons = [...colorPickerWrapper.querySelectorAll('button')]

  if (colorPickerButtons.length === 0) return

  colorPickerButtons.forEach((buton) => {
    buton.style.backgroundColor = 'hsl(242 48% 58%)'
  })
}

const addStylesToModesButton = (colorPickerWrapper: HTMLDivElement) => {
  const colorModesButton = colorPickerWrapper.querySelector(
    '.vacp-format-switch-button'
  )

  if (colorModesButton == null) return

  colorModesButton.addEventListener('click', () => {
    addStylesToInputs(colorPickerWrapper)
  })
}

const addStylesToInputs = (colorPickerWrapper: null | HTMLDivElement) => {
  const html = document.querySelector('html')
  const isDarkTheme = html?.classList.contains('dark')

  if (colorPickerWrapper == null) return

  const colorPickerInputs = [
    ...colorPickerWrapper.querySelectorAll('input[type="text"]')
  ] as HTMLInputElement[]

  if (colorPickerInputs.length === 0) return

  colorPickerInputs.forEach((input) => {
    input.style.backgroundColor = isDarkTheme ? 'hsl(0 0% 25%)' : 'white'
    input.style.border = 'none'
  })
}

export const addStylesToColorPicker = (
  colorPicker: null | { $el: HTMLDivElement }
) => {
  if (colorPicker == null) return

  const colorPickerWrapper = colorPicker.$el

  if (colorPickerWrapper != null) {
    addStylesToButtons(colorPickerWrapper)
    addStylesToInputs(colorPickerWrapper)
    addStylesToModesButton(colorPickerWrapper)
  }
}
