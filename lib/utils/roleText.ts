export type BuildRoleTextInput = {
  mainTech: string;                        // "Next.js", "PHP con Laravel", etc. (obligatorio)
  level: string;                            // "basico", "intermedio", "avanzado"
  requiredTools?: string[] | string;       // "Prisma, Tailwind" o ["Prisma","Tailwind"]
  priorKnowledge?: string[] | string;      // "react básico" o ["react básico"]
  outOfScope?: string[] | string;          // "DevOps, microservicios" o ["DevOps","microservicios"]
};

// utils
const toArray = (v?: string[] | string) =>
  (Array.isArray(v) ? v : (v ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean))
  // dedup
  .filter((x, i, arr) => arr.indexOf(x) === i);

const listToSentence = (arr: string[]) =>
  arr.length <= 1 ? (arr[0] ?? "") :
  arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1];

// builder
export function buildRoleText(input: BuildRoleTextInput): string {
  const main = (input.mainTech || "").trim();
  const level = (input.level || "intermedio").trim();
  if (!main) throw new Error("mainTech es requerido");

  const tools = toArray(input.requiredTools);
  const prior = toArray(input.priorKnowledge);
  const out   = toArray(input.outOfScope);

  const parts: string[] = [
    `Tutor experto en ${main} nivel ${level}.`,
    tools.length ? `Herramientas indispensables: ${listToSentence(tools)}.` : "",
    prior.length ? `Conocimientos previos del alumno: ${listToSentence(prior)}.` : "",
    out.length ? `Fuera de alcance: ${listToSentence(out)}.` : ""
  ].filter(Boolean);

  return parts.join(" ");
}