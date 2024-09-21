export type nftQueue = {
    user:string,
    next:bigint,
    prev:bigint,
    index:bigint,
    batchLevel:bigint,
    dollarsClaimed:bigint,
    nextPaied: boolean,
}

export type blockData = {
    user:string,
    index:bigint,
    batchLevel:bigint,
    nextPaied: boolean,
}