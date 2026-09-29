import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  validateCourseManifest,
  validateModuleMeta,
  validatePracticeTask,
  validatePracticeTasks,
} from "@/lib/course/schema";
import type { LocalizedPracticeTask, PracticeTask } from "@/lib/course/types";

const root = process.cwd();
const courseRoot = join(root, "content/course");
const overviewRoot = join(courseRoot, "modules/00-overview");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function validPractice(): PracticeTask {
  const localized = (title: string): LocalizedPracticeTask => ({
    title,
    learnerBrief: "Review a short feature note and ask clarifying QA questions.",
    context: "A team wants to release a small profile form.",
    deliverable: "A list of risks, assumptions, and first test ideas.",
    aiTutorInstructions: {
      teachingGoal: "Help the learner separate facts, assumptions, and test ideas.",
      presentTaskHow: ["Ask for the learner's first pass before giving examples."],
      doNotReveal: ["Do not provide a finished artifact before the learner attempts the task."],
      reviewFor: ["Clear separation between risks, assumptions, and tests."],
      completionCriteria: ["The learner identifies at least one unclear requirement."],
      hintProgression: ["Ask what information is missing.", "Point to inputs and expected outcomes."],
      ifLearnerStruggles: ["Offer one small example question, then pause."],
      afterCompletion: ["Summarize one strength and one next skill to practice."],
    },
  });

  return {
    id: "00-overview-qa-mindset",
    moduleId: "00-overview",
    kind: "requirements-analysis",
    estimatedMinutes: 20,
    skillFocus: ["qa-mindset"],
    pillars: [],
    updatedAt: "2026-09-25",
    languages: {
      en: localized("First QA questions"),
      ru: localized("Первые вопросы QA"),
    },
  };
}

describe("AI-native course content contract", () => {
  it("parses the manifest, overview metadata, markdown, guide files, and bilingual practice", () => {
    const manifest = validateCourseManifest(readJson(join(courseRoot, "manifest.json")));
    const meta = validateModuleMeta(readJson(join(overviewRoot, "meta.json")));
    const practiceTasks = validatePracticeTasks(readJson(join(overviewRoot, "practice.json")));

    expect(manifest.defaultLanguage).toBe("en");
    expect(manifest.supportedLanguages).toEqual(["en", "ru"]);
    expect(manifest.title.en).toContain("Sprintest");
    expect(manifest.title.ru).toContain("Sprintest");
    expect(manifest.modules.map((module) => module.slug)).toContain("00-overview");

    expect(meta.slug).toBe("00-overview");
    expect(meta.title.en.length).toBeGreaterThan(0);
    expect(meta.title.ru.length).toBeGreaterThan(0);

    expect(readFileSync(join(courseRoot, "agent-guide.en.md"), "utf-8")).toContain("language");
    expect(readFileSync(join(courseRoot, "agent-guide.ru.md"), "utf-8")).toContain("язык");
    expect(readFileSync(join(overviewRoot, "en.md"), "utf-8")).toContain("# Course Overview");
    expect(readFileSync(join(overviewRoot, "ru.md"), "utf-8")).toContain("# Обзор курса");

    expect(practiceTasks.length).toBeGreaterThan(0);
    expect(practiceTasks[0].languages.en.title.length).toBeGreaterThan(0);
    expect(practiceTasks[0].languages.ru.title.length).toBeGreaterThan(0);
  });

  it.each(["reviewFor", "completionCriteria", "hintProgression", "doNotReveal"] as const)(
    "rejects practice data missing aiTutorInstructions.%s",
    (requiredField) => {
      const practice = validPractice();
      delete practice.languages.en.aiTutorInstructions[requiredField];

      expect(() => validatePracticeTask(practice)).toThrow(requiredField);
    },
  );

  it.each(["answerKey", "solution", "hiddenDefectId", "oracle"])(
    "rejects public practice data containing %s",
    (field) => {
      const practice = validPractice() as PracticeTask & Record<string, unknown>;
      practice[field] = "spoiler";

      expect(() => validatePracticeTask(practice)).toThrow(field);
    },
  );
});
