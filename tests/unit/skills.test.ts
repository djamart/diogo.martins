import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkills, parseSkillFrontmatter, summarise } from '../../src/quality/skills';

describe('parseSkillFrontmatter', () => {
  it('reads the name and description', () => {
    const markdown = '---\nname: add-page\ndescription: Add a page. Use when asked.\n---\n\n# Add';
    expect(parseSkillFrontmatter(markdown)).toEqual({
      name: 'add-page',
      description: 'Add a page. Use when asked.',
    });
  });

  it('rejects a file without frontmatter', () => {
    expect(() => parseSkillFrontmatter('# Add a page')).toThrow(/no frontmatter/);
  });

  it('rejects frontmatter without a description', () => {
    expect(() => parseSkillFrontmatter('---\nname: add-page\n---')).toThrow(/"description"/);
  });
});

describe('summarise', () => {
  it('keeps the first sentence and drops the trigger', () => {
    expect(summarise('Fix a bug test-first. Use for any bug report.')).toBe(
      'Fix a bug test-first.',
    );
  });

  it('does not split on a dot inside a word', () => {
    expect(summarise('Edit CLAUDE.md and the skills. Use when asked.')).toBe(
      'Edit CLAUDE.md and the skills.',
    );
  });

  it('keeps a description that has a single sentence without a full stop', () => {
    expect(summarise('Add a page')).toBe('Add a page');
  });
});

describe('loadSkills', () => {
  const skills = loadSkills(join(process.cwd(), '.claude', 'skills'));

  it('loads every skill in the repository, sorted by name', () => {
    const names = skills.map((skill) => skill.name);
    expect(names).toContain('add-page');
    expect(names).toEqual([...names].sort());
  });

  it('links each skill to its SKILL.md and summarises it in one sentence', () => {
    for (const skill of skills) {
      expect(skill.path, skill.name).toBe(`.claude/skills/${skill.name}/SKILL.md`);
      expect(skill.summary, skill.name).toMatch(/^[A-Z].*\.$/);
      expect(skill.summary, skill.name).not.toMatch(/Use (when|for|it)/);
    }
  });
});
