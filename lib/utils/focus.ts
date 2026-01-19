export function buildFocus(input: {
    requiredTools?: string[];
    razonCurso: string;
}): string {
    const requiredTools = input.requiredTools?.join(", ") || "";
    return `Deseo hacer el curso porque: ${input.razonCurso} No debe faltar: ${requiredTools}`;
}