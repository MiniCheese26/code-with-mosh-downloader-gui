export type Settings = {
  sessionCookie: string,
  resolution: Resolution,
  downloadDir: string
}

export type Resolution = {
  width: number,
  height: number
}

export type DownloadQueueItem = {
  url: string,
  type: DownloadQueueItemType
}

export type DownloadQueueItemType = 'everything' | 'course' | 'video' | 'end';

export type AppNotification = {
  type: AppNotificationType,
  message: string
}

export type AppNotificationType = 'success' | 'error' | 'info';
