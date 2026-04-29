export type RunResult = "clear" | "dead";

export type PlayerClassType = "warrior" | "mage" | "archer";

export type MonsterGrade = "normal" | "enhanced" | "elite";

export type SkillId = "nullPointer" | "memoryLeak" | "threadCrash";

export type PassiveId = "cpuBoost" | "garbageCollector" | "stackOverflow";

export type LevelUpOptionType = "stat";

export type StatUpgradeId =
  | "attackSpeed"
  | "expGain"
  | "attackCount"
  | "damage"
  | "criticalChance"
  | "criticalDamage"
  | "moveSpeed"
  | "attackRange";

export type StatStacks = Record<StatUpgradeId, number>;

export type BasicAttackType = "singleHit" | "multiHit";

export type KarmaElementId = "fire" | "electric" | "rock";

export type BasicKarmaId = KarmaElementId;

export type KarmaId = KarmaElementId;

export type KarmaCounts = Record<KarmaId, number>;

export type KarmaBuildId =
  | "none"
  | "inferno"
  | "glacier"
  | "bloom"
  | "greed"
  | "abyss"
  | "chaos";

export type KarmaBuildState = {
  id: KarmaBuildId;
  name: string;
  tier: number;
  successRate: number;
  failStacks: number;
  lastResult: string;
};

export type KarmaElementState = {
  id: KarmaElementId;
  level: number;
  exp: number;
  requiredExp: number;
  damageMultiplier: number;
  count: number;
  range: number;
  hitboxRadius: number;
};

export type KarmaElements = Record<KarmaElementId, KarmaElementState>;

export type KarmaSelectionState = {
  selectedElementIds: KarmaElementId[];
  maxSelectedElementCount: number;
  pendingOptions: KarmaElementId[];
};

export type KarmaAutoSkillState = {
  id: KarmaElementId;
  level: number;
  exp: number;
  baseCooldownMs: number;
  currentCooldownMs: number;
  nextCastAt: number;
  damageMultiplier: number;
  hitCount: number;
  range: number;
  hitboxRadius: number;
};

export type OwnedSkill = {
  id: SkillId;
  level: number;
};

export type OwnedPassive = {
  id: PassiveId;
  level: number;
};

export type LevelUpOption = {
  id: StatUpgradeId;
  type: LevelUpOptionType;
  targetId: StatUpgradeId;
  name: string;
  description: string;
  currentStack?: number;
};

export type PlayerState = {
  classType: PlayerClassType;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  baseDamage: number;
  damage: number;
  baseAttackRange: number;
  attackRange: number;
  moveSpeed: number;
  pickupRadius: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  expMultiplier: number;
  criticalChance: number;
  criticalDamageMultiplier: number;
  attackCount: number;
  basicAttackType: BasicAttackType;
  statStacks: StatStacks;
  karmaCounts: KarmaCounts;
  karmaBuild: KarmaBuildState;
  karmaElements: KarmaElements;
  karmaSelection: KarmaSelectionState;
  karmaAutoSkills: Record<KarmaElementId, KarmaAutoSkillState>;
  skills: OwnedSkill[];
  passives: OwnedPassive[];
};
