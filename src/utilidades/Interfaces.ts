export interface IdsGrupMatr {
  idMatr: number
  grupos: number[]
}
export interface IdsAsig {
  idAsig: number
  seme: number
}
export interface Contenido {
  id: number
  name: string
  status: string
}
export interface MapaCarrera {
  [key: number]: Contenido[]
}
export interface Grupo {
  id: number
  name: string
}
export interface Horario {
  name: string
  hourStart: Date
  hourEnd: Date
  teacher?: string 
  group: Grupo
  room: string
}
export interface MapaHorario {
  monday: Horario[]
  tuesday: Horario[]
  wednesday: Horario[]
  thursday: Horario[]
  friday: Horario[]
  saturday: Horario[]
}

export interface Day {
  date: string
  hourStart: Date
  hourEnd: Date
}

export interface Group {
  id: string
  name: string
  days: Day[]
  isSelected?: boolean
}

export interface Subject {
  id: string
  name: string
  semester: number
  credits: number
  isObligatory: boolean
  isEnrolled?: boolean
  groups: Group[]
}
