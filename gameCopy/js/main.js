function init() {



		var introVideo = document.getElementById("introVideo");
		var news = document.getElementById("news");
		var training = document.getElementById("training");
		var trainingPractice = document.getElementById("trainingPractice");
		var scene4 = document.getElementById("scene4");


		function hideAllScenes(){
			introVideo.style.display = "none";
			news.style.display = "none";
			training.style.display ="none";
			trainingPractice.style.display = "none";
			scene4.style.display = "none";
		}


		var button1 = document.getElementById("next1");

		button1.addEventListener("click", function() {
			hideAllScenes();
			news.style.display= "block";
			news.play();
			console.log("scene 2: news broacast")

		})

		var button2 = document.getElementById("next2");

		button2.addEventListener("click", function() {
			hideAllScenes();
			training.style.display ="block";
			console.log("introduction to training")

		})

		var button3 = document.getElementById("next3");

		button3.addEventListener("click", function() {
			hideAllScenes();
			trainingPractice.style.display = "block";
			console.log("scene 4: training Practice")
		})

		var button4 = document.getElementById("next4");

		button4.addEventListener("click", function() {
			hideAllScenes();
			scene4.style.display = "block";
			console.log("scene 4: play")
		})



		
}
