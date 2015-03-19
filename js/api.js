$(function(){
    function getAllRepos (user, callback, page, repos) {
        page = page || 1;
        repos = repos || [];
        $.getJSON("https://api.github.com/users/" + user + "/repos?per_page=100&page=" + page, function (newRepos) {
            if (newRepos.length) {
                repos = repos.concat(newRepos);
                return getAllRepos (user, callback, ++page, repos);
            }
            callback (null, repos.filter(function (c) {
                return !c.fork;
            }));
        });
    }

    var user = location.search.replace(/^\?\@?/g, "");
    $(".loading").fadeIn();
    getAllRepos(user, function (err, repos) {
        $(".loading").fadeOut();
        if (!repos.length) {
            $(".error").fadeIn();
            return $(".error > .message").html("This user doesn't have any repositories.");
        }
        $(".error > .message").fadeOut();
        $("#pieChart").drawPieChart([
            { title: "Tokyo",         value : 180,  color: "#02B3E7" },
            { title: "San Francisco", value:  60,   color: "#CFD3D6" },
            { title: "London",        value : 50,   color: "#736D79" },
            { title: "New York",      value:  30,   color: "#776068" },
            { title: "Sydney",        value : 20,   color: "#EB0D42" },
            { title: "Berlin",        value : 20,   color: "#FFEC62" },
            { title: "Osaka",         value : 7,    color: "#04374E" }
        ]);
    });
});
