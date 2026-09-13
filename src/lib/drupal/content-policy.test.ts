import { describe, expect, test } from "bun:test";
import {
  DrupalContentUnavailableError,
  selectAuthoritativeContent,
} from "./content-policy";

describe("Drupal authoritative content policy", () => {
  test("strict Drupal mode returns authoritative empty collections without falling back", () => {
    const result = selectAuthoritativeContent("drupal", [], ["legacy"]);
    expect(result).toEqual([]);
  });

  test("strict Drupal mode fails closed when Drupal is unavailable", () => {
    expect(() =>
      selectAuthoritativeContent("drupal", null, ["legacy"]),
    ).toThrow(DrupalContentUnavailableError);
  });

  test("transitional auto mode may fall back when Drupal is unavailable or empty", () => {
    expect(selectAuthoritativeContent("auto", null, ["legacy"])).toEqual([
      "legacy",
    ]);
    expect(selectAuthoritativeContent("auto", [], ["legacy"])).toEqual([
      "legacy",
    ]);
  });

  test("explicit Supabase mode does not select Drupal data", () => {
    expect(selectAuthoritativeContent("supabase", ["drupal"], ["legacy"])).toEqual([
      "legacy",
    ]);
  });
});
