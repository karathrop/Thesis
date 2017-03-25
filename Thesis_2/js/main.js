// function init() {
$(document).ready(function(){
		var socket = io.connect('http://kcl389.itp.io:8874');


	

		var button1 = document.getElementById("play");

		button1.addEventListener("click", function() {
			introVideo.style.display= "none";
			scene2.style.display= "block";
			scene3.style.display ="none";
			scene4.style.display = "none";
			scene5.style.display = "none";
			// playLeft1.style.display = "none";
			// rightScreen.style.display = "none";

		})

		var button2 = document.getElementById("next1");

		button2.addEventListener("click", function() {
			introVideo.style.display = "none";
			scene2.style.display = "none";
			scene3.style.display ="block";
			scene4.style.display = "none";
			scene5.style.display = "none";

		})

		var button3 = document.getElementById("next2");

		button3.addEventListener("click", function() {
			introVideo.style.display = "none";
			scene2.style.display = "none";
			scene3.style.display ="none";
			scene4.style.display = "block";
			scene5.style.display = "none";

		})

		var button4 = document.getElementById("next3");

		button4.addEventListener("click", function() {
			introVideo.style.display = "none";
			scene2.style.display = "none";
			scene3.style.display ="none";
			scene4.style.display = "none";

			scene5.style.display = "block";
			// rightscreen.style.display = "block";
			// rightBrickImage.style.display = "block";

		})

		var rightVideo = document.getElementById('rightBrickVideo');


		socket.on('sensor', function(data) {
			console.log("HELLO");
				console.log(data);

				var rightDiv = document.getElementById('rightscreen');
		

				if (data == 0) {
					console.log("video doesn't play");
					rightBrickVideo.pause();
					rightBrickVideo.style.display="none";
					rightBrickVideo.currentTime = 0;
					//rightscreen= document.body.style.backgroundColor = "green";
					// rightscreen= rightDiv.style.backgroundColor = "#261E3B";
				}

				else if (data > 10) {
					console.log("video plays");
					rightBrickVideo.play();
					rightBrickVideo.style.display="block";

					
				}

				// else if (data == 10) {
				// 	console.log("video plays");
				// 	rightScreen.style.display ="block";
					
				// }

				// else if (data == 15) {
				// 	console.log("video plays");
				// 	rightScreen.style.display ="block";

				// }  else if (data == 20) {
				// 	console.log("video plays");
				// 	rightScreen.style.display ="block";
					
				
				// }
		});


		var breakwallRight = document.getElementById("breakwallRight");
		var breakwallLeft = document.getElementById("breakwallLeft")

		var nextVideo1 = document.getElementById("nextVideo1");
		var nextVideo2 = document.getElementById("nextVideo2");

		var leftBrickVideo = document.getElementById("leftBrickVideo");
		var rightBrickVideo = document.getElementById("rightBrickVideo");

		

		leftBrickVideo.onended = function(){
			leftBrickVideo.currentTime = 0;
		}

		rightBrickVideo.onended = function() {
			rightBrickVideo.currentTime = 0;
		}

		// nextVideo1.addEventListener("click", function() {
		// 	if(!leftBrickVideo.isPlaying){
		// 		leftBrickVideo.play();
		// 	}
			
		// })

		// nextVideo2.addEventListener("click", function() {
		// if(!rightBrickVideo.isPlaying){
		// 	rightBrickVideo.play();
		// 	}
			
		// })

		//Boolean for state
		// var isBreaking = true;
		// var isBlack = false;

		// videostates();

		// function videostates(){
		// 	requestAnimationFrame(videostates);
		// 	if(!isBreaking){
		// 		if(leftBrickVideo.currentTime > 1 && leftBrickVideo.currentTime < 2){

		// 		}
		// 	}
		// }
		// setInterval(function(){
		// 	console.log(leftBrickVideo.currentTime);
		// 	console.log(rightBrickVideo.currentTime);
		// 	if(leftBrickVideo.currentTime > 1.2){
		// 		leftBrickVideo.pause();
		// 		leftBrickVideo.currentTime = 0;
		// 	}
		// }, 10);

		// setInterval(function(){
			
		// 	console.log(rightBrickVideo.currentTime);
		// 	if(leftBrickVideo.currentTime > 1.0){
		// 		rightBrickVideo.pause();
		// 		rightBrickVideo.currentTime = 0;
		// 	}
		// }, 10);

		// function playVideoRight(videoURL) {
		// 	videos.play();
		// }
 
		// breakwallRight.addEventListener("click", function() {
		// 	playVideoRight("assets/rightBricks2.mp4");
		// })
		// // var button4 = document.getElementById("next3");

		// button4.addEventListener("click", function() {
		// 	scene1.style.display = "none";
		// 	scene2.style.display = "none";
		// 	play1.style.display = "none";
		// 	play2.style.display = "block";

		// })
// }
})
