const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const helmet=require('helmet');
const sentiment=require('sentiment');
const Twitter = require('twitter');

let client = new Twitter({
  consumer_key: process.env.C_KEY,
  consumer_secret: process.env.C_SEC,
  access_token_key: process.env.ATK,
  access_token_secret: process.env.ATS
});

const app=express();
app.use(helmet());

app.use(express.static(path.join(__dirname+'/static')));
app.use('/s',bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname+'/views'));

function promiseTweet(username,ct) {
  return new Promise(function(resolve, reject) {
    //https://dev.twitter.com/rest/reference/get/statuses/user_timeline >> params to set
    var params = {screen_name: username, include_rts: 1, exclude_replies: true,
    trim_user: true, count: ct};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) { resolve(tweets); }
      else { reject(error);}
    });
  });
}

/*SENTIMENT returns an object like this: {
  score: 1,
  comparative: 0.05263157894736842,
  tokens: [ 'day','1', ETC ... 'first'],
  words: [ 'strangely', 'thanks' ],
  positive: [ 'thanks' ],
  negative: [ 'strangely' ] } */

function calculateFeels(tweets) {
  //returns an array of two object arrays:
  //feels -> [{text:tweet.text, sentiment: sentiment of tweet text}]
  //overTime -> [{time:tweet.created_at, score: sentiment of tweet}]
  let feels={};
  let feelsArray=[];
  let overTime=[];
  let nicest={text:'',score:0};
  let meanest={text:'',score:0};
  tweets.forEach((tweet)=>{
    let feel=sentiment(tweet.text);
    overTime.push({time:tweet.created_at,score:feel.score,comparative:feel.comparative});
    if (feel.score<0) {
      if (feel.score<meanest.score) {
        meanest.text=tweet.text;
        meanest.score=feel.score;
      }
    }
    if (feel.score>0) {
      if (feel.score>nicest.score) {
        nicest.text=tweet.text;
        nicest.score=feel.score;
      }
    }
    feelsArray.push({text:tweet.text,sentiment:sentiment(tweet.text)});
  });
  feels.f=feelsArray;
  feels.nicest=nicest;
  feels.meanest=meanest;
  return [feels,overTime];
}

app.post('/s',function(req,res) {
  console.log(req.body);
  if (req.body.ct.match(/[^0-9]gi/)||(req.body.ct<10||req.body.ct>300)) { res.redirect('/s'); } //bad ct value
  let tweets=promiseTweet(req.body.user, req.body.ct);
  tweets.then(function(data){
    let feels=calculateFeels(data);
      res.render('tweetlist',{data:{feels:feels[0],time:feels[1],rawData:JSON.stringify(data)}});
    }).catch(function(err){
      if (err) { res.send(err); }
    });
  });

app.get('/s', function(req,res) {
  res.render('search');
});

app.get('*', function(req,res) {
  res.redirect('/s');
});

app.listen(process.env.PORT||3000);
