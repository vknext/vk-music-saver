import { createContext, useContext } from 'react';

const TaskIdContext = createContext<string>('');

export const useTaskId = () => useContext(TaskIdContext);

export const TaskIdProvider = TaskIdContext.Provider;
