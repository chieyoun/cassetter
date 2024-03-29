
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Spotify 개발자 앱의 클라이언트 ID 및 시크릿을 설정합니다.
const clientId = '82a1ff02ef184ef486c6aa641be458e8';
const clientSecret = '6ec67ba545d64c7a94aebc0a28a047fa';
const redirectUri = 'http://localhost:3000/callback'; // 리디렉션 URI 설정

// Spotify API 객체 생성
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

// 인증 코드를 사용하여 액세스 토큰을 얻습니다.
app.get('/login', (req, res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL([
    'user-read-private',
    'playlist-read-private',
  ]);
  res.redirect(authorizeURL);
});

app.get('/callback', (req, res) => {
  const { code } = req.query;
  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      console.log('Access token: ' + data.body['access_token']);

      // 액세스 토큰 설정
      spotifyApi.setAccessToken(data.body['access_token']);

      const searchQuery = 'WHO DO YOU LOVE ME?'; 


      spotifyApi.searchPlaylists(searchQuery)
        .then(data => {
          const playlists = data.body.playlists.items;

          // 검색된 플레이리스트 중에서 무작위로 하나를 선택합니다.
          const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];

          // 플레이리스트의 이름, 만든 사람, 링크를 가져옵니다.
          const playlistName = randomPlaylist.name;
          const creatorName = randomPlaylist.owner.display_name;
          const playlistLink = randomPlaylist.external_urls.spotify;

          console.log('Random playlist:', randomPlaylist);

          // 플레이리스트의 곡 목록을 가져옵니다.
          spotifyApi.getPlaylistTracks(randomPlaylist.id)
            .then(data => {
              const tracks = data.body.items;

              // 곡 목록을 문자열로 변환하여 출력합니다.
              let trackList = '<h2>Tracks:</h2><ul>';
              tracks.forEach(track => {
                // console.log(track.track.uri);
                trackList += `<li>${track.track.name} - ${track.track.artists[0].name}</li>`;
              });
              trackList += '</ul>';
              var uri = playlistLink.slice(34, 57);
              // 웹 페이지에 플레이리스트 정보와 곡 목록을 표시
              res.send(`
                <a href="/login">one more</a>
                <h1>Random Playlist</h1>
                <iframe src="https://open.spotify.com/embed/playlist/${uri}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                <p><a href="${playlistLink}" target="_blank">Link to Playlist</a></p>
                ${trackList}
              `);
              //   <p>Name: ${playlistName}</p>
              //   <p>Created by: ${creatorName}</p>
              
             
            })
            .catch(error => {
              console.error('Error getting playlist tracks:', error);
              res.send('Error getting playlist tracks: ' + error.message);
            });
        })
        .catch(error => {
          console.error('Error searching playlists:', error);
          res.send('Error searching playlists: ' + error.message);
        });
    })
    .catch(error => {
      console.error('Error getting access token:', error);
      res.send('Error getting access token: ' + error.message);
    });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});