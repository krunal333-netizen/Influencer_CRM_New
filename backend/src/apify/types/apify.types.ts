export interface InstagramProfileData {
  username: string;
  fullName: string;
  bio: string;
  followersCount: number;
  profilePictureUrl: string;
  profileUrl: string;
  emails?: string[];
}

export interface ApifyRunResult {
  profileData: InstagramProfileData | null;
  emails: string[];
  success: boolean;
  error?: string;
}

export enum ApifyRunStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  TIMED_OUT = 'TIMED_OUT',
  ABORTED = 'ABORTED'
}