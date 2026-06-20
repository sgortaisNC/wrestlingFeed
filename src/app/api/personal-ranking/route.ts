import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

// Paramètres ELO
const START_RATING = 1500;
const K = 32;

interface WrestlerRow {
    id: number;
    name: string;
    gender: string;
    showName: string | null;
    personalScore: number | null;
    personalVotes: number;
}

const SELECT = {
    id: true,
    name: true,
    gender: true,
    showName: true,
    personalScore: true,
    personalVotes: true,
} as const;

/** Choisit un nombre entier dans [0, max[. */
function randInt(max: number): number {
    return Math.floor(Math.random() * max);
}

/**
 * Choisit deux catcheurs à confronter.
 * - Catcheur A : tiré au sort parmi les moins confrontés (pour faire émerger
 *   les inconnus et remplir le classement progressivement).
 * - Catcheur B : un adversaire au score proche de A pour affiner le classement
 *   (avec une part d'exploration aléatoire) ; si A est inconnu, un catcheur déjà
 *   noté pour le positionner d'emblée.
 */
function pickPair(all: WrestlerRow[]): [WrestlerRow, WrestlerRow] | null {
    if (all.length < 2) return null;

    const minVotes = Math.min(...all.map((w) => w.personalVotes));
    const cohort = all.filter((w) => w.personalVotes === minVotes);
    const a = cohort[randInt(cohort.length)];

    const others = all.filter((w) => w.id !== a.id);
    const scored = others.filter((w) => w.personalScore != null);

    let b: WrestlerRow;
    if (a.personalScore != null && scored.length > 0 && Math.random() < 0.7) {
        // Affiner : prendre un adversaire parmi les plus proches en score.
        const sorted = [...scored].sort(
            (x, y) =>
                Math.abs((x.personalScore as number) - (a.personalScore as number)) -
                Math.abs((y.personalScore as number) - (a.personalScore as number)),
        );
        const closest = sorted.slice(0, Math.min(5, sorted.length));
        b = closest[randInt(closest.length)];
    } else if (a.personalScore == null && scored.length > 0) {
        // Positionner un nouveau venu face à un catcheur déjà classé.
        b = scored[randInt(scored.length)];
    } else {
        b = others[randInt(others.length)];
    }

    return [a, b];
}

function buildRanking(all: WrestlerRow[]): WrestlerRow[] {
    return all
        .filter((w) => w.personalScore != null)
        .sort(
            (a, b) =>
                (b.personalScore as number) - (a.personalScore as number) ||
                a.name.localeCompare(b.name),
        );
}

async function getState() {
    const all: WrestlerRow[] = await prisma.wrestler.findMany({ select: SELECT });
    const totalDuels = all.reduce((sum, w) => sum + w.personalVotes, 0) / 2;
    return {
        ranking: buildRanking(all),
        pair: pickPair(all),
        totalWrestlers: all.length,
        totalDuels: Math.round(totalDuels),
    };
}

export async function GET() {
    try {
        const state = await getState();
        return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Erreur lors de la récupération du classement personnel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Body: { winnerId: number, loserId: number } — enregistre le résultat d'un duel.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const winnerId = Number(body?.winnerId);
        const loserId = Number(body?.loserId);

        if (
            !Number.isInteger(winnerId) ||
            !Number.isInteger(loserId) ||
            winnerId === loserId
        ) {
            return NextResponse.json({ error: 'Duel invalide' }, { status: 400 });
        }

        const pair = await prisma.wrestler.findMany({
            where: { id: { in: [winnerId, loserId] } },
            select: { id: true, personalScore: true },
        });
        if (pair.length !== 2) {
            return NextResponse.json({ error: 'Catcheur introuvable' }, { status: 404 });
        }

        const winner = pair.find((w) => w.id === winnerId)!;
        const loser = pair.find((w) => w.id === loserId)!;

        const ra = winner.personalScore ?? START_RATING;
        const rb = loser.personalScore ?? START_RATING;
        const expectedWinner = 1 / (1 + Math.pow(10, (rb - ra) / 400));
        const newWinner = Math.round(ra + K * (1 - expectedWinner));
        const newLoser = Math.round(rb + K * (0 - (1 - expectedWinner)));

        // Une seule requête atomique pour les deux lignes.
        await prisma.$executeRaw`
            UPDATE "Wrestler"
            SET "personalScore" = CASE "id"
                    WHEN ${winnerId} THEN ${newWinner}
                    WHEN ${loserId} THEN ${newLoser}
                END,
                "personalVotes" = "personalVotes" + 1
            WHERE "id" IN (${winnerId}, ${loserId})
        `;

        const state = await getState();
        return NextResponse.json(
            { ...state, lastChanged: [winnerId, loserId] },
            { headers: { 'Cache-Control': 'no-store' } },
        );
    } catch (error) {
        console.error('Erreur lors de l’enregistrement du duel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Réinitialise tout le classement personnel.
export async function DELETE() {
    try {
        await prisma.wrestler.updateMany({
            data: { personalScore: null, personalVotes: 0 },
        });
        const state = await getState();
        return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du classement personnel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
