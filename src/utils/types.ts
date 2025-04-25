import {Match} from "@prisma/client";

export type TL = {
    dateAPI: string,
    avg: number,
    tier: {
        name: string,
        gender: string,
        tier: string,
        pts: number,
        matches: number,
        isActive: boolean,
        lastResult: "Loose"|"Win"
    }[],
    maxMatches: number,
}