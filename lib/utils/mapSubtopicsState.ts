// Crear un mapa de estados
type SubtemaEstadoMap = Map<string, string>;
export const buildSubtopicStateMap = (dbData: any): SubtemaEstadoMap => {
const map = new Map<string, string>()
dbData.Modulos.forEach((modulo: any) => {
    modulo.Subtemas.forEach((subtema: any) => {
    map.set(subtema.titulo, subtema.estado);
    });
});
return map;
};

//Enriquecer el temario
export const enrichTemaryWithState = (
temary: any,
stateMap: Map<string, string>
) => {
return {
    ...temary,
    modules: temary.modules.map((module: any) => ({
    ...module,
    subtopics: module.subtopics.map((subtopic: any) => ({
        ...subtopic,
        state: stateMap.get(subtopic.title) ?? 'vacio', // valor por defecto
    })),
    })),
};
};