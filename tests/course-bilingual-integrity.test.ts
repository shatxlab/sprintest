import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  validateCourseManifest,
  validateModuleMeta,
  validatePracticeTasks,
} from "@/lib/course/schema";

const courseRoot = join(process.cwd(), "content/course");
const modulesRoot = join(courseRoot, "modules");
const requiredPracticeInstructionFields = [
  "reviewFor",
  "completionCriteria",
  "hintProgression",
  "doNotReveal",
] as const;
const forbiddenPublicFields = ["answerKey", "solution", "hiddenDefectId", "oracle"];
const forbiddenContentPatterns = [
  /should use/i,
  /instead of/i,
  /\/apps\/banking/i,
  /\/docs\//i,
  /shatxlab/i,
  /mcp(\.|-)/i,
  /module workspace/i,
  /localStorage/i,
  /API console/i,
  /Submit as a PDF/i,
];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  if (typeof value !== "object" || value === null) return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    collectKeys(child, keys);
  }
  return keys;
}

describe("full AI-native bilingual course content", () => {
  it("has manifest coverage for every migrated module in order", () => {
    const manifest = validateCourseManifest(readJson(join(courseRoot, "manifest.json")));
    const dirs = readdirSync(modulesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(dirs).toHaveLength(23);
    expect(manifest.modules.map((module) => module.slug).sort()).toEqual(dirs);
    expect(manifest.modules.map((module) => module.order)).toEqual([...Array(23).keys()]);
  });

  it("has EN/RU markdown, metadata, and public-safe practice data for each module", () => {
    const manifest = validateCourseManifest(readJson(join(courseRoot, "manifest.json")));

    for (const module of manifest.modules) {
      const moduleRoot = join(modulesRoot, module.slug);
      const meta = validateModuleMeta(readJson(join(moduleRoot, "meta.json")));
      const practices = validatePracticeTasks(readJson(join(moduleRoot, "practice.json")));
      const enMarkdown = readFileSync(join(moduleRoot, "en.md"), "utf-8");
      const ruMarkdown = readFileSync(join(moduleRoot, "ru.md"), "utf-8");

      expect(meta.slug).toBe(module.slug);
      expect(meta.id).toBe(module.id);
      expect(meta.practiceTaskIds).toEqual(module.practiceTaskIds);
      // Manifest is the LIST copy, meta is the DETAIL copy: both are served, so
      // they must never disagree (the module list and the module page describe
      // the same module). Sync direction: manifest follows meta.
      expect(module.title, `${module.slug} title drift manifest vs meta`).toEqual(meta.title);
      expect(module.summary, `${module.slug} summary drift manifest vs meta`).toEqual(meta.summary);
      expect(practices.map((task) => task.moduleId)).toEqual([module.id, ...Array(practices.length - 1).fill(module.id)]);
      for (const task of practices) {
        expect(module.practiceTaskIds).toContain(task.id);
      }
      expect(enMarkdown).toMatch(/^# /);
      expect(ruMarkdown).toMatch(/^# /);

      for (const language of ["en", "ru"] as const) {
        for (const practice of practices) {
          const localized = practice.languages[language];
          expect(localized.title.length).toBeGreaterThan(0);
          expect(localized.learnerBrief.length).toBeGreaterThan(0);
          expect(localized.context.length).toBeGreaterThan(0);
          expect(localized.deliverable.length).toBeGreaterThan(0);
          for (const field of requiredPracticeInstructionFields) {
            expect(localized.aiTutorInstructions[field].length, `${module.slug}.${language}.${field}`).toBeGreaterThan(0);
          }
        }
      }

      const allText = [enMarkdown, ruMarkdown, JSON.stringify(practices)].join("\n");
      for (const pattern of forbiddenContentPatterns) {
        expect(allText, `${module.slug} contains ${pattern}`).not.toMatch(pattern);
      }
      for (const key of forbiddenPublicFields) {
        expect(collectKeys(practices).has(key), `${module.slug} exposes ${key}`).toBe(false);
      }
    }
  });

  it("keeps top-level course resources free of legacy workflow and spoiler markers", () => {
    const topLevelContent = [
      "manifest.json",
      "agent-guide.en.md",
      "agent-guide.ru.md",
      "glossary/en.json",
      "glossary/ru.json",
    ]
      .map((file) => readFileSync(join(courseRoot, file), "utf-8"))
      .join("\n");

    for (const pattern of forbiddenContentPatterns) {
      expect(topLevelContent, `top-level course content contains ${pattern}`).not.toMatch(pattern);
    }
    for (const key of forbiddenPublicFields) {
      expect(topLevelContent, `top-level course content exposes ${key}`).not.toContain(key);
    }
  });

  it("has compact localized glossary payloads", () => {
    const en = readJson(join(courseRoot, "glossary/en.json"));
    const ru = readJson(join(courseRoot, "glossary/ru.json"));

    expect(Array.isArray(en)).toBe(true);
    expect(Array.isArray(ru)).toBe(true);
    expect((en as unknown[]).length).toBeGreaterThanOrEqual(10);
    expect((ru as unknown[]).length).toBe((en as unknown[]).length);
    for (const terms of [en, ru] as Array<unknown>) {
      for (const term of terms as Array<Record<string, unknown>>) {
        expect(typeof term.id).toBe("string");
        expect(typeof term.term).toBe("string");
        expect(typeof term.definition).toBe("string");
      }
    }
  });
});
