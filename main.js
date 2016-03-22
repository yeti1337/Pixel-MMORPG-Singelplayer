function pageLoad(){
	var dot = document.getElementById('dot');
	var ctx = dot.getContext("2d");
		ctx.fillStyle = "gray";
		ctx.fillRect(0,0,400,400);

	var gameRunning = false;	
	var killedMonsters = 0;

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
			if(Math.floor((Math.random() * 10) + 1) == 9){
				clearInterval(roundInterval);
				monsterAppears();
			}{
				changePixel("black");
			}
		}, 1000);
	}
	
	
	function monsterAppears(){
		var monsterHP = Math.floor((Math.random() * 25) + 1);
		var hits = 0;
		console.log("MONSTER!")
		changePixel("red");
		Mousetrap.bind('space', function(e){
			hits = hits + 1;
			changePixel("pink");
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
		changePixel("black");
		killedMonsters = killedMonsters + 1;
		$('#killedM').text(killedMonsters);
		loadGame();
	}

	function stopGame(){
		gameRunning = false;
		changePixel("gray");
		$('#running').text("Not running")
	}

}

