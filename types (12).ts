import type { Meter, MeterReading, ReadingAssessment } from './types';

export function getLatestReading(meterId: string, readings: MeterReading[]) {
  return readings
    .filter((reading) => reading.meterId === meterId)
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())[0];
}

export function getPreviousReading(meterId: string, readings: MeterReading[]) {
  return readings
    .filter((reading) => reading.meterId === meterId)
    .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())[1];
}

export function assessReading(meter: Meter, value: number, readings: MeterReading[]): ReadingAssessment {
  const latest = getLatestReading(meter.id, readings);
  const consumption = latest ? value - latest.value : 0;

  return {
    consumption,
    isLowerThanPrevious: Boolean(latest && value < latest.value),
    isOutOfRange:
      (typeof meter.minValue === 'number' && value < meter.minValue) ||
      (typeof meter.maxValue === 'number' && value > meter.maxValue),
    isUnusualConsumption:
      latest !== undefined && meter.averageConsumption > 0 && Math.abs(consumption) > meter.averageConsumption * 10,
  };
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function statusText(status: Meter['status']) {
  const labels: Record<Meter['status'], string> = {
    ok: 'OK',
    due: 'Afventer',
    alarm: 'Alarm',
    service: 'Service',
  };
  return labels[status];
}

export function statusColor(status: Meter['status']) {
  const colors: Record<Meter['status'], string> = {
    ok: '#34d399',
    due: '#ffd166',
    alarm: '#ff6b6b',
    service: '#a78bfa',
  };
  return colors[status];
}
