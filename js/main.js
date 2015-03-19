$(function () {
    var $iframe = $("#graph")
      , $input = $(".form-elm")
      , $username = $(".username")
      , $embed = $(".embed textarea")
      , apiUrl = "https://ionicabizau.github.io/github-profile-languages/api.html"
      ;

    function check() {
        var user = unescape(Url.queryString("user"));
        $username.text(user ? "@" + user.replace(/^@/, "") + "'s" : "GitHub Profile");
        if (!user) { return; }
        $iframe.attr("src", "api.html?" + user);
        $input.val(user);
        $embed.val("<iframe width='600' height='600' src='" + apiUrl + "?" + user + "' frameborder='0'></iframe>");
    }

    var timer = null;
    $input.on("input", function () {
        Url.updateSearchParam("user", this.value)
        clearTimeout(timer);
        timer = setTimeout(function () {
            check();
        }, 1000);
    });

    check();

    $(".embed").on("click", function () {

    });

    $(".popup .close").on("click", function () {
        $(this).closest(".popup").fadeOut();
    });

    $(window).on("keydown", function (e) {
        if (e.which === 27) {
            $(".popup").fadeOut();
        }
    });

    $("[data-popup]").on("click", function () {
        $($(this).data("popup")).fadeIn();
    });
});
