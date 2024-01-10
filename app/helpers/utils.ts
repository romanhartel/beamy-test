// Extract ID from incoming log requests

export const extractIdLog = (log: string[]): string => {
  return log[0].split('=')[1];
};

// Build output log files' fullpath

export const formLogFilePath = (dirPath: string, logID: string): string => {
  return `${dirPath}/${logID}.json`;
};
