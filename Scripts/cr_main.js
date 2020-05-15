$(document).ready(function () {
    DisplayHome();
    ResizeMoviesSection();

    BindSearchEvents();
    BindNavigationMenuEvents();
});

$(window).resize(function () {
    //triggering the recalculation only when the resize has stop
    // waitForFinalEvent(function () {
    //     ResizeMoviesSection();
    // }, 100, "contentWrapper");
    setTimeout(function () { ResizeMoviesSection(); }, 100);
});


function BindSearchEvents() {
	    $("#searchCtrl").on("focus", function () {
        $(this).addClass("focus");
    });

    $("#searchCtrl").on("focusout", function () {
        if ($(this).val() == "") {
            if ($(this).attr("updated") == "true") {
                HandleCancelSearch($(this));
            }
            else {
                $(this).removeClass("focus");
            }
        }
        else {
            if ($(this).attr("updated") == "true") {
                DisplaySearchResult($(this));
            }
        }
    });

    $("#searchCtrl").on("keyup", function (e) {
        if (e.keyCode != 13) {
            var sender = $(this);
            sender.attr("updated", "true");

            if (searchResultTimer != null) {
                clearInterval(searchResultTimer);
            }

            searchResultTimer = setInterval(function () {
                DisplaySearchResult(sender);
            }, 1000);
        }
        else {
            DisplaySearchResult($(this));
        }
    });

    $("#searchCtrl").on("search", function () {
        if ($(this).val() == "") {
            $(this).trigger("blur");
            HandleCancelSearch($(this));
        }
    });
}

function BindNavigationMenuEvents() {
	$(".menu-button").on("click", function () {
        $("#sideNav").css("width", "250px");
        $(".sideNav-overlay").css("display", "block");

        if ($("#sections-wrapper").find(".aboutPage-warning-title").length == 0) {
            $("#sections-wrapper").addClass("sideNav-overlay-content-transform");
        }
    });

    $(".closebtn").on("click", function () {
        $("#sideNav").css("width", "0");
    });

    $(".sideNav-overlay,.closebtn").on("click", function () {
        CloseSideNav();
    });

    $(".homeButton").on("click", function () {
        DisplayHome();
        CloseSideNav();
    });


    $(".sidenav span").on("click", function () {
        switch ($(this).data("categ")) {
            case -1:	//back from subcategories
                $("#moviesSections").css("display", "none");
                $("#moviesSections span").removeClass("selected-subSection");

                $("#rootNav").css("display", "block");
                break;

            case 0:		//home
                DisplayHome();
                CloseSideNav();
                break;

            case 1: 	//Movies
                $("#rootNav").css("display", "none");
                $("#moviesSections").css("display", "block");
                $("#rootNav span").removeClass("selected-subSection");
                break;

            case 10:	//Movies sub-sections
            case 11:
            case 12:
            case 13:
            case 14:
            case 15:
            case 16:
                SoftCloseSearch();

                $("#snapshotStat").html(moviesStat);
                $("#moviesSections span").removeClass("selected-subSection");
                $(this).addClass("selected-subSection");

                var firstLetters = $(this).data("titlestartwith").split(",");
                var moviesInSection = $.grep(moviesData, function (el) { return firstLetters.indexOf(el.FN.charAt(0)) >= 0; });

                BuildMoviesSection(moviesInSection);
                break;

            case 17:
                SoftCloseSearch();

                $("#moviesSections span").removeClass("selected-subSection");
                $(this).addClass("selected-subSection");

                BuildMoviesGridSection();
                break;

            case 2: //TV Series
                SoftCloseSearch();

                $("#snapshotStat").html(seriesStat);

                showingSeries = true;
                currentSeriesTypeViewDataM = seriesData;
                currentSeriesTypeViewDataD = episodesDataS;

                RenderSeriesTypeView();

                break;

            case 3: //Recordings
                SoftCloseSearch();

                $("#snapshotStat").html(recordingsStat);

                showingSeries = false;
                currentSeriesTypeViewDataM = recordingsData;
                currentSeriesTypeViewDataD = episodesDataR;

                RenderSeriesTypeView();

                break;

            case 4: //Collections
                SoftCloseSearch();

                $("#snapshotStat").html(colStat);

                RenderCollections();

                break;
        }
    });		
}

function ResizeMoviesSection() {
    var h = window.innerHeight - $(".master-toolbar").outerHeight() - $("footer").height();
    $("#sections-wrapper").height(h);

    //$("#newWrapper").css("bottom", $("footer").height() + "px");
    if (!isMobile()) {
        $("#sections-wrapper").slimScroll({
            height: h
        });
    }

    if ($("#jsGrid").length > 0) {
        var gridWrapperHeight = h - $(".jsgrid-pager-container").height() - 1;
        $("#jsGrid").height(gridWrapperHeight);
        $(".jsgrid-grid-body").height(gridWrapperHeight - $(".jsgrid-grid-header").height());
    }

    if ($(".detailsTableWrapper").length > 0) {
        $(".detailsTableWrapper").height(h - $("#seriesHeaderTable").height());
    }

    $(".card").removeClass("selectedCard");
    $('.detailLine').remove();

}