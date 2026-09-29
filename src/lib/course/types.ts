export const courseLanguages = ["en", "ru"] as const;

export type CourseLanguage = (typeof courseLanguages)[number];

export type LocalizedText = Record<CourseLanguage, string>;

export type LocalizedTextList = Record<CourseLanguage, string[]>;

export type CourseTrackStage = {
  id: string;
  title: LocalizedText;
  blurb: LocalizedText;
  modules: string[];
};

export type CourseTrack = {
  id: string;
  title: LocalizedText;
  intent: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedTextList;
  prompt: LocalizedText;
  artifact: LocalizedText;
  stages: CourseTrackStage[];
};

export type CourseModuleSummary = {
  id: string;
  slug: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
  themes: string[];
  practiceTaskIds: string[];
};

export type CourseManifest = {
  version: string;
  defaultLanguage: CourseLanguage;
  supportedLanguages: CourseLanguage[];
  title: LocalizedText;
  description: LocalizedText;
  tracks: string[];
  modules: CourseModuleSummary[];
};

export type CourseModuleMeta = CourseModuleSummary & {
  updatedAt: string;
};

export type PracticeKind =
  | "discussion"
  | "test-design"
  | "bug-report"
  | "requirements-analysis"
  | "api-analysis"
  | "sql-analysis"
  | "interview-practice"
  | "bug-hunt"
  | "json-analysis"
  | "queue-analysis"
  | "release-simulation"
  | "automation-code"
  | "automation-debug"
  | "automation-review"
  | "automation-workflow";

export type AiTutorInstructions = {
  teachingGoal: string;
  presentTaskHow: string[];
  doNotReveal: string[];
  reviewFor: string[];
  completionCriteria: string[];
  hintProgression: string[];
  ifLearnerStruggles: string[];
  afterCompletion: string[];
};

export type LocalizedPracticeTask = {
  title: string;
  learnerBrief: string;
  context: string;
  deliverable: string;
  aiTutorInstructions: AiTutorInstructions;
};

export type PracticeTask = {
  id: string;
  moduleId: string;
  languages: Record<CourseLanguage, LocalizedPracticeTask>;
  kind: PracticeKind;
  estimatedMinutes: number;
  skillFocus: string[];
  pillars: string[];
  updatedAt: string;
};

export type AgentGuide = {
  version: string;
  language: CourseLanguage;
  markdown: string;
};

export type CourseGlossaryTerm = {
  id: string;
  term: string;
  definition: string;
};

export type LocalizedCourseGlossary = {
  version: string;
  language: CourseLanguage;
  terms: CourseGlossaryTerm[];
};

export type LocalizedCourseTrack = {
  id: string;
  title: string;
  intent: string;
  summary: string;
  highlights: string[];
  prompt: string;
  artifact: string;
  moduleSlugs: string[];
};

export type LocalizedCourseManifest = {
  version: string;
  language: CourseLanguage;
  title: string;
  description: string;
  agentGuideUrl: string;
  defaultTrack: string;
  tracks: LocalizedCourseTrack[];
  track?: LocalizedCourseTrack;
  modules: Array<{
    id: string;
    slug: string;
    order: number;
    title: string;
    summary: string;
    themes: string[];
    practiceTaskIds: string[];
    tracks: string[];
  }>;
};

export type LocalizedCourseModule = {
  version: string;
  language: CourseLanguage;
  module: {
    id: string;
    slug: string;
    order: number;
    title: string;
    summary: string;
    markdown: string;
    themes: string[];
    practiceTaskIds: string[];
    tracks: string[];
    updatedAt: string;
  };
};

export type LocalizedPractice = {
  version: string;
  language: CourseLanguage;
  practice: {
    id: string;
    moduleId: string;
    kind: PracticeKind;
    title: string;
    learnerBrief: string;
    context: string;
    deliverable: string;
    aiTutorInstructions: AiTutorInstructions;
    estimatedMinutes: number;
    skillFocus: string[];
    pillars: string[];
    updatedAt: string;
  };
};
