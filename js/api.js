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
        }).error(function(err) {
            callback(err.responseJSON.message);
        })
    }

    var user = location.search.replace(/^\?\@?/g, "");
    if (!user) { return; }
    $(".loading").fadeIn();
    getAllRepos(user, function (err, repos) {
        $(".loading").fadeOut();
        if (err || !repos.length) {
            $(".error").fadeIn();
            return $(".error > .message").html(err || "This user doesn't have any repositories.");
        }
        $(".error > .message").fadeOut();
        var languages = {
        };
        repos.forEach(function (c) {
            languages[c.language] = languages[c.language] || 0;
            ++languages[c.language];
        });
        delete languages["null"];

        var arr = [];
        Object.keys(languages).forEach(function (cLang) {
            arr.push({
                title: cLang
              , value: languages[cLang]
              , color: GH_COLORS[cLang]
            });
        });
        arr.sort(function (a, b) {
            return a.value < b.value;
        });
        $("#pieChart").drawPieChart(arr, {
            legend: true
        });
    });
});
