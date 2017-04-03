var Twitter = require("twitter");
var Spotify = require("spotify");
var Omdb = require("omdb");
var Request = require("request");
var fs = require("fs");
var keys = require('./keys');

var userCommand = process.argv[2];
var textFile = "log.txt";
var dashes = '---------------------------------------------------';

function getTweets() {
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            var tweetHeader = "============================ " + tweetCount + " RECENT TWEETS =====";
            fs.appendFile(textFile, tweetHeader + '\n');
            console.log(tweetHeader);

            for (i = 0; i < tweets.length; i++) {
                var tweetTime = tweets[i].created_at;
                var tweetContent = tweets[i].text;
                var tweetHandle = tweets[i].user.screen_name;
                var tweetFaves = tweets[i].favorite_count;
                var tweetRetweets = tweets[i].retweet_count;

                // Get the boolean that says if a tweet contains/is a retweet
                var tweetIsQuote = tweets[i].is_quote_status;

                var tweetOutput1 = "@" + tweetHandle + " at " + tweetTime + ":" + '\n' + tweetContent;
                var tweetOutput3 = tweetFaves + " Favorites  |  " + tweetRetweets + " Retweets" + '\n' + dashes;

                if (tweetIsQuote === true) { // if it's a retweet
                    var tweetQuotedHandle = tweets[i].quoted_status.user.screen_name;
                    var tweetQuotedContent = tweets[i].quoted_status.text;
                    var tweetOutput2 = "  Retweeted from @" + tweetQuotedHandle + ":" + '\n' + "  >  " + tweetQuotedContent;

                    fs.appendFile(textFile, tweetOutput1 + '\n' + tweetOutput2 + '\n' + tweetOutput3 + '\n');
                    console.log(tweetOutput1 + '\n' + tweetOutput2 + '\n' + tweetOutput3);

                    //nice-to-have: could add another conditional here which searches 
                    //tweetQuotedContent for \n, then creates a line break *with spaces* for 
                    //proper indenting for everything that follows, to keep proper indenting in the output.
                } else {
                    fs.appendFile(textFile, tweetOutput1 + '\n' + tweetOutput3 + '\n');
                    console.log(tweetOutput1 + '\n' + tweetOutput3);
                }
            }
        } else if (error) {
            fs.appendFile(textFile, error + '\n');
            console.log(error);
        }
    });
}

function getSongData(songTitle) {
    if (songTitle === undefined) {
        var songOutputUndefined = "You didn't enter a song title, so I'll pick one for you.";
        fs.appendFile(textFile, songOutputUndefined + '\n');
        console.log(songOutputUndefined);

        Spotify.search({ type: 'track', query: 'the sign' }, function (err, data) {
            if (err) {
                fs.appendFile(textFile, err + '\n');
                console.log(err);
                return;
            }
            var aobResult = data.tracks.items[2];
            var musicOutputAob = '"' + aobResult.name + '" is by ' + aobResult.artists[0].name + ', from the album "' + aobResult.album.name + '"' + '\n' + "Preview the track here: " + aobResult.preview_url;
            fs.appendFile(textFile, musicOutputAob + '\n');
            console.log(musicOutputAob);
        });
    } else {
        var songTitleSpaced = songTitle.replace(/-/g, ' ').toLowerCase();
        Spotify.search({ type: 'track', query: songTitleSpaced }, function (err, data) {
            var result = data.tracks.items[0];
            if (err) {
                console.log(err);
                fs.appendFile(textFile, err + '\n');
                return;
            } else if (result === undefined) {
                var musicOutput1 = "Sorry, I couldn't find any tracks matching your query.  Please try something different, or enter no track name and let me pick something for you.";
                console.log(musicOutput1);
                fs.appendFile(textFile, musicOutput1 + '\n');
            } else {
                var musicOutput2 = '"' + result.name + '" is by ' + result.artists[0].name + ', from the album "' + result.album.name + '"' + '\n' + "Preview the track here: " + result.preview_url;
                console.log(musicOutput2);
                fs.appendFile(textFile, musicOutput2 + '\n');
            }
        });
    }
}

function getMovieData(title) {
    Omdb.search(title, function (err, movies) {
        if (err) {
            console.error(err);
            fs.appendFile(textFile, err + '\n');
        }

        var topMovie = movies[0];
        Omdb.get({ title: topMovie.title, year: topMovie.year }, true, function (err, movie) {
            if (err) {
                return console.error(err);
            } else if (!movie) {
                var movieOutput1 = "Movie not found! I'll pick one for you instead";
                console.log(movieOutput1);
                fs.appendFile(textFile, movieOutput1 + '\n');
                getMovieData(movieTitle);
            } else {
                var movieActors = movie.actors.toString().replace(/,/g, ", ");
                var movieCountries = movie.countries.toString().replace(/,/g, ", ");

                // many movies don't have a country listed
                if (movie.countries === undefined) {
                    var movieProduction = "OMDB doesn't know where it was produced.";
                } else {
                    var movieProduction = "It was produced in " + movieCountries;
                }

                // a lot of movies don't have rotten tomatoes ratings
                if (movie.tomato === undefined) {
                    var movieRatings = "Ratings: IMDB, " + movie.imdb.rating + " // Rotten Tomatoes has no rating for it.";
                } else {
                    var movieRatings = "Ratings: IMDB, " + movie.imdb.rating + " // Rotten Tomatoes, " + movie.tomato;
                }

                // Output
                var movieOutput2 = '"' + movie.title + '" was released in ' + movie.year + '. ' + movieProduction + '\n' + movieRatings + '\n' + "Starring: " + movieActors + '\n' + "I'd tell you what language(s) it was released in, but OMDB doesn't seem to have that information." + '\n' + "-- Plot --" + '\n' + movie.plot;
                console.log(movieOutput2);
                fs.appendFile(textFile, movieOutput2 + '\n');
            }
            console.log(dashes);
            fs.appendFile(textFile, dashes + '\n');
        });
    });
}

var outputUserCommand = '\n' + "============================= USER COMMAND ========" + '\n' + userCommand;
console.log(outputUserCommand);
fs.appendFile(textFile, outputUserCommand + '\n');

// node liri.js my-tweets
if (userCommand === "my-tweets") {
    var client = new Twitter(keys.twitterKeys);
    var tweetCount = 20;
    var params = { screen_name: 'emkamp_atx', count: tweetCount };
    getTweets();

    // node liri.js spotify-this-song song-title
} else if (userCommand === "spotify-this-song") {
    var spotifyHeader = "========================= SPOTIFY TOP RESULT ======";
    console.log(spotifyHeader);
    fs.appendFile(textFile, spotifyHeader + '\n');

    var songTitleInput = process.argv[3];
    getSongData(songTitleInput);

    // node liri.js movie-this movie-title
} else if (userCommand === "movie-this") {
    var movieTitle = process.argv[3];
    var omdbHeader = "============================ OMDB TOP RESULT ======";
    console.log(omdbHeader);
    fs.appendFile(textFile, omdbHeader + '\n');

    if (movieTitle === undefined) {
        var movieOutput3 = "You didn't enter a movie title, so I picked one for you." + '\n' + dashes;
        console.log(movieOutput3);
        fs.appendFile(textFile, movieOutput3 + '\n');

        getMovieData("Mr. Nobody");
    } else {
        var movieTitleSpaced = movieTitle.replace(/-/g, ' ').toLowerCase();
        getMovieData(movieTitleSpaced);
    }

    // node liri.js do-what-it-says
} else if (userCommand === "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function read(err, data) {
        var notSoRandom = data.split(' ');

        var doWhatHeader = "======================= WHAT'S IN THIS FILE? ======";
        console.log(doWhatHeader);
        fs.appendFile(textFile, doWhatHeader + '\n');

        getSongData(notSoRandom[1]);
    });
} else {
    var userCommandError = "please enter a valid command";
    console.log(userCommandError);
    fs.appendFile(textFile, userCommandError + '\n');
}