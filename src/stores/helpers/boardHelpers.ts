import type { Board } from '../../api/boardsTypes'
import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserStore } from '../user'
import { useBoardsStore } from '../boards'

export const returnColumnsColRef = (boardID?: Board['boardID']) => {
  const userStore = useUserStore()
  const boardsStore = useBoardsStore()
  const currentBoardID =
    boardID != null ? boardID : userStore.userData.currentBoard.boardID

  const columnsColRef = collection(
    db,
    `${boardsStore.boardsColRefGlobal?.path}/${currentBoardID}/columns`
  )
  const columnsColRefOrdered = query(columnsColRef, orderBy('createdAt', 'asc'))

  return { columnsColRef, columnsColRefOrdered }
}
