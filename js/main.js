$(function () {

    // jQuery Elements
    var $iframe = $("#graph")
      , $input = $(".form-elm")
      , $username = $(".username")
      , $embed = $(".embed textarea")
      , $twitter = $(".popup.twitter")
      , $facebook = $(".popup.facebook")
      , $gplus = $(".popup.gplus")
      , apiUrl = "https://ionicabizau.github.io/github-profile-languages/api.html"
      ;

    /**
     * check
     * Updates the user info
     *
     * @name check
     * @function
     * @return {undefined}
     */
    function check() {
        var user = unescape(Url.queryString("user"));
        $username.text(user ? "@" + user.replace(/^@/, "") + "'s" : "GitHub Profile");
        if (!user) { return; }
        $iframe.attr("src", "api.html?" + user);
        $input.val(user);
        $embed.val("<iframe width='600' height='600' src='" + apiUrl + "?" + user + "' frameborder='0'></iframe>");

        // Update social
        var escaped = escape(location.href);
        $facebook.attr("src", "https://www.facebook.com/sharer/sharer.php?u=" + escaped);
        $twitter.attr("src", "http://twitter.com/intent/tweet?text=A pie graph with my programming languages.&url=" + escaped);
        $facebook.attr("src", "https://plus.google.com/share?url=" + escaped);
    }

    // Writting the username
    var timer = null;
    $input.on("input", function () {
        Url.updateSearchParam("user", this.value)
        clearTimeout(timer);
        timer = setTimeout(function () {
            check();
        }, 1000);
    });

    check();

    // Popups
    $("[data-popup]").on("click", function () {
        $($(this).data("popup")).fadeIn();
    });

    $(window).on("keydown", function (e) {
        if (e.which === 27) {
            $(".popup").fadeOut();
        }
    });

    $(".popup .close").on("click", function () {
        $(this).closest(".popup").fadeOut();
    });
});
