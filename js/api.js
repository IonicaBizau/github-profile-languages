(function (doc) {
    window.addEventListener("load", function apiOnDomReady() {

        var loading = doc.querySelector(".loading")
          , errorDiv = doc.querySelector(".error")
          , errorMessage = errorDiv.querySelector(".message")
          , input = (Url.queryString("user") || location.search).replace(/^\?@?/g, "")
          , token = Url.queryString("token")
          ;

        if (!input) {
            return;
        }

        let search = location.search;
        search = search[0] === '?' ? search.substr(1) : search;
        search = search.split('&');

        let params = [];

        search.forEach(param => {
            let obj = param.split('=')
            obj = {
                p: obj[0],
                v: obj[1]
            }
            params.push(obj)
        });

        params.forEach(e => {
            if (e.p === 'exclude') {
                localStorage.setItem('exc', e.v)
            }
        });

        var token = Url.queryString("token") || undefined;
        if (token) {
            input = Url.queryString("input");
            if (!input) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = "If you are using a token, please provide the 'input' querystring parameter.";
            }
        }

        loading.classList.add("visible");


        function getStats(input, callback) {

            var fromLocalStorage = localStorage[input];
            try {
                fromLocalStorage = JSON.parse(fromLocalStorage);
            } catch (e) {
                fromLocalStorage = null;
            }

            if (Array.isArray(fromLocalStorage)) {
                return callback(null, fromLocalStorage);
            }

            var polyglot = new GitHubPolyglot(input, token)
              , func = polyglot.userStats
              ;

            if (localStorage[input]) { return callback(null, localStorage[input]); }


            if (polyglot.repo) {
                func = polyglot.repoStats
            }

            func.call(polyglot, function (err, stats) {
                if (err) {
                    return callback(err);
                }

                try {
                    localStorage[input] = JSON.stringify(stats);
                } catch (e) {
                    localStorage.clear();
                }

                callback(null, stats);
            });
        }

        getStats(input, function (err, stats) {
            loading.classList.remove("visible");
            if (err) {
                errorDiv.classList.add("visible");
                return errorMessage.textContent = err || "This user doesn't have any repositories.";
            }

            let newStats = [];

            if (localStorage.getItem('exc')) {
                let excludedLanguages = localStorage.getItem('exc').split(',');

                stats.forEach(e => {
                    if (!excludedLanguages.includes(e.label.toLowerCase())) {
                        newStats.push(e);
                    }
                });
            }

            newStats = newStats.length ? newStats : [...stats];
            newStats.sort(function (a, b) {
                return a.value < b.value ? 1 : -1;
            });

            let total = 0;
            newStats.forEach(function (c) {
                total = total+c.value;
            });

            newStats.forEach(function (c) {
                c.value = Math.round( ((c.value/total)*100) * 100 + Number.EPSILON ) / 100;
                c.title = c.label;
                delete c.label;
            });

            drawPieChart.call(doc.querySelector("#pieChart"), newStats, {
                legend: true,
                onPieMouseenter: function (e, data) {
                    let text = document.getElementsByClassName("pieTip")[0].textContent;
                    document.getElementsByClassName("pieTip")[0].textContent = text+"%";
                }
            });

        });
    });
})(document);
