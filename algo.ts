function netScore(ls: number, bf: number, rm: number, cs: number, ru: number) {
    return (ls * (bf * .3 + rm * .3 + cs * .2 + ru * .2));
}

function responsiveMaintainer(days:number) {
    let resp: number = 1 - (days / 365);
    if (resp > 0) {
        return resp;
    }
    return 0;
}

function RampUp(weekly:number){
    let score: number = weekly/100000000;
    if(score < 1) {
        return score;
    }
    return 1;
}

//TODO: BusFactor, Correctness, Liscense
