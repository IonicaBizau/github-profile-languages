(function($) {

    function xhr(url, method, params) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);

            var paramsString = seralizeFormParameters(params);

            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xhr.onload = function() {
                if (xhr.status !== 200) { reject(new Error(xhr.responseText, xhr.status)); }
                resolve(xhr.responseText);
            };
            xhr.onerror = reject;

            xhr.send(paramsString);
        });
    }

    function getJSON(url) {
        return xhr(url, 'get', null)
            .then(function(data) {
                console.log(data);
                return(data);
            })
            .then(JSON.parse);
    }

    function seralizeFormParameters(parameters) {
        if (!parameters) { return parameters; }
        return Object.keys(parameters).map(function(result, key) {
            return key + "=" + parameters[key];
        }).join('&');
    }

    window.addEventListener('load', function apiOnDomReady() {

        function getAllRepos(user, page, repos) {
            page = page || 1;
            repos = repos || [];
            try {
                return callback(null, JSON.parse(localStorage[user]));
            } catch (e) {
            }
            return getJSON("https://api.github.com/users/" + user + "/repos?per_page=100&page=" + page)
                .then(function (newRepos) {
                    if (newRepos.length) {
                        repos = repos.concat(newRepos);
                        return getAllRepos(user, ++page, repos);
                    }
                    repos = repos.filter(function (c) {
                        return !c.fork;
                    });
                    if (!repos.length) {
                        return Promise.reject(new Error('This user doesn\'t have any repositories.'));
                    }
                    localStorage[user] = JSON.stringify(repos);
                    return repos;
                })
                .catch(function(err) {
                    if (err.id < 400 || err.id > 600) { throw err; }
                    return Promise.reject(new Error(JSON.parse(err.message).message));
                });
        }

        var user = location.search.replace(/^\?\@?/g, "");
        if (!user) {
            return;
        }
        $(".loading").stop().fadeIn();

        getAllRepos(user)
            .then(function (repos) {
                $(".loading").stop().fadeOut();
                $(".error > .message").stop().fadeOut();
                var languages = {};
                repos.forEach(function (c) {
                    languages[c.language] = languages[c.language] || 0;
                    ++languages[c.language];
                });

                if (languages["null"]) {
                    languages["Others"] = languages["null"];
                    delete languages["null"];
                }

                var arr = Object.keys(languages).map(function (cLang) {
                    return {
                        title  : cLang
                        , value: languages[cLang]
                        , color: GH_COLORS[cLang]
                    };
                });
                arr.sort(function (a, b) {
                    return a.value < b.value ? 1 : -1;
                });
                $("#pieChart").drawPieChart(arr, {
                    legend: true
                });
            })
            .catch(function (err) {
                $(".error").stop().fadeIn();
                $(".error > .message").html(err || "This user doesn't have any repositories.");
                throw err; // So that it shows in the console.
            });
    });
})(jQuery);