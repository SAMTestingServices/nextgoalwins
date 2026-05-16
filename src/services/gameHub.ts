import * as signalR from '@microsoft/signalr';
import { HUB_URL } from '../config';

let _connection: signalR.HubConnection | null = null;

export function getHubConnection(): signalR.HubConnection {
  if (!_connection) {
    _connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }
  return _connection;
}

export async function startHub(): Promise<signalR.HubConnection> {
  const conn = getHubConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
  return conn;
}
