$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
      $("#articles").append("<p data id='" + data[i]._id + ">" + data[i].title + "<br />" + data[i].link + "</p>" + data[i].p + "</p>");
  }
});


$(document).on("click", "p", function() {
  $("#notes").empty();
  const thisId = $(this).attr("data-id");

  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
  })
})