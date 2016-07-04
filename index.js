var tumblr = require('tumblr.js');
var Feed = require('feed');
var fs = require('fs');
var express = require('express');
var app = express();

var conf = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var client = tumblr.createClient({
  consumer_key: conf.consumer_key
});

var feedinfo = {};

app.get('/', function (req, res) {
  client.blogInfo(conf.blog_name, function(err, resp){
    feedinfo = resp.blog;
    var feed = makefeed();

    client.blogPosts(conf.blog_name, {reblog_info: true}, function(err, resp) {
      for(var key in resp.posts) {
        var post = resp.posts[key];
        if (!post.reblogged_from_id) {
          feed.addItem({
            title:          post.summary,
            link:           post.post_url,
            date:           new Date(post.date)
          });

        }
      }
      res.set('Content-Type', 'text/xml')
      res.send(feed.render('rss-2.0'));
    });


  });

});

function makefeed(){
  var feed = new Feed({
      title:       feedinfo.title,
      description: feedinfo.description,
      link:        feedinfo.url
  });
  return feed;
}

app.listen(3030, function () {
  console.log('App listening on port 3030!');
});
