// utils/formatTimestamp.ts

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + "년 전";
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + "달 전";
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + "일 전";
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + "시간 전";
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + "분 전";
  }
  if (seconds < 10) {
    return "방금 전";
  }
  return Math.floor(seconds) + "초 전";
}
