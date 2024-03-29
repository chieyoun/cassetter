const Spotify = require('node-spotify-api');

const spotify = new Spotify({
  id: '82a1ff02ef184ef486c6aa641be458e8',
  secret: '6ec67ba545d64c7a94aebc0a28a047fa'
});

const seedName = 'day6';
const seedType = 'artist'; // 'artist' 또는 'track' 중 하나로 설정

spotify.search({ type: seedType, query: seedName }, (err, data) => {
  if (err) {
    console.error('검색 중 오류가 발생했습니다:', err);
    return;
  }

  const searchResults = seedType === 'artist' ? data.artists : data.tracks;
  printSearchResults(searchResults, seedType);
});

function printSearchResults(searchResults, seedType) {
  if (searchResults.items.length > 0) {
    console.log("\n***********************************************************************************************************");
    const searchResult = searchResults.items[0];
    if (seedType === 'artist') {
      console.log(`1. ${searchResult.name} (아티스트) ID: ${searchResult.id}`);
    } else {
      const artistsNames = searchResult.artists.map(artist => artist.name).join(', ');
      console.log(`1. ${searchResult.name}의 아티스트: ${artistsNames} (곡) ID: ${searchResult.id}`);
    }
  } else {
    console.log(`${seedName}을(를) 찾을 수 없습니다.`);
  }
  console.log("***********************************************************************************************************\n");
}
