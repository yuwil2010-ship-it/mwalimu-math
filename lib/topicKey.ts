export const makeFullKey = (subject: string, form: string, topic: string) => {
  // Muhimu: Notes page na Pdfs page zote zitumie hii function
  return `${subject} - ${form} - ${topic}`.trim()
}

// Kwa Mazoezi
export const makeMazoeziKey = (subject: string, form: string, topic: string) => {
  return `${subject} - Mazoezi - ${form} - ${topic}`
}

// Kwa Bonus
export const makeBonusKey = (subject: string, bonusForm: string, yearTopic: string) => {
  return `${subject} - ${bonusForm} - ${yearTopic}`
}