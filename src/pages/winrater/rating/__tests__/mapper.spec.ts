import { describe, expect, it } from 'vitest'

import * as mapper from '../mapper'
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
} from '../match'

describe('Rating Mapper', () => {
  describe('category', () => {
    it.each([
      {
        match: { division: 'Competitive', scheduler: 'Blackbox' } as FumbblMatch,
        category: Blackbox
      },
      {
        match: { division: 'Competitive', scheduler: 'None' } as FumbblMatch,
        category: Competitive
      },
      {
        match: { division: 'Competitive', scheduler: 'Gamefinder' } as FumbblMatch,
        category: Competitive
      },
      {
        match: { division: 'Blackbox', scheduler: 'None' } as FumbblMatch,
        category: Legacy_Blackbox
      },
      {
        match: { division: 'Blackbox', scheduler: 'Gamefinder' } as FumbblMatch,
        category: Legacy_Blackbox
      },
      {
        match: { division: 'League', scheduler: 'None' } as FumbblMatch,
        category: League
      },
      {
        match: { division: 'Ranked', scheduler: 'Gamefinder' } as FumbblMatch,
        category: Ranked
      },
      {
        match: { division: 'Ranked', scheduler: 'None' } as FumbblMatch,
        category: Ranked
      },
      {
        match: { division: 'Unranked', scheduler: 'None' } as FumbblMatch,
        category: Unranked
      },
      {
        match: { division: 'Stunty Leeg', scheduler: 'None' } as FumbblMatch,
        category: Stunty_Leeg
      },
      {
        match: { division: 'DivX Legacy', scheduler: 'None' } as FumbblMatch,
        category: DivX
      },
      {
        match: { division: 'Academy', scheduler: 'None' } as FumbblMatch,
        category: Academy
      },
      {
        match: { division: 'Faction', scheduler: 'None' } as FumbblMatch,
        category: Faction
      },
      {
        match: { division: 'FFB Test', scheduler: 'None' } as FumbblMatch,
        category: FFB_Test
      },
      {
        match: { division: 'Fantasy Football', scheduler: 'None' } as FumbblMatch,
        category: Fantasy_Football
      },
      { match: { division: 'LRB4', scheduler: 'None' } as FumbblMatch, category: LRB4 },
      {
        match: { division: 'Transfer Division', scheduler: 'None' } as FumbblMatch,
        category: Transfer
      },
      {
        match: { division: 'Transfer Division 2', scheduler: 'None' } as FumbblMatch,
        category: Transfer2
      },
      {
        match: { division: 'Ladder', scheduler: 'None' } as FumbblMatch,
        category: Ladder
      },
      {
        match: { division: 'Unknown', scheduler: 'None' } as FumbblMatch,
        category: Unknown
      }
    ])('maps $match.division and $match.scheduler to $category', (param) => {
      expect(mapper.category(param.match)).toBe(param.category)
    })
  })

  describe('score', () => {
    const coachName = 'coach'
    const opponentName = 'opponent'

    it.each([
      {
        match: {
          team1: {
            coach: { name: coachName },
            score: 1
          },
          team2: {
            coach: { name: opponentName },
            score: 1
          }
        } as FumbblMatch,
        score: Score.Draw,
        description: '1:1 as home',
        resultString: 'Draw'
      },
      {
        match: {
          team1: {
            coach: { name: opponentName },
            score: 2
          },
          team2: {
            coach: { name: coachName },
            score: 2
          }
        } as FumbblMatch,
        score: Score.Draw,
        description: '2:2 as away',
        resultString: 'Draw'
      },
      {
        match: {
          team1: {
            coach: { name: opponentName },
            score: 2
          },
          team2: {
            coach: { name: coachName },
            score: 1
          }
        } as FumbblMatch,
        score: Score.Loss,
        description: '2:1 as away',
        resultString: 'Loss'
      },
      {
        match: {
          team1: {
            coach: { name: coachName },
            score: 0
          },
          team2: {
            coach: { name: opponentName },
            score: 3
          }
        } as FumbblMatch,
        score: Score.Loss,
        description: '0:3 as home',
        resultString: 'Loss'
      },
      {
        match: {
          team1: {
            coach: { name: opponentName },
            score: 0
          },
          team2: {
            coach: { name: coachName },
            score: 2
          }
        } as FumbblMatch,
        score: Score.Win,
        description: '0:2 as away',
        resultString: 'Win'
      },
      {
        match: {
          team1: {
            coach: { name: coachName },
            score: 3
          },
          team2: {
            coach: { name: opponentName },
            score: 1
          }
        } as FumbblMatch,
        score: Score.Win,
        description: '3:1 as home',
        resultString: 'Win'
      }
    ])('maps $description to $resultString', (param) => {
      expect(mapper.score(param.match, coachName)).toBe(param.score)
    })
  })

  describe('match', () => {
    it('maps fumbbl match properly', () => {
      const input: FumbblMatch = {
        id: 123,
        division: 'Competitive',
        scheduler: 'Blackbox',
        team1: { coach: { name: 'coach1' }, score: 1 },
        team2: { coach: { name: 'coach2' }, score: 1 },
        date: '2020-10-30',
        time: '20:51:33'
      }

      const expectedDateTime = new Date('2020-10-30T20:51:33.000+00:00')

      const result = mapper.match(input, 'coach1')
      expect(result).toStrictEqual({
        id: 123,
        score: Score.Draw,
        category: Blackbox,
        dateTime: expectedDateTime
      })
    })
  })
})
