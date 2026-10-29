export const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
export const SHORT_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
export const HOURS = Array.from({ length: 11 }, (_, i) => i + 9);
export const SLOT_COUNT = DAYS.length * HOURS.length;
export const TIMEZONE = 'Europe/Moscow';
export const emptySlots = () => Array(SLOT_COUNT).fill(0);
export const slotIndex = (day, hourIndex) => day * HOURS.length + hourIndex;
export function applyPaint(slots, index, tool, value) {
  if (!Number.isInteger(index) || index < 0 || index >= SLOT_COUNT) return slots;
  if (tool === 'best' && slots[index] === 0) return slots;
  const next = slots.slice();
  next[index] = tool === 'best' ? (value ? 2 : 1) : (value ? 1 : 0);
  return next;
}
export function validateAnswer({ name, grade, slots }) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) return 'Укажите имя: от 1 до 80 символов.';
  if (!Number.isInteger(Number(grade)) || Number(grade) < 1 || Number(grade) > 11) return 'Выберите класс.';
  if (!Array.isArray(slots) || slots.length !== SLOT_COUNT || slots.some(v => !Number.isInteger(v) || v < 0 || v > 2)) return 'Не удалось прочитать сетку. Обновите страницу.';
  if (!slots.some(Boolean)) return 'Отметьте хотя бы один час, когда можете заниматься.';
  return '';
}
export function dayIntervals(slots, day, preferredOnly = false) {
  const result = [];
  let start = null;
  for (let row = 0; row <= HOURS.length; row++) {
    const value = row < HOURS.length ? slots[slotIndex(day, row)] : 0;
    const selected = preferredOnly ? value === 2 : value > 0;
    if (selected && start === null) start = row + 9;
    if (!selected && start !== null) { result.push(`${start}:00–${row + 9}:00`); start = null; }
  }
  return result;
}
export function exportAnswer(answer) {
  return {
    schemaVersion: 1, id: answer.id || null, studentId: null,
    name: answer.name.trim(), grade: Number(answer.grade), timezone: TIMEZONE,
    slotMinutes: 60, startHour: 9, endHour: 20,
    availability: answer.slots.flatMap((state, i) => state ? [{ weekday: Math.floor(i / 11) + 1, start: `${String(i % 11 + 9).padStart(2, '0')}:00`, end: `${String(i % 11 + 10).padStart(2, '0')}:00`, preferred: state === 2 }] : []),
    updatedAt: answer.updatedAt || null,
  };
}
