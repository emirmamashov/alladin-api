module.exports = {
    chunk(chunkArray, chunkSize) {
        if (!chunkArray || chunkArray.lentgh === 0) return;
        chunkSize = chunkSize || 50;

        let newChunkArray = [];
        for (let i = 0; i < chunkArray.length; i += chunkSize) {
            newChunkArray.push({
                id: i,
                data: chunkArray.slice(i, i + chunkSize)
            });
        }
        return newChunkArray;
    }
}