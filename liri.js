var Twitter = require("twitter");
var Spotify = require("spotify");
var Omdb = require("omdb");
var Request = require("request");
var fs = require("fs");
var keys = require('./keys');

var userCommand = process.argv[2];

console.log("============================= USER COMMAND ========");
console.log(userCommand);

function getTweets() {
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log("============================ " + tweetCount + " RECENT TWEETS =====");
            for (i = 0; i < tweets.length; i++) {
                var tweetTime = tweets[i].created_at;
                var tweetContent = tweets[i].text;
                var tweetHandle = tweets[i].user.screen_name;
                var tweetFaves = tweets[i].favorite_count;
                var tweetRetweets = tweets[i].retweet_count;

                // Get the boolean that says if a tweet contains/is a retweet
                var tweetIsQuote = tweets[i].is_quote_status;

                console.log("@" + tweetHandle + " at " + tweetTime + ":");
                console.log(tweetContent);

                if (tweetIsQuote === true) { // if it's a retweet
                    var tweetQuotedHandle = tweets[i].quoted_status.user.screen_name;
                    var tweetQuotedContent = tweets[i].quoted_status.text;
                    console.log("  Retweeted from @" + tweetQuotedHandle + ":");
                    console.log("  >  " + tweetQuotedContent);
                    //nice-to-have: could add another conditional here which searches 
                    //tweetQuotedContent for \n, then creates another console.log with 
                    //proper indenting for everything that follows, to keep proper indenting in the output.
                } else { }

                console.log(tweetFaves + " Favorites  |  " + tweetRetweets + " Retweets");
                console.log("---------------------------------------------------");
            }
        } else if (error) {
            console.log(error);
        }
    });
}

function getSongData(songTitle) {
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
            } else if (result === undefined) {
                console.log("Sorry, I couldn't find any tracks matching your query.  Please try something different, or enter no track name and let me pick something for you.");
            } else {
                console.log('"' + result.name + '" is by ' + result.artists[0].name + ', from the album "' + result.album.name + '"');
                console.log("Preview the track here: " + result.preview_url);
            }
        });
    }
}

function getMovieData(title) {
    Omdb.search(title, function (err, movies) {
        if (err) {
            return console.error(err);
        }

        var topMovie = movies[0];
        Omdb.get({ title: topMovie.title, year: topMovie.year }, true, function (err, movie) {
            if (err) {
                return console.error(err);
            } else if (!movie) {
                console.log("Movie not found! I'll pick one for you instead");
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
                console.log('"' + movie.title + '" was released in ' + movie.year + '. ' + movieProduction);
                console.log(movieRatings);
                console.log("Starring: " + movieActors);
                // none of the movies I searched for had a language entry in the response object
                console.log("I'd tell you what language(s) it was released in, but OMDB doesn't seem to have that information.");
                console.log("-- Plot --")
                console.log(movie.plot);
            }
            console.log('---------------------------------------------------');
        });
    });
}

// node liri.js my-tweets
if (userCommand === "my-tweets") {
    var client = new Twitter(keys.twitterKeys);
    var tweetCount = 20;
    var params = { screen_name: 'emkamp_atx', count: tweetCount };

    // node liri.js spotify-this-song song-title
} else if (userCommand === "spotify-this-song") {
    console.log("========================= SPOTIFY TOP RESULT ======");
    var songTitleInput = process.argv[3];
    getSongData(songTitleInput);

    // node liri.js movie-this movie-title
} else if (userCommand === "movie-this") {
    var movieTitle = process.argv[3];
    console.log("============================ OMDB TOP RESULT ======");

    if (movieTitle === undefined) {
        console.log("You didn't enter a movie title, so I picked one for you.");
        console.log('---------------------------------------------------');
        getMovieData("Mr. Nobody");
    } else {
        var movieTitleSpaced = movieTitle.replace(/-/g, ' ').toLowerCase();
        getMovieData(movieTitleSpaced);
    }

    // node liri.js do-what-it-says
} else if (userCommand === "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function read(err, data) {
        var notSoRandom = data.split(' ');
        console.log("======================= WHAT'S IN THIS FILE? ======");
        getSongData(notSoRandom[1]);
    });
} else {
    console.log("please enter a valid command");
}