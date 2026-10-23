import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** An AI agent skill from `.claude/skills/<name>/SKILL.md`, shown on the /quality page. */
export interface Skill {
  name: string;
  /** What the skill does: the first sentence of its description, without the "Use when" trigger. */
  summary: string;
  /** Path of the SKILL.md file relative to the repository root. */
  path: string;
}

/** Reads `name` and `description` from the YAML frontmatter of a SKILL.md file. */
export function parseSkillFrontmatter(markdown: string): { name: string; description: string } {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1];
  if (!frontmatter) throw new Error('SKILL.md has no frontmatter');
  const field = (key: string) => {
    const value = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(frontmatter)?.[1].trim();
    if (!value) throw new Error(`SKILL.md frontmatter has no "${key}"`);
    return value;
  };
  return { name: field('name'), description: field('description') };
}

/** The first sentence of a description, e.g. "Fix a bug test-first. Use when…" → "Fix a bug test-first." */
export function summarise(description: string): string {
  return /^.*?[.!?](?=\s|$)/.exec(description)?.[0] ?? description;
}

/** Loads every skill under `skillsDir`, sorted by name. */
export function loadSkills(skillsDir: string): Skill[] {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const { name, description } = parseSkillFrontmatter(
        readFileSync(join(skillsDir, entry.name, 'SKILL.md'), 'utf8'),
      );
      return {
        name,
        summary: summarise(description),
        path: `.claude/skills/${entry.name}/SKILL.md`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
