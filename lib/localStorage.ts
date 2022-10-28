export function getDeviceId() {
  return localStorage.getItem('deviceId') || undefined;
}
