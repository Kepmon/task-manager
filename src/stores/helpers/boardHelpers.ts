import type { CollectionReference, DocumentData } from 'firebase/firestore'
import type { Board } from '../../api/boardsTypes'
import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserStore } from '../user'

export const returnColumnsColRef = (
  boardsColRefGlobal: null | CollectionReference<DocumentData>,
  boardID?: Board['boardID']
) => {
  const userStore = useUserStore()
  const currentBoardID = boardID || userStore.userData.currentBoard.boardID

  const columnsColRef = collection(
    db,
    `${boardsColRefGlobal?.path}/${currentBoardID}/columns`
  )
  const columnsColRefOrdered = query(columnsColRef, orderBy('createdAt', 'asc'))

  return { columnsColRef, columnsColRefOrdered }
}
