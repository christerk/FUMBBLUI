export interface SkillAllowance {
  label: string;
  maxPlayers: number;
  maxSkillsPerPlayer: number;
  allowedSkillTypes: string[];
  costSchedule: Record<string, number>[];
}

export interface SkillPackage {
  name: string;
  allowances: SkillAllowance[];
}
