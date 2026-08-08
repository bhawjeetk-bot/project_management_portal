import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SocketEvent {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private eventsSubject = new Subject<SocketEvent>();
  events$ = this.eventsSubject.asObservable();

  connect(projectId: number, token: string) {
    this.disconnect();
    const url = `${environment.wsUrl}/projects/${projectId}/?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SocketEvent;
        this.eventsSubject.next(data);
      } catch {
        // Ignore malformed messages
      }
    };

    this.socket.onerror = (err) => {
      console.error('WebSocket error', err);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
