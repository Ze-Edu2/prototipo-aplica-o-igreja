export type UserRole = 'ADM' | 'Membro';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Member {
  id: string;
  name: string;
  role: string; // e.g. Pastor, Diácono, Membro, Presbítero, etc.
  phone: string;
  email: string;
  joinDate: string; // YYYY-MM-DD
  baptismDate: string; // YYYY-MM-DD
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO String
  authorName: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DDThh:mm
  location: string;
}

export interface Study {
  id: string;
  title: string;
  author: string;
  content: string; // Markdown or plain text, expandable
  category: string;
  date: string; // YYYY-MM-DD
}

export interface PrayerRequest {
  id: string;
  senderName: string;
  message: string;
  date: string; // ISO String
  whatsappStatus: 'pending' | 'success' | 'failed';
  whatsappError?: string;
}

export type TransactionType = 'dizimo' | 'oferta' | 'despesa';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  memberId?: string; // only for 'dizimo'
  memberName?: string; // name of the member for dizimo, or custom text
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
}

export interface PhotoAlbum {
  id: string;
  name: string;
  coverUrl?: string;
  createdAt: string; // ISO String
}

export interface Photo {
  id: string;
  albumId: string;
  url: string; // Base64 or mock placeholder URL
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO String
  read: boolean;
}

export interface Settings {
  whatsappPhone: string;     // Phone for CallMeBot
  whatsappApiKey: string;    // ApiKey for CallMeBot
  nativeNotificationsEnabled: boolean;
}
