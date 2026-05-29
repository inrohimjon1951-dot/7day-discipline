import type { TaskDefinition, TaskLog } from '@/types'

export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'namoz',
    name: '5 Vaqt Namoz',
    sub: 'Namozlarni belgilang va zikrlarni yozing',
    type: 'sub',
    subs: ['Bomdod', 'Peshin', 'Asr', 'Shom', 'Xufton'],
  },
  {
    id: 'quron',
    name: "Qur'on Yodlash",
    sub: 'Har kuni 5 oyat',
    type: 'input',
    fields: [
      { placeholder: 'Sura nomi', key: 'sura' },
      { placeholder: 'Oyat raqamlari (mas: 1-5)', key: 'oyatlar' },
    ],
  },
  {
    id: 'hadis',
    name: "Hadis O'rganish",
    sub: "Har kuni 1 hadis yod oling",
    type: 'input',
    fields: [
      { placeholder: 'Hadis mavzusi yoki matni', key: 'hadis' },
      { placeholder: "O'zi tushunishi (qisqacha)", key: 'tushuncha' },
    ],
  },
  {
    id: 'podcast',
    name: 'Podcast / Maqola',
    sub: 'Haftasiga 1 marta',
    type: 'input',
    isWeekly: true,
    fields: [
      { placeholder: 'Nom yoki havola', key: 'link' },
      { placeholder: 'Qisqa xulosa', key: 'xulosa' },
    ],
  },
  {
    id: 'kitob',
    name: 'Badiiy Kitob',
    sub: "Har kuni 10 bet o'qish",
    type: 'input',
    fields: [
      { placeholder: 'Kitob nomi', key: 'kitob' },
      { placeholder: 'Muallif', key: 'muallif' },
      { placeholder: "Bugun o'qilgan betlar (mas: 45-55)", key: 'betlar' },
    ],
  },
  {
    id: 'calisthenics',
    name: 'Calisthenics',
    sub: "Qancha, qayeriga ishlagani",
    type: 'input',
    fields: [
      { placeholder: 'Mashq turi (mas: Pull-up, Dip, Push-up)', key: 'mashq' },
      { placeholder: 'Soni / vaqt (mas: 5x10)', key: 'takror' },
    ],
  },
  {
    id: 'zikr',
    name: 'Zikrlar',
    sub: 'Qaysi zikrni necha marta',
    type: 'input',
    fields: [
      { placeholder: 'Zikr (mas: SubhanAllah)', key: 'zikr' },
      { placeholder: 'Soni (mas: 100)', key: 'son' },
    ],
  },
]

export const NAMOZ_VAQTLARI = ['Bomdod', 'Peshin', 'Asr', 'Shom', 'Xufton']

export const EMOJIS = ['❤️', '😂', '🙂‍↕️', '🫡', '✌🏼', '🔥', '👍🏻', '🤫', '😮‍💨', '💀', '✊🏼', '🔔']

export function isTaskComplete(task: TaskDefinition, log?: TaskLog | null): boolean {
  if (!log) return false
  if (task.type === 'sub') {
    const subs = log.sub_data?.['subs'] || []
    return subs.length >= (task.subs?.length ?? 0)
  }
  if (task.fields) {
    return task.fields.every(f => !!log.input_data?.[f.key]?.trim())
  }
  return log.completed
}
