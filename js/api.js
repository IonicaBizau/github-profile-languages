$(function(){
    function getAllRepos (user, callback, page, repos) {
        page = page || 1;
        repos = repos || [];
        try {
            return callback(null, JSON.parse(localStorage[user]));
        } catch (e) {}
        $.getJSON("https://api.github.com/users/" + user + "/repos?per_page=100&page=" + page, function (newRepos) {
            if (newRepos.length) {
                repos = repos.concat(newRepos);
                return getAllRepos (user, callback, ++page, repos);
            }
            repos = repos.filter(function (c) {
                return !c.fork;
            });
            localStorage[user] = JSON.stringify(repos);
            callback (null, repos);
        }).error(function(err) {
            callback(err.responseJSON.message);
        })
    }

    var user = location.search.replace(/^\?\@?/g, "");
    if (!user) { return; }
    $(".loading").stop().fadeIn();
    getAllRepos(user, function (err, repos) {
        $(".loading").stop().fadeOut();
        if (err || !repos.length) {
            $(".error").stop().fadeIn();
            return $(".error > .message").html(err || "This user doesn't have any repositories.");
        }
        $(".error > .message").stop().fadeOut();
        var languages = {
        };
        repos.forEach(function (c) {
            languages[c.language] = languages[c.language] || 0;
            ++languages[c.language];
        });
        languages["Others"] = languages["null"];
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
            return a.value < b.value ? 1 : -1;
        });
        $("#pieChart").drawPieChart(arr, {
            legend: true
        });
    });
});
