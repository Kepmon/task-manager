export const returnCircleColor = (
  index: number,
  dotColor: null | undefined | string,
  addForm: boolean
) => {
  const dotColors = {
    0: 'hsl(193 75% 59%)',
    1: 'hsl(249 75% 70%)',
    2: 'hsl(155 75% 70%)'
  }

  const noDotColorGiven = dotColors[(index % 3) as keyof typeof dotColors]
  return dotColor && addForm === false ? dotColor : noDotColorGiven
}
