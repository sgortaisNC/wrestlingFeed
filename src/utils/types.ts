import {Match} from ".prisma/client";

export type TL = {
    dateAPI: string,
    avg: number,
    tier: {
        name: string,
        tier: string,
        pts: number,
        matches: Match[],
        isActive: boolean,
        lastResult: "Loose"|"Win"
    }[],
}