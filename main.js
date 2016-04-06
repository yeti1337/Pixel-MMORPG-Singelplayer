console.log('js loaded');
var ref = new Firebase('https://sizzling-heat-6129.firebaseio.com');

//NAVBAR options and change between containers. Watch out! Really badly done.
$('#game-pill').click(function(){
	$(this).addClass('active');
	$('#ladderboard-pill').removeClass('active')
	$('#game-container').removeClass('hidden');
	$('#ladderboard-container').addClass('hidden');
});


$('#ladderboard-pill').click(function(){
	$(this).addClass('active');
	$('#game-pill').removeClass('active')
	$('#ladderboard-container').removeClass('hidden');
	$('#game-container').addClass('hidden');
});


//Game
var dot = document.getElementById('dot');
var ctx = dot.getContext("2d");
	ctx.fillStyle = "gray";
	ctx.fillRect(0,0,400,400);

var gameRunning = false;	
var inFight = false;
var killedMonsters = 0;
var name;

Mousetrap.bind('r', checkScore);

Mousetrap.bind('i', function(e){
	$('#infobox').slideToggle();
});

Mousetrap.bind('s', function(e){
			if(!gameRunning){
				console.log("Game has been started!")
				$('#running').text("running")
				loadGame();
			}
});

function checkScore(){
		if(name == undefined || name == 'null'){
			$('#running').scrollUp();
			$('#running').text("you have to enter a name").css("color", "red");
			setTimeout(function() {
				if(gameRunning){
					$('#running').text("running").css("color", "black");
				} else {
					$('#running').text("Not running").css("color", "black");
				}
			}, 1000);
		} else {
			$('#farmName').text(name);
			ref.on('value', function(snapshot){
				$('#killedM').text(snapshot.val()['users'][name].score);
			});
		}
}

function changePixel(color){
	var dot = document.getElementById('dot');
	var ctx = dot.getContext("2d");
		ctx.fillStyle = color;
		ctx.fillRect(0,0,400,400);	
}

function loadGame(){
	gameRunning = true;
	changePixel("black");
	Mousetrap.bind('k', function(e){
		clearInterval(roundInterval);
		stopGame()
	})

	 Mousetrap.bind('space', function(e){});

	var roundInterval = setInterval(function(){  
		if(Math.floor((Math.random() * 10) + 1) == 3){
			clearInterval(roundInterval);
			monsterAppears();
		} else {
			changePixel("black");
		}
	}, 1000);
}
	

function monsterAppears(){
	var monsterHP = Math.floor((Math.random() * 25) + 1);
	var hits = 0;
	inFight = true;
	console.log("MONSTER!")
	changePixel("red");
		$('#dot').click(function(){
			if(inFight){
				hits = hits + 1;
				changePixel("pink");
			}		
		});


	Mousetrap.bind('k', function(e){
		clearInterval(fightRound);
		hits = 0;
		stopGame()
	})		


		var fightRound = setInterval(function(){ 
			if(monsterHP <= hits){
				hits == 0;
				clearInterval(fightRound);
				fightWon();
			} else {
				changePixel("red");
			}
		}, 500);
}

function fightWon(){
	inFight = false;
	changePixel("black");
	killedMonsters = killedMonsters + 1;
	$('#killedM').text(killedMonsters);
	if(name != 'null'){
		changeScore(name);
	}
	loadGame();
}

function stopGame(){
	gameRunning = false;
	changePixel("gray");
	$('#running').text("Not running")
}

$('#reg-laddername').keypress(function(e){
	if(e.keyCode == 13){
		changeName();
	}
});

$('#change-name').click(function(){
	changeName();
});

function changeName(){
	var TempName = $('#reg-laddername').val();
	if(TempName == "" || TempName == undefined || TempName == "null"){
		$('#farmName').text('Nobody');
		name = 'null';
	} else {
		ref.on('value', function(snapshot){
			if(snapshot.val()['users'][TempName] == undefined || snapshot.val()['users'][TempName] == null || snapshot.val()['users'] == null){
				ref.child('users').child(TempName).setWithPriority({name: TempName, score: 0}, 0)	
			} else {
				name = $('#reg-laddername').val();
				console.log('Change name to: ' + name);
				$('#farmName').text(name);
			}
		});
	}
}

function changeScore(name){
	if(name != 'null' || name != undefined || name != ''){
		var newScore
		ref.on('value', function(snapshot){
			newScore = snapshot.val()['users'][name].score + 1;
		});
		ref.child('users').child(name).setWithPriority({name: name,score: newScore}, newScore)
	}
};

//copied bluntly from the firebase example with some changes
var LEADERBOARD_SIZE = 5;
var refLeaderBoard = new Firebase('https://sizzling-heat-6129.firebaseio.com//users');
var htmlForPath = {};


function handleScoreAdded(scoreSnapshot, prevScoreName) {
	var newScoreRow = $("<tr/>");
	newScoreRow.append($("<td/>").append($("<em/>").text(scoreSnapshot.val().name)));
	newScoreRow.append($("<td/>").text(scoreSnapshot.val().score));


	htmlForPath[scoreSnapshot.key()] = newScoreRow;

	if (prevScoreName === null) {
		$("#leaderboardTable").append(newScoreRow);
	}
	else {
		var lowerScoreRow = htmlForPath[prevScoreName];
		lowerScoreRow.before(newScoreRow);
		}
}


function handleScoreRemoved(scoreSnapshot) {
	var removedScoreRow = htmlForPath[scoreSnapshot.key()];
	removedScoreRow.remove();
	delete htmlForPath[scoreSnapshot.key()];
}

var scoreListView = refLeaderBoard.limitToLast(LEADERBOARD_SIZE);

scoreListView.on('child_added', function (newScoreSnapshot, prevScoreName) {
	handleScoreAdded(newScoreSnapshot, prevScoreName);
});

scoreListView.on('child_removed', function (oldScoreSnapshot) {
		handleScoreRemoved(oldScoreSnapshot);
});

var changedCallback = function (scoreSnapshot, prevScoreName) {
	handleScoreRemoved(scoreSnapshot);
	handleScoreAdded(scoreSnapshot, prevScoreName);
};
	scoreListView.on('child_moved', changedCallback);
	scoreListView.on('child_changed', changedCallback);
