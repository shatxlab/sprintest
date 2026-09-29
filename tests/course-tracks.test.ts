import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCourseManifest, validateCourseTrack } from "@/lib/course/schema";
import type { CourseTrack } from "@/lib/course/types";

const courseRoot = join(process.cwd(), "content/course");
const modulesRoot = join(courseRoot, "modules");
const INTERVIEW_MODULE = "12-final-words";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function loadTrack(id: string): CourseTrack {
  return validateCourseTrack(readJson(join(courseRoot, "tracks", `${id}.json`)));
}

const manifest = validateCourseManifest(readJson(join(courseRoot, "manifest.json")));
const tracks = manifest.tracks.map(loadTrack);
const moduleDirs = new Set(
  manifest.modules.map((module) => join(modulesRoot, module.slug)).filter((dir) => existsSync(dir)),
);

describe("course tracks", () => {
  it("lists the single QA track in the manifest", () => {
    expect(manifest.tracks).toEqual(["qa"]);
  });

  it("keeps the track file valid, self-consistent and bilingual", () => {
    for (const [index, id] of manifest.tracks.entries()) {
      const track = tracks[index];
      expect(existsSync(join(courseRoot, "tracks", `${id}.json`))).toBe(true);
      expect(track.id).toBe(id);
      expect(track.stages.length).toBeGreaterThan(0);
      expect(new Set(track.stages.map((stage) => stage.id)).size).toBe(track.stages.length);

      for (const language of ["en", "ru"] as const) {
        expect(track.title[language].length, `${id}.title.${language}`).toBeGreaterThan(0);
        expect(track.intent[language].length, `${id}.intent.${language}`).toBeGreaterThan(0);
        expect(track.summary[language].length, `${id}.summary.${language}`).toBeGreaterThan(0);
        expect(track.artifact[language].length, `${id}.artifact.${language}`).toBeGreaterThan(0);
        expect(track.highlights[language].length, `${id}.highlights.${language}`).toBeGreaterThanOrEqual(3);
      }
      expect(track.highlights.en.length).toBe(track.highlights.ru.length);
    }
  });

  it("keeps the connect prompt as the skill install instruction", () => {
    for (const track of tracks) {
      for (const language of ["en", "ru"] as const) {
        expect(track.prompt[language]).toContain("npx skills add shatxlab/sprintest");
      }
    }
  });

  it("references only real modules, with no duplicates inside the track", () => {
    for (const track of tracks) {
      const slugs = track.stages.flatMap((stage) => stage.modules);
      expect(slugs.length, track.id).toBeGreaterThan(0);
      expect(new Set(slugs).size, track.id).toBe(slugs.length);
      for (const slug of slugs) {
        expect(moduleDirs.has(join(modulesRoot, slug)), `${track.id} references ${slug}`).toBe(true);
      }
    }
  });

  it("covers the whole manifest with the single track", () => {
    const slugs = new Set(
      tracks.flatMap((track) => track.stages.flatMap((stage) => stage.modules)),
    );
    for (const module of manifest.modules) {
      expect(slugs.has(module.slug), `${module.slug} belongs to no track`).toBe(true);
    }
    expect(slugs.size).toBe(manifest.modules.length);
  });

  it("closes the course with the interview module", () => {
    for (const track of tracks) {
      const slugs = track.stages.flatMap((stage) => stage.modules);
      expect(slugs, track.id).toContain(INTERVIEW_MODULE);
      expect(slugs.at(-1), track.id).toBe(INTERVIEW_MODULE);
    }
  });

  it("keeps the automation stage holding exactly the Playwright modules", () => {
    const qa = tracks.find((track) => track.id === "qa")!;
    const stage = qa.stages.find((candidate) => candidate.id === "automation");
    expect(stage).toBeDefined();
    expect(stage!.modules).toEqual([
      "16-playwright-foundations",
      "17-playwright-locators",
      "18-playwright-api",
      "19-playwright-architecture",
      "20-playwright-debugging",
      "21-playwright-ci",
      "22-ai-assisted-automation",
    ]);
  });

  it("validates the track shape, and leaves module membership to the loader", () => {
    const track = loadTrack("qa");
    // Shape-only validation: an unknown module slug is caught by the loader against the
    // manifest, so it must not fail here or the two checks would report the same bug twice.
    expect(() =>
      validateCourseTrack({
        ...track,
        stages: [{ ...track.stages[0], modules: ["99-not-a-module"] }],
      }),
    ).not.toThrow();

    expect(() => validateCourseTrack({ ...track, stages: [] })).toThrow("track.stages");
    expect(() => validateCourseTrack({ ...track, highlights: { en: ["Read the DOM"] } })).toThrow(
      "track.highlights.ru",
    );
  });
});