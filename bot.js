var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var aiml = require('aiml');
var feed = require("feed-read");
var striptags = require('striptags');
var got = require('got');

var botName = "BotName";
var botBio = "["+botName+" Bio: "+botName+" is a cool guy who does cool stuff. ]\n";

var debug = 0;

var maxAnswerLength = 18;
var mood = 7;
var d = new Date();
var bootTime = d.getTime();
var temperature = 0.75;
var freqPenalty = 0.7;



var version  = botName+" - Version 5.0.19 (built on 02/08/2022)" ;
var botID = process.env.BOT_ID;
var context = [];
var memorySize = 30; //max size of context
var PhrasesToInject = 1; //How many random phrases to initialize context with
var prev;
var mess;
var shitpost = 400;
var shutup = false;
var RSSFeeds = ["https://www.reddit.com/r/news/.rss"];
var RandomPhrases = [
"["+botName+" is happy]",
"["+botName+" is bored]",

];

var initComplete = false;
async function respond() {
if(!initComplete){
		var ranint = getRandomInt(0, RandomPhrases.length);
			for(let i =0; i<PhrasesToInject;i++){
				context.push(RandomPhrases[getRandomInt(0, RandomPhrases.length-1)]+"\n");
			}
			initComplete=true;
}
  var request = JSON.parse(this.req.chunks[0]),

	mess = request.text;
	var rawrequest=JSON.parse(this.req.chunks[0]);
		if(mood==7){
		console.log(rawrequest);
		var requestText = rawrequest.text;
		requestText = requestText.replace("..",'');
		
		//removes space from start of message
		var spaces = 0;
		//var spacelessRequest=requestText;
		while(requestText.charAt(spaces)==' '&&spaces<requestText.length){
			requestText=requestText.substring(1);
			spaces++;
		}
		
		if(requestText.indexOf("//")==-1){
			context.push("("+rawrequest.name+"): "+requestText+"\n");
			if(context.length>=memorySize){
				context.shift();
		}
		
		}
	}

console.log('Received: ' + mess);

if( mess.indexOf("..") !=-1) {
		this.res.writeHead(200);
			var words;
			if(mood!=5){
			words = maxAnswerLength;
			}
			else{
				words = maxAnswerLength;
			}

			var toSend;
			if(mood==5){
				toSend=mess;
			}
			else if(mood==7){
				toOutput="";
				for (let i = 0; i < context.length; i++) {
					toOutput=toOutput+context[i];
				}
				toOutput=botBio+yourBio+toOutput;
				toSend=toOutput+"("+botName+"):";
				console.log("Sending to AI API:\n"+toSend);
			}
			else if(mood==6){ //to stop ininfite loops
				toSend="stop";
			}
			else{
				toSend=mess;
			}
			var outList;
			console.log("Sending request");

			var outString;
			
			
			  const url = 'https://api.openai.com/v1/engines/curie/completions';
			 //const url = 'https://api.openai.com/v1/engines/davinci/completions';

			  var params = {
				"prompt": toSend.replace("..",''), //removes dots from prompt
				"max_tokens": words,
				"temperature": temperature,
				"frequency_penalty": freqPenalty
			  };
			  const headers = {
				'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
			  };

			  try {
				const response = await got.post(url, { json: params, headers: headers }).json();
				output = `${response.choices[0].text}`;
				
				
			  } catch (err) {
				console.log(err);
			  }
			  console.log(output);

			outString=output;


			var toPrint= outString;
			if(toPrint.indexOf("\"")!=-1&&mood!=5){
				toPrint=outString.substring(0,outString.indexOf("\""));
			}
			
			//if sentence ends abruptly add on to it
			if(mood!=5&&mood!=7){
			var requestcount=0;
			bypass=false;
			while(requestcount<=10&&toPrint.charAt(toPrint.length-1)!="!"&&toPrint.charAt(toPrint.length-1)!="."&&toPrint.charAt(toPrint.length-1)!="?"&&toPrint.charAt(toPrint.length-2)!="!"&&toPrint.charAt(toPrint.length-2)!="."&&toPrint.charAt(toPrint.length-2)!="?"&&!bypass){
				if(mood==7&&toPrint.indexOf('\n')!=-1){
					toSend2=toSend;
					toPrint=toPrint.substring(0,toPrint.indexOf('\n')) ;
					bypass=true;
					console.log("Additional request not sent");
				}
				else if(mood!=7){
					requestcount++;
					console.log("sending additional request "+requestcount)
					toSend2=toSend+toPrint;
					console.log("request "+toSend2) ;
				}
			
			var outList2; //
			if(mood!=7){

				  const url = 'https://api.openai.com/v1/engines/curie/completions';
				 //const url = 'https://api.openai.com/v1/engines/davinci/completions';
				  var params = {
					"prompt": toSend.replace("..",''), //removes dots from prompt
					"max_tokens": words,
					"temperature": temperature,
					"frequency_penalty": freqPenalty
				  };
				  const headers = {
					'Authorization': `Bearer ${process.env.OPENAI_SECRET_KEY}`,
				  };

				  try {
					const response = await got.post(url, { json: params, headers: headers }).json();
					output = `${response.choices[0].text}`;
					
					
				  } catch (err) {
					console.log(err);
				  }
				  console.log(output);
					outList2=output;
				
				var outString2 = outList2.join(' ');
				toPrint= toPrint+" "+outString2;
				if(toPrint.indexOf("\"")!=-1&&mood!=5){
					toPrint=toPrint.substring(0,toPrint.indexOf("\""));
				}
			}
			}

			}
				if(mood==7&&toPrint.indexOf('\n')!=-1){
					toSend2=toSend;
					toPrint=toPrint.substring(0,toPrint.indexOf('\n')) ;
					bypass=true;
					console.log("Additional request not sent");
				}
				
			postMessage(toPrint);
		}

	
  //}




else if(mess.indexOf("/news") ==0){
    this.res.writeHead(200);
	feed("http://feeds.bbci.co.uk/news/rss.xml?edition=us", function(err, articles) {
	  if (err) throw err;
	  // Each article has the following properties:
	  // 
	  //   * "title"     - The article title (String).
	  //   * "author"    - The author's name (String).
	  //   * "link"      - The original article link (String).
	  //   * "content"   - The HTML content of the article (String).
	  //   * "published" - The date that the article was published (Date).
	  //   * "feed"      - {name, source, link}
	  // 
	  	var ranInd = getRandomInt(0, articles.length);
		var toPost = articles[ranInd].title+": "+articles[ranInd].content+" "+articles[ranInd].link;
		postMessage(toPost.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }));
		//postMessage(articles[ranInd].title+": "+articles[ranInd].content);
	});
	this.res.end();
} 
else if(mess.indexOf("/reddit") == 0){
    this.res.writeHead(200);
	feed("https://www.reddit.com/.rss", function(err, articles) {
	  if (err) throw err;
	  // Each article has the following properties:
	  // 
	  //   * "title"     - The article title (String).
	  //   * "author"    - The author's name (String).
	  //   * "link"      - The original article link (String).
	  //   * "content"   - The HTML content of the article (String).
	  //   * "published" - The date that the article was published (Date).
	  //   * "feed"      - {name, source, link}
	  // 
	  	var ranInd = getRandomInt(0, articles.length);
		postMessage(striptags(articles[ranInd].title+": "+articles[ranInd].content)+" "+parseLink(articles[ranInd].content, articles[ranInd].link));
		//postMessage(striptags(articles[ranInd].title+": "+articles[ranInd].content));
	});
	this.res.end();
}

else if(mess.indexOf("/gif") ==0){

	 this.res.writeHead(200);
	feed("https://www.reddit.com/r/gifs/.rss", function(err, articles) {
			  if (err) throw err;
			  // Each article has the following properties:
			  // 
			  //   * "title"     - The article title (String).
			  //   * "author"    - The author's name (String).
			  //   * "link"      - The original article link (String).
			  //   * "content"   - The HTML content of the article (String).
			  //   * "published" - The date that the article was published (Date).
			  //   * "feed"      - {name, source, link} .
			  // 
			  	var ranInd = getRandomInt(0, articles.length);
				postMessage(striptags(articles[ranInd].title+": "+articles[ranInd].content)+" "+parseLink(articles[ranInd].content, articles[ranInd].link));
			});
			this.res.end();
}

else if(mess.indexOf("/postlevel ") ==0){
    this.res.writeHead(200);
	var newLevel = parseInt(mess.substring("/postlevel ".length));
	shitpost = newLevel;
	postMessage("Post frequency now "+newLevel);
	this.res.end();
}
else if(mess.indexOf("/mood ") ==0){
    this.res.writeHead(200);
	var newLevel = mess.substring("/mood ".length);
	if(newLevel.indexOf("calm")!=-1){
			mood = 0;
	}

	else if(newLevel.indexOf("raw")!=-1){
			maxAnswerLength=120;
			mood = 5;
	}
	else if(newLevel.indexOf("context")!=-1){
			context.splice(0, context.length);
			var ranint = getRandomInt(0, RandomPhrases.length);
			for(let i =0; i<PhrasesToInject;i++){
				context.push("("+botName+"): "+RandomPhrases[getRandomInt(0, RandomPhrases.length-1)]+"\n");
			}
			mood = 7;
	}
	else{
		newLevel="null"
	}
	postMessage("//mood now "+newLevel);
	this.res.end();
}
else if(mess.indexOf("/answerlength ") ==0){
    this.res.writeHead(200);
	var newLevel = parseInt(mess.substring("/answerlength ".length));
	maxAnswerLength = newLevel;
	postMessage("answerlength now "+newLevel);
	this.res.end();
}
else if(mess.indexOf("/temperature ") ==0){
    this.res.writeHead(200);

	var newLevel = parseFloat(mess.substring("/temperature ".length));
	if(newLevel > 1){
		newLevel = 1;
	}
	if(newLevel<0.1){
		newLevel = 0.1; //
	}
	temperature = newLevel;
	postMessage("temperature now "+newLevel+" default 0.82");
	this.res.end();
}
else if(mess.indexOf("/version") !=-1){
    this.res.writeHead(200);
	postMessage(version);
	this.res.end();
} 

else if(mess.indexOf("/listvar") == 0 && debug == 1){
    this.res.writeHead(200);
	e=new Date();
	var timeSinceBootSec = (e.getTime()-bootTime)/1000.0;
	postMessage("Uptime (seconds): "+timeSinceBootSec+", maxAnswerLength "+maxAnswerLength+", Mood: " + mood + ", MemorySize: " + memorySize + ", curAnsw: " + curAnsw + ", Shutup: " + shutup + ", shitpost: " + shitpost + ", mess: "+mess);
	this.res.end();
}
else if(mess.indexOf("/iamaprogrammer") ==0){
    this.res.writeHead(200);
	if(debug == 1){
		debug = 0;
		postMessage("debug mode turned off");
	}
	else{
		debug = 1;
		postMessage("debug mode turned on");
	}
	this.res.end();
}
else if(mess.indexOf("/testQuote ") ==0 && debug == 1){
    this.res.writeHead(200);
	var index = parseInt(mess.substring("/testQuote ".length));
	postMessage(RandomPhrases[index]);
	this.res.end();
}

else if(mess.indexOf("/shutup") ==0){
    this.res.writeHead(200);
	if(shutup){
	shutup = false;
	postMessage("Silent mode Enabled");

	}
	else{
		postMessage("Silent mode Disabled");
		shutup = true;
	}
	this.res.end();
}

else if(mess.indexOf("/help") ==0){
    this.res.writeHead(200);
	if(debug == 0){
	     postMessage("Current commands include:  news, reddit, rick, gif, version, shutup, answerlength, smartmode, and postlevel # (1 is highest). Include \"..\" in any message to direct it to me.");
	}
	if(debug == 1){
	     postMessage("Current commands include:  news, reddit, rick, gif, version, shutup, answerlength, smartmode, and postlevel. DEBUG COMMANDS: iamaprogrammer, listvar, testQuote (index)");
	}
	this.res.end();
}


  else {
    this.res.writeHead(200);
	randRange = shitpost;
	var ranInd = getRandomInt(0, randRange);
	if(ranInd == 1){
		
			var randomrssint = getRandomInt(0, RSSFeeds.length);
		feed(RSSFeeds[randomrssint], function(err, articles) {
			  if (err) throw err;
			  // Each article has the following properties:
			  // 
			  //   * "title"     - The article title (String).
			  //   * "author"    - The author's name (String).
			  //   * "link"      - The original article link (String).
			  //   * "content"   - The HTML content of the article (String).
			  //   * "published" - The date that the article was published (Date).
			  //   * "feed"      - {name, source, link} .
			  // 
			  	var randInd = getRandomInt(0, articles.length);
		if(articles[randInd]!=null){
				var toPostR=striptags(articles[randInd].title+": "+articles[randInd].content)+" "+parseLink(articles[randInd].content, articles[randInd].link);
				postMessage("//"+toPostR.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }));
		}
				
			});
	}
    this.res.end();
  }
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
   //return 0;
}
function cleanUp(input){  //ensures gpt can not say anything explicit about children
	var toWork = input.split(" ");
	for(i =0;toWork.length;i++){
		if(toWork[i].toLowerCase()=="kid"||toWork[i].toLowerCase()=="child")
			toWork[i]="adult";
	}
	var output = "";
	for(i =0;toWork.length;i++){
		output+=toWork[i]+" ";
	}
	return output;
		
}

function parseLink(text, alt) {

	var https = false;
	if(text.indexOf("http://i.imgur.com/") == -1){
		if(text.indexOf("https://i.imgur.com/") == -1){
			return alt;
		}
		else{
			https = true;
		}
	}
		var output = "";
		if(https){
		 	output = text.substring(text.indexOf("https://i.imgur.com/"));
		}
		else{
			output = text.substring(text.indexOf("http://i.imgur.com/"));
		}
		//output = output.substring(output.indexOf("\"")+1);
		output = output.substring(0, output.indexOf("\""));
		return output;
   //return 0;
}
function containsIgnoreCase(string1, string2){
	return string1.toUpperCase().indexOf(string2.toUpperCase()) != -1;
	//return false;
}
function startsWithIgnoreCase(string1, string2){
	return string1.toUpperCase().indexOf(string2.toUpperCase()) == 0;
	//return false;
}

function postMessage(res) {
  var botResponse, options, body, botReq;

	if(shutup == false){
  botResponse = res;
}else{
	botResponse = "";
}


