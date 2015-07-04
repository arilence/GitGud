
/**
 * Constants
 */
var LOCAL_STREAK_KEY = "contributionStreak";
var LOCAL_USERNAME_KEY = "githubUsername";
var INPUT_VIEW = "input_view";
var STREAK_VIEW = "streak_view";

/**
 * Instance variables
 */
var currentView;

/**
 * The fun begins here
 */
window.onload = function() {
  // getUsername() returns from localStorage
  if (getUsername() === null) {
    currentView = INPUT_VIEW;
    renderForm();
  } else {
    currentView = STREAK_VIEW;
    renderStreak();
  }
};

/**
 * Rendering code is split depending on what view needs to be shown
 */
var render = function(source, context) {
  var template = Handlebars.compile(source);
  var html = (context != null) ? template(context) : template(context);
  document.getElementById("display").innerHTML = html;
}

var renderForm = function() {
  var source = document.getElementById("ask-form").innerHTML;
  var context = {
    askFormQuestion: getLocalizedText('askFormQuestion'),
    askFormInputPlaceholder: getLocalizedText('askFormInputPlaceholder')
  }

  render(source, context);

  addSubmitEventListener();
}

var renderStreak = function() {
  var source = document.getElementById("streak").innerHTML;
  var context = {
    streakText: getLocalizedText('multiStreakText')
  }

  render(source, context);

  showStreak(getStreak());
  getContributionData();
}

var addSubmitEventListener = function() {
  var askForm = document.getElementById("ask-form");
  askForm.addEventListener("submit", function(event) {
    var inputUsername = document.getElementById("ask-form-username").value;
    Handlebars.Utils.escapeExpression(inputUsername);
    if (inputUsername.length != 0) {
      setUsername(inputUsername);
      renderStreak();
    }
    event.preventDefault();
  });
}

var getContributionData = function() {
  var xmlhttp;

  if (window.XMLHttpRequest) {
    // IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
      if(xmlhttp.status == 200){
        calculateStreak(xmlhttp.responseText);
      }
      else {
        // An error occurred
      }
    }
  }

  // open(method, url, async?)
  xmlhttp.open("GET", 'https://github.com/users/' + getUsername() + '/contributions', true);
  xmlhttp.send();
}

/**
 * Uses the graph SVG file from https://github.com/users/[username]/contributions
 * to calculate the total number of days contributed.
 * Hacky... I know.
 */
var calculateStreak = function(svgGraph) {
  var a = [[]];

  /*
   * Using the tags from the passed in SVG to get the contributions,
   * since github doesn't have a public API request for this stuff
   */
  var svgElement = document.createElement('svg');
  svgElement.innerHTML = svgGraph;
  var rectangles = svgElement.getElementsByTagName('rect');
  for (var i = rectangles.length-1; i >= 0; i--) {
    a[i] = ([rectangles[i].dataset.date, rectangles[i].getAttribute('fill')]);
  }

  var previousColor = a[a.length-1][1];
  var startColor = a[a.length-1][1];
  var count = 0;

  // Fixes the problem where a new day has started and the counter incorrectly resets to zero
  if (startColor == "#eeeeee" && a[a.length-2][1] != "#eeeeee") {
    previousColor = null;
  }
  else if (startColor != "#eeeeee") {
    count++;
  }

  // Calculate the streak
  for (var i = a.length-2; i >= 0; i--) {
    if (previousColor != "#eeeeee") {
      if (a[i][1] != "#eeeeee") {
        count++;
      }
      previousColor = a[i][1];
    }
  }

  setStreak(count);
  showStreak(count);
}

var getLocalizedText = function(name) {
  return chrome.i18n.getMessage(name);
}

var getUsername = function() {
  return localStorage.getItem(LOCAL_USERNAME_KEY);
}

var setUsername = function(username) {
  localStorage.setItem(LOCAL_USERNAME_KEY, username);
}

var getStreak = function() {
  var streak = localStorage.getItem(LOCAL_STREAK_KEY);
  return (streak === null) ? '0' : streak;
}

var setStreak = function(count) {
  localStorage.setItem(LOCAL_STREAK_KEY, count);
}

var showStreak = function(count) {
  if (count > 0) {
    document.getElementById("large").innerHTML = count;
    document.getElementById("tagline").innerHTML = getLocalizedText("multiStreakText");
  } else {
    document.getElementById("large").innerHTML = getLocalizedText("bigZeroStreakText");
    document.getElementById("tagline").innerHTML = getLocalizedText("zeroStreakText");
  }
}

/**
 * Debug.
 * Used to reset settings to default state
 */
var resetEverythingBackToOriginalState = function() {
  localStorage.removeItem(LOCAL_STREAK_KEY);
  localStorage.removeItem(LOCAL_USERNAME_KEY);

  renderForm();
}