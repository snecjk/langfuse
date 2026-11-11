import { globSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { type Messages } from "../../src/features/i18n/messages";

function parameters(message: string) {
  return [
    ...new Set([...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1])),
  ]
    .sort()
    .join(",");
}

async function main() {
  let entries = 0;
  for (const file of globSync("src/features/i18n/messages/*.ts")) {
    const namespaces = (await import(
      pathToFileURL(resolve(file)).href
    )) as Record<string, Messages>;
    for (const [namespace, messages] of Object.entries(namespaces)) {
      for (const key of new Set([
        ...Object.keys(messages.en),
        ...Object.keys(messages["zh-CN"]),
      ])) {
        const english = messages.en[key];
        const chinese = messages["zh-CN"][key];
        if (english === undefined || chinese === undefined) {
          throw new Error(`${namespace}.${key}: missing translation`);
        }
        const englishTemplates =
          typeof english === "string" ? [english] : Object.values(english);
        const chineseTemplates =
          typeof chinese === "string" ? [chinese] : Object.values(chinese);
        const expected = parameters(englishTemplates[0]!);
        for (const template of [...englishTemplates, ...chineseTemplates]) {
          if (!template || parameters(template) !== expected) {
            throw new Error(
              `${namespace}.${key}: empty message or parameter mismatch`,
            );
          }
        }
        entries++;
      }
    }
  }
  if (entries === 0) throw new Error("No interface translations found");
  console.log(`Translations: ${entries} bilingual entries verified`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
