import type { Subtask } from "../api/boardsTypes";

export const returnNumberOfCompletedSubtasks = (arr: Subtask[]) =>
  arr.filter((subtask) => subtask.isCompleted === true).length;
