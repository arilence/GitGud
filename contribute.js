var LOCAL_STREAK_KEY = "contributionStreak";
var LOCAL_USERNAME_KEY = "githubUsername";

$(document).ready(function() {
  // localStorage.removeItem(LOCAL_STREAK_KEY);
  // localStorage.removeItem(LOCAL_USERNAME_KEY);
  renderView();
  setupText();

  $("#ask-form").submit(function( event ) {
    var inputUsername = $("#ask-form-username").val();
    if (inputUsername.length != 0) {
      saveUsername(inputUsername);
      renderView();
    }
    event.preventDefault();
  });
});

var renderView = function() {
  if (loadUsername() === null) {
    var source   = $("script#ask-form").html();
  } else {
    var source   = $("script#streak").html();
    getContributionData();
  }

  var template = Handlebars.compile(source);
  var html = template();
  $("#display").html(html);
}

var setupText = function() {
  $("#days").html(loadStreak());

  // Loops through the page and replace all text with locale compatible fields
  $('[data-locale]').each(function() {
    var el = $(this);
    var resourceName = el.data('locale');
    var resourceText = chrome.i18n.getMessage(resourceName);
    el.text(resourceText);
  });
}

var getContributionData = function() {
  $.get('https://github.com/users/' + loadUsername() + '/contributions')
    .done(function(data) {
      calculateStreak(data);
    })
    .fail(function() {
      showError();
    });
}

var calculateStreak = function(contribution) {
  var a = [[]];
  $(contribution).find('rect').each(function(){
    a.push([$(this).data('date'), $(this).attr('fill')]);
  });

  var previousColor = a[a.length-2][1];
  var count = 0;

  for (var i = a.length-2; i >= 0; i--) {
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
  return localStorage.getItem(LOCAL_STREAK_KEY);
}

var saveStreak = function(count) {
  localStorage.setItem(LOCAL_STREAK_KEY, count);
}

var showStreak = function(count) {
  $("#days").html(count);
}

var showError = function() {
  // Display an error to user
}