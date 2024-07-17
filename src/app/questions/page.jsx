import style from './page.module.css';
import {prisma} from "@/Utils/prisma";
import {Card} from "@/components/Card";

async function getData() {
    const wrestlers = await prisma.wrestler.findMany();
    return wrestlers;
}

export default async function Page() {
    const wrestlers = await getData();

    let questions = [];
    for (let i = 0; i < wrestlers.length; i++) {
        if (wrestlers[i].showName === 'No') {
            questions.push({question: "show", id: wrestlers[i].id, name: wrestlers[i].name});
        }
        if (!wrestlers[i].active) {
            questions.push({question: "actif", id: wrestlers[i].id, name: wrestlers[i].name});
        }
    }

    let questionsShuffle = questions.map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value)

    return (
        <>
            <h1 style={{textAlign:"center"}}>{questionsShuffle.length} Questions</h1>
        <main className={style.wrapper}>
           <div className={style.center}>
               {questionsShuffle.map((question,index) => {
                     return <Card key={index} last={index+1 === questionsShuffle.length} question={question} />
               })}
           </div>
        </main>
        </>
    );
}
