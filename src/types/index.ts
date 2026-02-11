
export enum ProjectStatus {
  PLANNING = '설계중',
  IN_PROGRESS = '진행중',
  REVIEW = '검수중',
  COMPLETED = '완료'
}

export enum ReportCategory {
  INSTALLATION = '설치',
  WIRING = '배선',
  SAFETY = '안전',
  ISSUE = '이슈/장애'
}

export interface Site {
  id: string;
  name: string;
  address: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
}

export interface SitePhoto {
  id: string;
  url: string;
  category: string;
  timestamp: string;
  description: string;
}

export interface FieldReport {
  id: string;
  projectId: string;
  siteId?: string;
  technicianName: string;
  content: string;
  photos: SitePhoto[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  location?: string;
  partnerCompany?: string;
  status: ProjectStatus;
  progress: number;
  lastUpdated: string;
  reports: FieldReport[];
  sites: Site[];
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  address: string;
  technicians: Technician[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'SUPER' | 'ADMIN' | 'TECHNICIAN';
  partnerId?: string;
  partnerName?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export interface AppState {
  projects: Project[];
  partners: Partner[];
  currentUser: User | null;
}
