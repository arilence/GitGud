$(document).ready(function() {
  setupLocalization();
  getContributionData();
});

var setupLocalization = function() {
  $("#text").html(chrome.i18n.getMessage("streakText"));
}

var getContributionData = function() {
  $.get('https://github.com/users/lawsmith/contributions')
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

  showStreak(count);
}

var showStreak = function(count) {
  $("#days").html(count);
}

var showError = function() {
  // Display an error to user
}