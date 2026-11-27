import { normalizeExternalUrl } from "../url.ts";

const assertEqual = <T>(actual: T, expected: T, message: string): void => {
  if (actual !== expected) {
    throw new Error(`${message} — expected ${String(expected)}, got ${String(actual)}`);
  }
};

assertEqual(normalizeExternalUrl(undefined), null, "undefined → null");
assertEqual(normalizeExternalUrl("   "), null, "blank → null");
assertEqual(
  normalizeExternalUrl("pokedex-five-steel.vercel.app"),
  "https://pokedex-five-steel.vercel.app",
  "missing protocol gets https://"
);
assertEqual(
  normalizeExternalUrl("https://apenasgabs.dev/path"),
  "https://apenasgabs.dev/path",
  "https URL kept"
);
assertEqual(normalizeExternalUrl("http://example.com"), "http://example.com", "http URL kept");
assertEqual(normalizeExternalUrl("javascript:alert(1)"), null, "javascript: rejected");
assertEqual(normalizeExternalUrl("mailto:a@b.com"), null, "mailto: rejected");
assertEqual(normalizeExternalUrl("localhost"), null, "hostname without TLD rejected");

console.log("✔ url.test.ts: 8/8 assertions passed");
