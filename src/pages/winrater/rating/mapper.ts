import type { Category, Match } from './match'
import {
  Academy,
  Blackbox,
  Competitive,
  DivX,
  Faction,
  Fantasy_Football,
  FFB_Test,
  Ladder,
  League,
  Legacy_Blackbox,
  LRB4,
  Ranked,
  Score,
  Stunty_Leeg,
  Transfer,
  Transfer2,
  Unknown,
  Unranked
} from './match'
import Color from 'color'

export function category(input: FumbblMatch): Category {
  switch (input.division) {
    case 'Competitive':
      if (input.scheduler === 'Blackbox') {
        return Blackbox
      }
      return Competitive
    case 'Blackbox':
      return Legacy_Blackbox
    case 'League':
      return League
    case 'Ranked':
      return Ranked
    case 'Unranked':
      return Unranked
    case 'Stunty Leeg':
      return Stunty_Leeg
    case 'DivX Legacy':
      return DivX
    case 'Academy':
      return Academy
    case 'Faction':
      return Faction
    case 'FFB Test':
      return FFB_Test
    case 'Fantasy Football':
      return Fantasy_Football
    case 'LRB4':
      return LRB4
    case 'Transfer Division':
      return Transfer
    case 'Transfer Division 2':
      return Transfer2
    case 'Ladder':
      return Ladder
    default:
      return Unknown
  }
}

export function score(input: FumbblMatch, coachName: string): Score {
  if (input.team1.score === input.team2.score) {
    return Score.Draw
  }

  if (input.team1.score > input.team2.score === (input.team1.coach.name === coachName)) {
    return Score.Win
  }

  return Score.Loss
}

export function match(input: FumbblMatch, coachName: string): Match {
  return {
    id: input.id,
    score: score(input, coachName),
    category: category(input),
    dateTime: new Date(input.date + 'T' + (input.time || '00:00:00') + '+00:00')
  }
}

export function randomColor(): Color {
  return Color.rgb({ r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255 })
}
