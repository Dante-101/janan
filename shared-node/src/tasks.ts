import * as BPromise from 'bluebird'

export type TaskType = () => Promise<void>

export const runTasks = async (tasks: TaskType[], concurrency: number = 1): Promise<void> => {
    await BPromise.map(tasks, task => task(), { concurrency }).then(() => { })
}