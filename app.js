const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const Spotify = require('node-spotify-api');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

const clientId = '82a1ff02ef184ef486c6aa641be458e8';
const clientSecret = '6ec67ba545d64c7a94aebc0a28a047fa';
const redirectUri = 'http://localhost:3000/callback';

const spotifyWebApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});

const spotify = new Spotify({
  id: '82a1ff02ef184ef486c6aa641be458e8',
  secret: '6ec67ba545d64c7a94aebc0a28a047fa'
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/recom', async (req, res) => {
  const seedType = req.body.seed_type; // 선택한 유형 (artist, track, genre)
  const seedValue = req.body.seed_value; // 입력한 값
  const seedLimit = req.body.seed_limit;
  let options = {};

  options.limit = seedLimit;

  // Spotify API에 전달할 검색 옵션 설정
  if (seedType === 'artist' || seedType === 'track') {
    try {
      // 액세스 토큰 요청
      const data = await spotifyWebApi.clientCredentialsGrant();
      const accessToken = data.body['access_token'];
      
      // 얻은 액세스 토큰 설정
      spotifyWebApi.setAccessToken(accessToken);
      
      // 검색 실행
      const searchResults = await spotifyWebApi.search(seedValue, [seedType]);
      if (searchResults.body[`${seedType}s`].items.length > 0) {
        const seedId = searchResults.body[`${seedType}s`].items[0].id;
        if (seedType === 'artist') {
          options.seed_artists = [seedId];
        } else if (seedType === 'track') {
          options.seed_tracks = [seedId];
        }
        const recommendedTracks = await spotifyWebApi.getRecommendations(options);
        res.render('index', { recommendedTracks: recommendedTracks.body.tracks });
      } else {
        console.log('검색 결과를 찾을 수 없습니다.');
        res.render('index', { error: '검색 결과를 찾을 수 없습니다.' });
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      res.render('index', { error: '검색 중 오류 발생' });
    }
  } else if (seedType === 'genre') {
    options.seed_genres = [seedValue];
    try {
      // 액세스 토큰 요청
      const data = await spotifyWebApi.clientCredentialsGrant();
      const accessToken = data.body['access_token'];
      
      // 얻은 액세스 토큰 설정
      spotifyWebApi.setAccessToken(accessToken);
      
      // 검색 실행
      const recommendedTracks = await spotifyWebApi.getRecommendations(options);
      res.render('index', { recommendedTracks: recommendedTracks.body.tracks });
    } catch (error) {
      console.error('곡 추천 중 오류 발생:', error);
      res.render('index', { error: '곡 추천 중 오류 발생' });
    }
  } else {
    console.log('유효하지 않은 검색 유형입니다.');
    res.render('index', { error: '유효하지 않은 검색 유형입니다.' });
  }
});


app.post('/search', async (req, res) => {
  const seedName = req.body.seed_name;
  const seedType = req.body.seed_type; // 'artist' 또는 'track' 중 하나로 설정
  try {
    const searchResults = await spotify.search({ type: seedType, query: seedName });
    printSearchResults(searchResults, seedType, res);
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    res.render('index', { error: '검색 중 오류 발생' });
  }
});

function printSearchResults(searchResults, seedType, res) {
  if (searchResults.items.length > 0) {
    console.log("\n***********************************************************************************************************");
    const searchResult = searchResults.items[0];
    if (seedType === 'artist') {
      console.log(`1. ${searchResult.name} (아티스트) ID: ${searchResult.id}`);
    } else {
      const artistsNames = searchResult.artists.map(artist => artist.name).join(', ');
      console.log(`1. ${searchResult.name}의 아티스트: ${artistsNames} (곡) ID: ${searchResult.id}`);
    }
    console.log("***********************************************************************************************************\n");
    res.render('index', { searchResult });
  } else {
    console.log(`${seedName}을(를) 찾을 수 없습니다.`);
    res.render('index', { error: `${seedName}을(를) 찾을 수 없습니다.` });
  }
}

app.listen(3000, () => {
  console.log('서버가 http://localhost:3000에서 실행 중입니다.');
});
