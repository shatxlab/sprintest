import {
  courseLanguages,
  type AiTutorInstructions,
  type CourseGlossaryTerm,
  type CourseLanguage,
  type CourseManifest,
  type CourseModuleMeta,
  type CourseModuleSummary,
  type CourseTrack,
  type LocalizedPracticeTask,
  type LocalizedText,
  type PracticeKind,
  type PracticeTask,
} from "./types";

const practiceKinds = new Set<PracticeKind>([
  "discussion",
  "test-design",
  "bug-report",
  "requirements-analysis",
  "api-analysis",
  "sql-analysis",
  "interview-practice",
  "bug-hunt",
  "json-analysis",
  "queue-analysis",
  "release-simulation",
  "automation-code",
  "automation-debug",
  "automation-review",
  "automation-workflow",
]);

const forbiddenPracticeKeys = new Map([
  ["answerkey", "answerKey"],
  ["solution", "solution"],
  ["hiddendefectid", "hiddenDefectId"],
  ["oracle", "oracle"],
]);

export class CourseContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourseContentValidationError";
  }
}

function fail(path: string, message: string): never {
  throw new CourseContentValidationError(`${path}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    fail(path, "expected object");
  }
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(path, "expected non-empty string");
  }
  return value;
}

function requireNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path, "expected finite number");
  }
  return value;
}

function requirePositiveInteger(value: unknown, path: string): number {
  const number = requireNumber(value, path);
  if (!Number.isInteger(number) || number <= 0) {
    fail(path, "expected positive integer");
  }
  return number;
}

function requireArray<T>(
  value: unknown,
  path: string,
  itemValidator: (item: unknown, itemPath: string) => T,
): T[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(path, "expected non-empty array");
  }
  return value.map((item, index) => itemValidator(item, `${path}[${index}]`));
}

function requireStringArray(value: unknown, path: string): string[] {
  return requireArray(value, path, requireString);
}

function optionalStringArray(value: unknown, path: string): string[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    fail(path, "expected array of strings");
  }
  return value.map((item, index) => requireString(item, `${path}[${index}]`));
}

function requireLanguage(value: unknown, path: string): CourseLanguage {
  const language = requireString(value, path);
  if (!courseLanguages.includes(language as CourseLanguage)) {
    fail(path, "expected supported language");
  }
  return language as CourseLanguage;
}

function requireLocalizedText(value: unknown, path: string): LocalizedText {
  const record = requireRecord(value, path);
  return {
    en: requireString(record.en, `${path}.en`),
    ru: requireString(record.ru, `${path}.ru`),
  };
}

function requireModuleSummary(value: unknown, path: string): CourseModuleSummary {
  const record = requireRecord(value, path);
  return {
    id: requireString(record.id, `${path}.id`),
    slug: requireString(record.slug, `${path}.slug`),
    order: requireNumber(record.order, `${path}.order`),
    title: requireLocalizedText(record.title, `${path}.title`),
    summary: requireLocalizedText(record.summary, `${path}.summary`),
    themes: requireStringArray(record.themes, `${path}.themes`),
    practiceTaskIds: requireStringArray(record.practiceTaskIds, `${path}.practiceTaskIds`),
  };
}

function requireTutorInstructions(value: unknown, path: string): AiTutorInstructions {
  const record = requireRecord(value, path);
  return {
    teachingGoal: requireString(record.teachingGoal, `${path}.teachingGoal`),
    presentTaskHow: requireStringArray(record.presentTaskHow, `${path}.presentTaskHow`),
    doNotReveal: requireStringArray(record.doNotReveal, `${path}.doNotReveal`),
    reviewFor: requireStringArray(record.reviewFor, `${path}.reviewFor`),
    completionCriteria: requireStringArray(record.completionCriteria, `${path}.completionCriteria`),
    hintProgression: requireStringArray(record.hintProgression, `${path}.hintProgression`),
    ifLearnerStruggles: requireStringArray(record.ifLearnerStruggles, `${path}.ifLearnerStruggles`),
    afterCompletion: requireStringArray(record.afterCompletion, `${path}.afterCompletion`),
  };
}

function requireLocalizedPractice(value: unknown, path: string): LocalizedPracticeTask {
  const record = requireRecord(value, path);
  return {
    title: requireString(record.title, `${path}.title`),
    learnerBrief: requireString(record.learnerBrief, `${path}.learnerBrief`),
    context: requireString(record.context, `${path}.context`),
    deliverable: requireString(record.deliverable, `${path}.deliverable`),
    aiTutorInstructions: requireTutorInstructions(
      record.aiTutorInstructions,
      `${path}.aiTutorInstructions`,
    ),
  };
}

function assertNoForbiddenPracticeKeys(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenPracticeKeys(item, `${path}[${index}]`));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const forbidden = forbiddenPracticeKeys.get(key.toLowerCase());
    if (forbidden) {
      fail(`${path}.${key}`, `forbidden public practice field ${forbidden}`);
    }
    assertNoForbiddenPracticeKeys(child, `${path}.${key}`);
  }
}

export function validateCourseManifest(value: unknown): CourseManifest {
  const record = requireRecord(value, "manifest");
  const manifest: CourseManifest = {
    version: requireString(record.version, "manifest.version"),
    defaultLanguage: requireLanguage(record.defaultLanguage, "manifest.defaultLanguage"),
    supportedLanguages: requireArray(
      record.supportedLanguages,
      "manifest.supportedLanguages",
      requireLanguage,
    ),
    title: requireLocalizedText(record.title, "manifest.title"),
    description: requireLocalizedText(record.description, "manifest.description"),
    tracks: optionalStringArray(record.tracks, "manifest.tracks"),
    modules: requireArray(record.modules, "manifest.modules", requireModuleSummary),
  };

  for (const language of courseLanguages) {
    if (!manifest.supportedLanguages.includes(language)) {
      fail("manifest.supportedLanguages", `missing ${language}`);
    }
  }

  const duplicateTrack = manifest.tracks.find(
    (track, index) => manifest.tracks.indexOf(track) !== index,
  );
  if (duplicateTrack) {
    fail("manifest.tracks", `duplicate track ${duplicateTrack}`);
  }

  return manifest;
}

export function validateCourseTrack(value: unknown): CourseTrack {
  const record = requireRecord(value, "track");
  const stages = requireArray(record.stages, "track.stages", (item, path) => {
    const stage = requireRecord(item, path);
    return {
      id: requireString(stage.id, `${path}.id`),
      title: requireLocalizedText(stage.title, `${path}.title`),
      blurb: requireLocalizedText(stage.blurb, `${path}.blurb`),
      modules: requireStringArray(stage.modules, `${path}.modules`),
    };
  });

  const highlights = requireRecord(record.highlights, "track.highlights");

  return {
    id: requireString(record.id, "track.id"),
    title: requireLocalizedText(record.title, "track.title"),
    intent: requireLocalizedText(record.intent, "track.intent"),
    summary: requireLocalizedText(record.summary, "track.summary"),
    highlights: {
      en: requireStringArray(highlights.en, "track.highlights.en"),
      ru: requireStringArray(highlights.ru, "track.highlights.ru"),
    },
    prompt: requireLocalizedText(record.prompt, "track.prompt"),
    artifact: requireLocalizedText(record.artifact, "track.artifact"),
    stages,
  };
}

export function validateGlossaryTerms(value: unknown): CourseGlossaryTerm[] {
  return requireArray(value, "glossary", (item, path) => {
    const record = requireRecord(item, path);
    return {
      id: requireString(record.id, `${path}.id`),
      term: requireString(record.term, `${path}.term`),
      definition: requireString(record.definition, `${path}.definition`),
    };
  });
}

export function validateModuleMeta(value: unknown): CourseModuleMeta {
  const record = requireRecord(value, "moduleMeta");
  return {
    ...requireModuleSummary(record, "moduleMeta"),
    updatedAt: requireString(record.updatedAt, "moduleMeta.updatedAt"),
  };
}

export function validatePracticeTask(value: unknown): PracticeTask {
  assertNoForbiddenPracticeKeys(value, "practice");
  const record = requireRecord(value, "practice");
  const kind = requireString(record.kind, "practice.kind");
  if (!practiceKinds.has(kind as PracticeKind)) {
    fail("practice.kind", "expected known practice kind");
  }

  const languages = requireRecord(record.languages, "practice.languages");
  return {
    id: requireString(record.id, "practice.id"),
    moduleId: requireString(record.moduleId, "practice.moduleId"),
    kind: kind as PracticeKind,
    estimatedMinutes: requirePositiveInteger(record.estimatedMinutes, "practice.estimatedMinutes"),
    skillFocus: requireStringArray(record.skillFocus, "practice.skillFocus"),
    pillars: optionalStringArray(record.pillars, "practice.pillars"),
    updatedAt: requireString(record.updatedAt, "practice.updatedAt"),
    languages: {
      en: requireLocalizedPractice(languages.en, "practice.languages.en"),
      ru: requireLocalizedPractice(languages.ru, "practice.languages.ru"),
    },
  };
}

export function validatePracticeTasks(value: unknown): PracticeTask[] {
  return requireArray(value, "practice", (item, itemPath) => {
    assertNoForbiddenPracticeKeys(item, itemPath);
    return validatePracticeTask(item);
  });
}
