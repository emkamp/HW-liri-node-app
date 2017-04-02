var Twitter = require("twitter");
var Spotify = require("spotify");
var Request = require("request");

var userCommand = process.argv[2];
var keys = require('./keys');

/* Make it so liri.js can take in one of the following commands:
   my-tweets
   spotify-this-song
   movie-this
   do-what-it-says             
*/

console.log("============================= USER COMMAND ========");
console.log(userCommand);

if (userCommand === "my-tweets") {
    var client = new Twitter(keys.twitterKeys);
    var tweetCount = 20;
    var params = { screen_name: 'emkamp_atx', count: tweetCount };

    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log("============================ " + tweetCount + " RECENT TWEETS =====");
            for (i = 0; i < tweets.length; i++) {
                var tweetTime = tweets[i].created_at;
                var tweetContent = tweets[i].text;
                var tweetHandle = tweets[i].user.screen_name;
                var tweetFaves = tweets[i].favorite_count;
                var tweetRetweets = tweets[i].retweet_count;

                // Retweets
                var tweetIsQuote = tweets[i].is_quote_status;

                console.log("@" + tweetHandle + " at " + tweetTime + ":");
                console.log(tweetContent);

                if (tweetIsQuote === true) { // if it's a retweet
                    var tweetQuotedHandle = tweets[i].quoted_status.user.screen_name;
                    var tweetQuotedContent = tweets[i].quoted_status.text;
                    console.log("  Retweeted from @" + tweetQuotedHandle + ":");
                    console.log("  >  " + tweetQuotedContent);
                } else { }

                console.log(tweetFaves + " Favorites  |  " + tweetRetweets + " Retweets");
                console.log("---------------------------------------------------");
            }

        } else if (error) {
            console.log(error);
        }
    });
} else if (userCommand === "spotify-this-song") {
    console.log("========================= SPOTIFY TOP RESULT ======");

    var songTitle = process.argv[3];

    if (songTitle === undefined) {
        console.log("You didn't enter a song title, so I'll pick one for you.");
        Spotify.search({ type: 'track', query: 'the sign' }, function (err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }

            var aobResult = data.tracks.items[2];
            console.log('"' + aobResult.name + '" is by ' + aobResult.artists[0].name + ', from the album "' + aobResult.album.name + '"');
            console.log("Preview the track here: " + aobResult.preview_url);
        });
    } else {
        var songTitleSpaced = songTitle.replace(/-/g, ' ').toLowerCase();
        Spotify.search({ type: 'track', query: songTitleSpaced }, function (err, data) {
            var result = data.tracks.items[0];
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            } else if (result === undefined){
                console.log("Sorry, I couldn't find any tracks matching your query.  Please try something different, or enter no track name and let me pick something for you.");
            } else {
            console.log('"' + result.name + '" is by ' + result.artists[0].name + ', from the album "'  +result.album.name + '"');
            console.log("Preview the track here: " + result.preview_url);
            }
        });
    }
} else if (userCommand === "movie-this") {
    console.log("omdb fired");
} else {
    console.log("please enter a valid command");
}