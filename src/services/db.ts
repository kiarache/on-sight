
import { Project, Partner, User, AuditLog } from '@/types';

const API_BASE_URL = '/api';

class DBService {
  private token: string | null = localStorage.getItem('onsight_token');

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const headers: any = {
      ...options.headers
    };

    // FormData가 아닌 경우에만 JSON Content-Type 설정
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // 타임아웃 컨트롤러 추가 (5초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
        ...options, 
        headers,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      if (response.status === 401 || response.status === 403) {
        // 로그인/회원가입 요청에서 401이 발생한 경우는 세션 만료가 아닌 요청 실패이므로 예외 처리
        if (endpoint !== '/login' && endpoint !== '/check-username' && endpoint !== '/register') {
          this.logout();
          window.location.hash = '/';
          throw new Error('보안 세션이 만료되었습니다. 안전한 이용을 위해 다시 로그인해 주세요.');
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('서버로부터 올바르지 않은 응답을 받았습니다. (Not JSON)');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 요청 실패');
      }
      
      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('서버 응답 시간이 초과되었습니다. 네트워크 상태를 확인하세요.');
      }
      throw err;
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    try {
      const data = await this.fetchAPI('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (data && data.token) {
        this.token = data.token;
        localStorage.setItem('onsight_token', data.token);
        localStorage.setItem('onsight_user', JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('Login Error:', err);
      throw err;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('onsight_token');
    localStorage.removeItem('onsight_user');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('onsight_user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return this.fetchAPI(`/${storeName}`);
  }

  async save(storeName: string, data: any) {
    return this.fetchAPI(`/${storeName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitReport(projectId: string, report: any) {
    if (report instanceof FormData) {
      // FormData인 경우 projectId를 FormData에 포함시켜야 함 (이미 포함되어 있을 수도 있음)
      if (!report.has('projectId')) report.append('projectId', projectId);
      
      const options: RequestInit = {
        method: 'POST',
        headers: {}, // 브라우저가 boundary를 포함한 multipart/form-data를 자동 설정하게 빈 객체 전달
        body: report,
      };
      
      // fetchAPI를 직접 호출하지 않고 fetch를 호출하거나 fetchAPI를 개선해야 함
      // fetchAPI를 개선하여 headers가 null인 경우 Content-Type을 설정하지 않도록 수정
      return this.fetchAPI('/reports', options);
    }

    return this.fetchAPI('/reports', {
      method: 'POST',
      body: JSON.stringify({ projectId, report }),
    });
  }

  async delete(storeName: string, id: string) {
    return this.fetchAPI(`/${storeName}/${id}`, { method: 'DELETE' });
  }

  async log(userId: string, username: string, action: string, targetType: string, targetId: string, details: string) {
    const log: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId, username, action, targetType, targetId, details
    };
    try {
      await this.save('auditLogs', log);
    } catch (e) {
      console.warn('Log save failed', e);
    }
  }

  /** @deprecated 서버에서 bcrypt로 해싱 처리됨. 클라이언트에서 해싱은 불필요합니다. */
  async hashPassword(_password: string): Promise<string> {
    throw new Error('클라이언트에서 비밀번호 해싱은 지원하지 않습니다. 서버에서 처리됩니다.');
  }

  getServerStatus() {
    return !!this.token;
  }
}

export const db = new DBService();
