import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const myParams = await params;
    try {
        // Vérifier si le corps de la requête est vide
        const text = await request.text();
        
        if (!text || text.trim() === '') {
            return NextResponse.json({ error: 'Corps de requête vide' }, { status: 400 });
        }
        
        // Essayer de parser le JSON
        let body;
        try {
            body = JSON.parse(text);
        } catch (jsonError) {
            console.error('Erreur de parsing JSON:', jsonError.message);
            return NextResponse.json({ error: 'JSON invalide dans la requête' }, { status: 400 });
        }
        
        
        const { name, show } = body;
        
        // Vérifier que les paramètres requis sont présents
        if (!name || !show) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }
        

        const id = parseInt(myParams.id);


        const showQuery = await prisma.show.findUnique({
            where: { name: show }
        });


        if (!showQuery) {
            return NextResponse.json({ error: 'Show non trouvé' }, { status: 404 });
        }

        const showId = showQuery.id;

        const updatedWrestler = await prisma.wrestler.update({
            where: { id },
            data: { name, show: { connect: { id: showId } } }
        });
        
        // Vérifier que le résultat n'est pas null
        if (!updatedWrestler) {
            return NextResponse.json({ error: 'Mise à jour échouée' }, { status: 404 });
        }

        return NextResponse.json(updatedWrestler);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du wrestler:', error);
        return NextResponse.json({ error: 'Erreur serveur', message: error.message }, { status: 500 });
    }
} 