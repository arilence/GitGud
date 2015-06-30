var LOCAL_STREAK_KEY = "contributionStreak";
var LOCAL_USERNAME_KEY = "githubUsername";

window.onload = function() {
  // localStorage.removeItem(LOCAL_STREAK_KEY);
  // localStorage.removeItem(LOCAL_USERNAME_KEY);

  if (loadUsername() === null) {
    renderForm();
  } else {
    renderStreak();
  }

  setLocalizedText();
};

var renderForm = function() {
  var source = document.getElementById("ask-form").innerHTML;
  render(source);

  addSubmitEventListener();
}

var renderStreak = function() {
  var source = document.getElementById("streak").innerHTML;
  render(source);

  document.getElementById("days").innerHTML = loadStreak();
  getContributionData();
}

var render = function(sourceView) {
  var template = Handlebars.compile(sourceView);
  var html = template();
  document.getElementById("display").innerHTML = html;
}

var setLocalizedText = function() {
  // Loops through the page and replace all text with locale compatible fields
  var dataLocale = document.querySelectorAll('[data-locale]');
  for (var i = 0; i < dataLocale.length; i++) {
    var resourceName = dataLocale[i].dataset.locale;
    dataLocale[i].innerHTML = chrome.i18n.getMessage(resourceName);
  }
}

var addSubmitEventListener = function() {
  var askForm = document.getElementById("ask-form");
  askForm.addEventListener("submit", function(event) {
    var inputUsername = document.getElementById("ask-form-username").value;
    if (inputUsername.length != 0) {
      saveUsername(inputUsername);
      renderView();
    }
    event.preventDefault();
  });
}

var getContributionData = function() {
  var xmlhttp;

  if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
  } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
         if(xmlhttp.status == 200){
             calculateStreak(xmlhttp.responseText);
         }
         else if(xmlhttp.status == 400) {
            alert('There was an error 400');
         }
         else {
             alert('something else other than 200 was returned');
         }
      }
  }

  xmlhttp.open("GET", 'https://github.com/users/' + loadUsername() + '/contributions', true);
  xmlhttp.send();
}

var calculateStreak = function(svgGraph) {
  var a = [[]];

  var svgElement = document.createElement('svg');
  svgElement.innerHTML = svgGraph;
  var rectangles = svgElement.getElementsByTagName('rect');

  for (var i = rectangles.length-1; i >= 0; i--) {
    a[i] = ([rectangles[i].dataset.date, rectangles[i].getAttribute('fill')]);
  }

  var previousColor = a[a.length-1][1];
  var count = 0;

  for (var i = a.length-1; i >= 0; i--) {
    if (previousColor != "#eeeeee") {
      if (a[i][1] != "#eeeeee") {
        count++;
      }
      previousColor = a[i][1];
    }
  }

  saveStreak(count);
  showStreak(count);
}

var loadUsername = function() {
  return localStorage.getItem(LOCAL_USERNAME_KEY);
}

var saveUsername = function(username) {
  localStorage.setItem(LOCAL_USERNAME_KEY, username);
}

var loadStreak = function() {
  var streak = localStorage.getItem(LOCAL_STREAK_KEY);
  return (streak === null) ? '0' : streak;
}

var saveStreak = function(count) {
  localStorage.setItem(LOCAL_STREAK_KEY, count);
}

var showStreak = function(count) {
  document.getElementById("days").innerHTML = count;
}

var showError = function() {
  // Display an error to user
}