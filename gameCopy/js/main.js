console.log("hi from main.js")	

var currentScene = 0;

$(document).ready(function(){
		var socket = io.connect('http://kcl389.itp.io:8899');


		var introVideo = document.getElementById("introVideo");
		var scene2 = document.getElementById("scene2");
		var news = document.getElementById("news");
		var scene3a =document.getElementById("scene3a");
		var training = document.getElementById("training");
		var trainingPractice = document.getElementById("trainingPractice");

		var scene4 = document.getElementById("scene4");

		updateScene(currentScene);
		var isaAnim= false;

		socket.on('test', _.debounce(function(d){
			console.log("test...", d);

		}, 1000))

		socket.on('getData', _.debounce(function(data) {
			console.log("HELLO");
			console.log(data);	
			
			// socket.o
			var rightDiv = document.getElementById('rightscreen');
	
			data = parseInt(data, 10);
			if (data == 5 && isaAnim == false) {
				console.log("video doesn't play");
				rightBrickVideo.pause();
				rightBrickVideo.style.display="none";
				rightBrickVideo.currentTime = 0;
				//rightscreen= document.body.style.backgroundColor = "green";
				// rightscreen= rightDiv.style.backgroundColor = "#261E3B";
			}

			else if (data > 20  && isaAnim) {
				isaAnim = true;
				console.log("video plays");
				rightBrickImage.style.display="none";
				rightBrickVideo.style.display="block";
				rightBrickVideo.play();
				

				
			}

			// _.debounce(function() {
			if(data==1) {
					// _.debounce(function() {
					console.log('-------------------data is 1');
					currentScene++;
					if (currentScene >= 10) {
						currentScene = 0;
					}
					console.log('*************currentScene: ', currentScene);
					updateScene(currentScene);
				// }, 500, {
				//   'leading': true,
		  // 		  'trailing': false
		  // 		})();
			}
		}, 1000));

		
		function updateScene(currentScene) {
			introVideo.style.display = 'none';
			scene2.style.display="none";
			scene3a.style.display="none";
			scene3b.style.display="none";
			training.style.display="none";		
			trainingPractice.style.display="none";
			scene4.style.display="none";

			if(currentScene==0) {
				introVideo.style.display="block";
			} else if(currentScene==1) {
				console.log("news video")
				scene2.style.display="block";

			} else if(currentScene==2) {
				console.log("letter")
				scene3a.style.display="block";
			} else if(currentScene==3) {
				console.log("training round 1")
				scene3b.style.display="block";
			} else if(currentScene==4) {
				console.log("break wall the first time")
				training.style.display="block";
			} else if(currentScene==5) {
				console.log("round 2")
				scenePractice.style.display="block";
			} else if(currentScene==6) {
				console.log("round 2 black wall break")
				scene4.style.display="block";
			}
		}	


		


		function hideAllScenes(){
			introVideo.style.display = "none";
			scene2.style.display = "none";
			news.style.display = "none";
			training.style.display ="none";
			trainingPractice.style.display = "none";
			scene4.style.display = "none";
		}


		var button1 = document.getElementById("next1");

		button1.addEventListener("click", function() {
			hideAllScenes();
			scene2.style.display= "block";
			news.style.display="block";
			news.play();
			console.log("scene 2: news broacast")

		})

		var button2 = document.getElementById("next2");

		button2.addEventListener("click", function() {
			hideAllScenes();
			scene3a.style.display="block";
			training.style.display ="block";
			training.play();
			console.log("introduction to training")

		})

		var button3 = document.getElementById("next3");

		button3.addEventListener("click", function() {
			hideAllScenes();
			scene3b.style.display="block";
			trainingPractice.style.display = "block";
			trainingPractice.play();
			console.log("scene 4: training Practice")
		})

		var button4 = document.getElementById("next4");

		button4.addEventListener("click", function() {
			hideAllScenes();
			scene4.style.display = "block";
			console.log("scene 4: play")
		})

});

		

