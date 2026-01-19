import { TemaryInterface } from "@/types/course";

export const obtainModuleIndexByGlobalIndex = (temarySchema: TemaryInterface, globalIndex: number) => {
    let moduleIndex = 0;
    while(globalIndex >= temarySchema?.modules[moduleIndex]?.subtopics.length){
        globalIndex -= temarySchema?.modules[moduleIndex]?.subtopics.length;
        moduleIndex++;
    }
    return moduleIndex;
}