import { useBoardsStore } from '../stores/boards'

export const returnCircleColor = (
  index: number,
  dotColor: null | undefined | string
) => {
  const boardsStore = useBoardsStore()
  const dotColors = {
    0: 'hsl(193 75% 59%)',
    1: 'hsl(249 75% 70%)',
    2: 'hsl(155 75% 70%)'
  }
  if (boardsStore.boardColumns.length > 0) {
    const noDotColorGiven = dotColors[(index % 3) as keyof typeof dotColors]
    return dotColor ? dotColor : noDotColorGiven
  }

  return 'black'
}
