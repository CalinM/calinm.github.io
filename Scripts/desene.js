$(document).ready(function () {
    DisplayHome();
    ResizeMoviesSection();

    $(".menu-button").on("click", function () {
        $("#sideNav").css("width", "250px");
        $(".sideNav-overlay").css("display", "block");

        if ($("#sections-wrapper").find(".aboutPage-warning-title").length == 0) {
            $("#sections-wrapper").addClass("sideNav-overlay-content-transform");
        }
    });

	var displaySearchResult = function(s) {
        if (searchResultTimer != null) {
            clearInterval(searchResultTimer);
        }

		$(s).attr("updated", "false");

		var searchedString = $(s).val().toLowerCase();
		var titlesMatchingSearchCriteria = $.grep(detaliiFilme, function (el) { return el.FN.toLowerCase().indexOf(searchedString) >= 0; });
		buildMoviesSection(titlesMatchingSearchCriteria);
	}

	var handleCancelSearch = function(s) {
		$(s).removeClass("focus");

		var prevSelectedMoviesSection = $("#moviesSections .selected-subSection")[0];
		if (prevSelectedMoviesSection != null)
		{
            if ($(prevSelectedMoviesSection).data("titlestartwith") != null)
            {
                var firstLetters = $(prevSelectedMoviesSection).data("titlestartwith").split(",");
                var moviesInSection = $.grep(detaliiFilme, function (el) { return firstLetters.indexOf(el.FN.charAt(0)) >= 0; });

                buildMoviesSection(moviesInSection);
            }
            else
            {
                buildMoviesGridSection();
            }
		}
		else {
			DisplayHome();
		}
	}

	$("#searchCtrl").on("focus" , function() {
		$(this).addClass("focus");
	});

	$("#searchCtrl").on("focusout" , function() {
        if ($(this).val() == "") {
            if ($(this).attr("updated") == "true") {
                handleCancelSearch($(this));
            }
            else {
                $(this).removeClass("focus");
            }
        }
        else {
            if ($(this).attr("updated") == "true") {
                displaySearchResult($(this));
            }
        }
	});

    var searchResultTimer = null;
	$("#searchCtrl").on("keyup" , function(e) {
		if (e.keyCode != 13) {
            var sender = $(this);
            sender.attr("updated", "true");

            if (searchResultTimer != null) {
                clearInterval(searchResultTimer);
            }

            searchResultTimer = setInterval(function() {
                displaySearchResult(sender);
            },
            1000);
        }
		else {
			displaySearchResult($(this));
        }
	});

	$("#searchCtrl").on("search" , function() {
		if ($(this).val() == "")
		{
            $(this).trigger("blur");
			handleCancelSearch($(this));
		}
	});


    $(".closebtn").on("click", function () {
        $("#sideNav").css("width", "0");
    });

    $(".sideNav-overlay,.closebtn").on("click", function () {
        CloseSideNav();
    });


	var buildMoviesSection = function(moviesInSection) {
		var sectionHtml =
			"<div class=\"container\">" +
			    "<div class=\"cards\">";

		var mobileClass = "";//= isMobile() ? "cardM" : "";
		moviesInSection.forEach(function (el) {
			sectionHtml +=
                    "<div class=\"card " + mobileClass + "\">" +
                        "<div class=\"movie-detail-wrapper\" data-movieId=\"" + el.Id + "\">" +
                            "<div class=\"movie-detail\">" +
                                //the movieId is also placed on the Poster to be visible in the lazy loading process

                                (
                                    el.Tr == null || el.Tr == ""
                                        ? "<img data-src=\"Imgs/poster-" + el.Id + ".jpg\" data-movieId=\"" + el.Id + "\" class=\"movie-cover lazy\" alt=\"Loading poster ...\">"
                                        : "<a class='movieTrailerLink' href='https://www.youtube.com/watch?v=" + el.Tr + "'>" +
                                        "<img data-src=\"Imgs/poster-" + el.Id + ".jpg\" data-movieId=\"" + el.Id + "\" class=\"movie-cover withTrailer lazy\" alt=\"Loading poster ...\">" +
                                        "</a>"
                                ) +

                            "</div>" +
                            "<div class=\"movie-detail\">" +
                                (
                                    el.R != ""
                                        ? "<a class='recommended' title='Recomandat: " + el.R + "&#013Click for details ...' href='" + el.RL + "' target='_blank'>" + el.R.replace("+", "") + "</a>"
                                        : "<div class='recommended' title='Recomandare necunoscuta'>?</div>"
                                    ) +

                                    "<a class='recommended info' title='Tematica: " + (el.T == "" ? "-" : el.T) + "&#013An: " + el.Y + "&#013Durata: " + (el.L == "" || el.L == "00:00:00" ? "?" : el.L) + "&#013Click for details ...' href='" + el.DL + "' target='_blank'>i</a>" +
                                    "<div class='quality' title='Dimensiune: " + el.S + "&#013Bitrate: " + el.B + "'>" + (el.Q == 0 ? "FHD" : el.Q == 1 ? "HD" : "SD") + "</div>" +
                                    "<div class='audio' title='Subtitrari: " + el.SU + "&#013SursaNl: " + el.Nl + "'>" + el.A + "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>";
		}, this);

		sectionHtml +=
			    "</div>" +
			"</div>";

		$("#sections-wrapper").scrollTop(0);
		$("#sections-wrapper").html(sectionHtml);

		setTimeout(function () {
			$("#sections-wrapper .lazy").lazy({
				appendScroll: $("#sections-wrapper"),
				onError: function (element) {
					var movieId = $(element).data("movieid");
					var movieCard = $(".movie-detail-wrapper[data-movieid=\"" + movieId + "\"] .movie-detail:first");

					movieCard.html($("#posterNotFound").html());

					var movieWithoutPoster = $.grep(detaliiFilme, function (el) { return el.Id == movieId });
					movieCard.find(".movieTitle-posterNotFound:first").text(movieWithoutPoster.length != 1
						? "Error retrieving movie title!"
						: movieWithoutPoster[0].FN);
				},
			});

			$("#sections-wrapper").slimScroll({
				height: $("#sections-wrapper").height()
			});

			$(".movieTrailerLink").YouTubePopUp();
		}, 100);

		CloseSideNav();
		$(".about-message-img").css("display", "none");
    }

    var buildMoviesGridSection = function() {
        var sectionHtml =
            "<div id=\"jsGrid\"></div>" +
            "<div id=\"jsGridPager\">" +
                "<div style=\"display:table-row;\">" +
                    "<div id=\"pager-wrapper\">" +
                    "</div>" +
                    "<div id=\"pager-customOptions\">" +
                        "<div style=\"display: inline-block;\">" +
                            "Page size:" +
                        "</div>" +
                        "<div style=\"display: inline-block; padding-left: 5px;\">" +
                        "<select id=\"gridPageCount\" onchange=\"setPageCount()\">" +
                            "<option value=\"10\">10</option>" +
                            "<option value=\"20\" selected=\"selected\">20</option>" +
                            "<option value=\"50\">50</option>" +
                            "<option value=\"100\">100</option>" +
                        "</select>" +
                    "</div>" +
                    "</div>	" +
                "</div>" +
            "</div>";

        $("#sections-wrapper").html(sectionHtml);

        var db = {
            loadData: function (filter) {
                return $.grep(detaliiFilme, function (el) {
                    return (!filter.FN || el.FN.toLowerCase().indexOf(filter.FN.toLowerCase()) > -1)
                        && (!filter.Y || el.Y == filter.Y)
                        && (!filter.R || el.R.indexOf(filter.R) > -1)
                        && (!filter.A || el.A.toLowerCase().indexOf(filter.A.toLowerCase()) > -1)
                        && (!filter.SU || el.SU.toLowerCase().indexOf(filter.SU.toLowerCase()) > -1)
                        && (!filter.T || el.T.indexOf(filter.T) > -1)
                        && (!filter.Q || el.Q == filter.Q);
                });
            }
        };

        db.distinctTematica = [];
        db.distinctRecomandat = [];

        $.each(detaliiFilme, function (index, movie) {
            if (movie.T != "") {
                var x = $.grep(db.distinctTematica, function (e) { return e.Name == movie.T; });
                if (x.length == 0) {
                    db.distinctTematica.push({ Name: movie.T, Id: movie.T });
                }

                x = $.grep(db.distinctRecomandat, function (e) { return e.Name == movie.R.replace("?", ""); });
                if (x.length == 0 && movie.R != "" && movie.R != "?") {
                    db.distinctRecomandat.push(
                        {
                            Name: movie.R.replace("?", ""),
                            Id: movie.R.replace("?", "")
                        });
                }
            }
        });

        db.distinctTematica.sort(function (a, b) {
            var a1 = a.Name,
                b1 = b.Name;

            if (a1 == b1) return 0;
            return a1 > b1 ? 1 : -1;
        });

        db.distinctRecomandat.sort(function (a, b) {
            var a1 = parseInt(a.Name.replace(/\W/g, "")),
                b1 = parseInt(b.Name.replace(/\W/g, ""));

            if (a1 == b1) return 0;
            return a1 > b1 ? 1 : -1;
        });

        db.distinctRecomandat.splice(0, 0,
            {
                Name: "?",
                Id: "?"
            });

        db.distinctRecomandat.splice(0, 0,
            {
                Name: "Any",
                Id: ""
            });

        db.calitate =
            [
                { Name: "All", Id: "" },
                { Name: "FullHD", Id: 0 },
                { Name: "HD", Id: 1 },
                { Name: "SD", Id: 2 },
                //{Name: "HD_up", Id: 3}, //la seriale
                //{Name: "Mix", Id: 4} //la seriale, SD cu HD
            ];

        //https://github.com/tabalinas/jsgrid/issues/60
        //https://stackoverflow.com/questions/35887675/empty-option-when-filtering

        $("#jsGrid").jsGrid({
            height: $("#sections-wrapper").height(),
            width: "100%",

            controller: db,
            autoload: true,
            filtering: true,
            sorting: true,

            paging: true,
            pagerContainer: "#pager-wrapper",
            pagerFormat: "Page {pageIndex} of {pageCount} ({itemsCount} items) {first} {prev} {pages} {next} {last} &nbsp;&nbsp;  ",
            pageButtonCount: 5,
            pageSize: 20,
            pagePrevText: "<",
            pageNextText: ">",
            pageFirstText: "<<",
            pageLastText: ">>",

            fields: [

                {
                    name: "Titlu", title: "Title", type: "text", width: 150,
                    itemTemplate: function (value, item) {

                        var link = item.DL != null ? item.DL : "www.imdb.com";
                        var tooltip = item.N != "" ? "title=\"" + item.N + "\"" : "";

                        return item.DL != "" || item.N != ""
                            ? $("<div>").html(
                                "<div style=\"display: table; width: 100%\">" +
                                    "<div style=\"display: table-row;\">" +
                                        "<div style=\"display: table-cell;\">" + value +
                                        "</div>" +
                                        "<div style=\"display: table-cell; width: 25px; vertical-align: middle;\">" +
                                            "<a href=\"" + link + "\" target=\"_blank\" " + tooltip + ">" +
                                                "<img src=\"Images\\info.png\" style=\"display: block; margin: 0 auto; opacity: 0.5;\" alt=\"i\">" +
                                            "</a>" +
                                        "</div>" +
                                    "</div>" +
                                "</div>")
                            : value;
                    },


                },
                { name: "An", title: "Year", type: "text", width: 50, align: "center" },
                {
                    name: "Recomandat", title: "Recommended", type: "select", width: 50, items: db.distinctRecomandat, valueField: "Id", textField: "Name",
                    itemTemplate: function (value, item) {
                        return item.RL != ""
                            ? $("<a>").attr("href", item.RL).attr("target", "_blank").text(value)
                            : value;
                    },
                },
                {
                    name: "DurataStr", title: "Length", type: "text", width: 50, align: "center",
                    itemTemplate: function (value) {
                        return value == "00:00:00" ? "?" : value;
                    },
                    //filtering: false
                },
                {
                    name: "Calitate", title: "Quality", type: "select", width: 50, align: "center", items: db.calitate, valueField: "Id", textField: "Name",
                    /* 					itemTemplate: function(value, item) {
                                            if (value == 2) {
                                                var toolTip = "Resolution: " + (item.Rezolutie == "" ? "?" : item.Rezolutie) + "\nFile format: " + (item.Format == "" ? "?" : item.Format);
                                                return $("<label>").attr("title", toolTip).attr("style", "cursor: help").text(getByValue(db.calitate, "Id", value, "Name"));
                                            }
                                            else						//(arr, propId, value, propReturn) {
                                                return getByValue(db.calitate, "Id", value, "Name");
                                        },  */
                },
                {
                    name: "Audio", type: "text", width: 50, align: "center",
                    itemTemplate: function (value, item) {
                        var nlSource;

                        if (item.Nl == "" && item.A.toLowerCase().indexOf("nl") > -1)
                            nlSource = "not specified!";
                        else
                            if (item.Nl != "" && item.A.toLowerCase().indexOf("nl") == -1)
                                nlSource = "wrong data!";
                            else {
                                switch (item.Nl) {
                                    case "*":
                                        nlSource = "BDRip/Bluray";
                                        break;

                                    case "**":
                                        nlSource = "DVD";
                                        break;

                                    case "***":
                                        nlSource = "DivX";
                                        break;

                                    default:
                                        nlSource = "unknown or multiple (" + item.Nl + ")"
                                        break;
                                }
                            }

                        var tooltip = "Nl source: " + nlSource; //+"<br>"
                        return $("<label>").attr("title", tooltip).attr("style", "cursor: help").text(value);
                    },
                },
                { name: "Subtitrari", title: "Subtitles", type: "text", width: 50, align: "center" },
                {
                    name: "Tematica", title: "Theme", type: "select", width: 50, align: "center", items: db.distinctTematica, valueField: "Id", textField: "Name",
                    filterTemplate: function () {
                        var $select = jsGrid.fields.select.prototype.filterTemplate.call(this);
                        $select.prepend($("<option>").prop("value", "").text("All").attr("selected", "selected"));
                        return $select;
                    }
                },
                {
                    name: "Dimensiune", title: "Size", type: "text", width: 50, align: "right",
                    //filtering: false,
                    itemTemplate: function (value, item) {
                        return $("<label>").attr("title", "Bitrate: " + item.B).attr("style", "cursor: help").text(value);
                    },
                },
            ],

            onInit: function () {
                //placing the pager in an external element leaves the grid with a gap
                setTimeout(function () {
                    $("#jsGrid").height($("#sections-wrapper").height() - $(".jsgrid-pager-container").height() - 1); //-1 = top-border

                    $(".jsgrid-filter-row").find(".jsgrid-cell:nth-child(4)").find("input").attr("disabled", true);
                    $(".jsgrid-filter-row").find(".jsgrid-cell:nth-child(9)").find("input").attr("disabled", true);
                }, 0);
            },
            onRefreshed: function () {
                $(".jsgrid-pager").contents().filter(function () {
                    return this.nodeType == 3;
                }).each(function () {
                    this.textContent = this.textContent.replace('{itemsCount}', $("#jsGrid").jsGrid("_itemsCount"));
                });

                $("#jsGrid").height($("#sections-wrapper").height() - $(".jsgrid-pager-container").height() - 1); //-1 = top-border
            }
        });

        CloseSideNav();
        $(".about-message-img").css("display", "none");
    }

    $(".sidenav span").on("click", function () {
        switch ($(this).data("categ")) {
            case -1:	//back from subcategories
                $("#moviesSections").css("display", "none");
                $("#moviesSections span").removeClass("selected-subSection");

                $("#rootNav").css("display", "block");
                break;

            case 0:		//about
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

                $("#snapshotStat").html(detaliiListaF);
                $("#moviesSections span").removeClass("selected-subSection");
                $(this).addClass("selected-subSection");

				var firstLetters = $(this).data("titlestartwith").split(",");
				var moviesInSection = $.grep(detaliiFilme, function (el) { return firstLetters.indexOf(el.FN.charAt(0)) >= 0; });

				buildMoviesSection(moviesInSection);
                break;

            case 17:
                SoftCloseSearch();

                $("#moviesSections span").removeClass("selected-subSection");
                $(this).addClass("selected-subSection");

                buildMoviesGridSection();
                break;

            case 2: //TV Series
                SoftCloseSearch();

                $("#snapshotStat").html(detaliiListaS);
                $(this).addClass("selected-subSection");

                var sectionHtml =
                    "<table id=\"seriesHeaderTable\" class=\"tableWrapper\">" +
                        "<tr class=\"headerRow\">" +
                            "<td style=\"width: 30px;\">" +
                            "</td>" +
                            "<td>" +
                                "Series name</br>/ Episode title" +
                            "</td>" +
                            "<td class=\"markerCol\">" +
                            "</td>" +
                            "<td class=\"detailCell w100\">" +
                                "Recommended" +
                            "</td>" +
                            "<td class=\"detailCell w80\">" +
                                "Quality" +
                            "</td>" +
                            "<td class=\"detailCell w100\">" +
                                "Size" +
                            "</td>" +
                            "<td class=\"detailCell w100\">" +
                                "Audio" +
                            "</td>" +
                            "<td class=\"detailCell w125\">" +
                                "Year" +
                            "</td>" +
                            "<td class=\"detailCell w125\">" +
                                "No. of episodes / Theme" +
                            "</td>" +
                        "</tr>" +
                    "</table>" +

                    "<div class=\"detailsTableWrapper\">" +
                        "<table id=\"seriesMainTable\" class=\"tableWrapper\">";

                var serialIndex = 0;

                detaliiSeriale.forEach(function (serial) {
                    serialIndex++;

                    var link = serial.DL != null ? serial.DL : "www.imdb.com";
                    var tooltip = serial.N != "" ? serial.N + "&#013" : "";
                    tooltip += "Click for details ...";

                    var episoadeSerial = $.grep(detaliiEpisoade, function (el) { return el.SerialId == serial.Id; });
                    var alternateRowClass = serialIndex % 2 == 0 ? " alternateRow" : "";

                    var differentAudioStyle = serial.DifferentAudio
                        ? "style=\"color: red; cursor: help;\" title=\"Exista episoade cu diferente in track-urile audio (ex. nu sunt dublate Ro)\""
                        : "";

                    sectionHtml +=
                            "<tr class=\"seriesLine noselect lineWithDetails" + alternateRowClass + "\">" +
                                "<td class=\"markerCol\">" +
                                    "<div class=\"markerSymbol serialExpander collapsed\" data-serialId=\"" + serial.Id + "\" alt=\">\"></div>" +
                                "</td>" +
                                "<td>" +
                                    serial.FN +
                                "</td>" +
                                "<td>" +
                                    "<a href=\"" + link + "\" target=\"_blank\" title=\"" + tooltip + "\">" +
                                        "<img src=\"Images\\info.png\" style=\"display: block; margin: 0 auto; opacity: 0.5;\" alt=\"i\">" +
                                    "</a>" +
                                "</td>" +
                                "<td class=\"detailCell w100\">" +
                                    (serial.R != ""
                                        ? "<a class='recommended' style='float: unset; margin: 0px;' title='Recomandat: " + serial.R + "&#013Click for details ...' href='" + serial.RL + "' target='_blank'>" + serial.R.replace("+", "") + "</a>"
                                        : "<div class='recommended' style='float: unset; margin: 0px;' title='Recomandare necunoscuta'>?</div>") +
                                "</td>" +
                                "<td class=\"detailCell w80\">" +
                                    CalitateIndexToStr(serial.Q) +
                                "</td>" +
                                "<td class=\"detailCell w100\">" +
                                    serial.DimensiuneInt + " GB" +
                                "</td>" +
                                "<td class=\"detailCell w100\" " + differentAudioStyle + ">" +
                                    serial.A +
                                "</td>" +
                                "<td class=\"detailCell w125\">" +
                                    serial.Y +
                                "</td>" +
                                "<td class=\"detailCell w125\">" +
                                    episoadeSerial.length +
                                "</td>" +
                            "</tr>" +

                            "<tr class=\"detailSerieLine " + alternateRowClass + "\" data-serialId=\"" + serial.Id + "\" style=\"display: none;\">" +
                                "<td style=\"width: 30px;\">" +
                                "</td>" +
                                "<td colspan=\"8\">" +
                                    "<table class=\"tableWrapper\">" +
                                        "<tr>" +
                                            "<td>" +
                                                "<table class=\"tableWrapper\">" +
                                                    "<tr>" +
                                                        "<td style=\"width:250px; vertical-align: top;\">" +

                                                        (
                                                            serial.Tr == null || serial.Tr == ""
                                                                ? "<img src=\"Imgs/Seriale/poster-" + serial.Id + ".jpg\" data-movieId=\"" + serial.Id + "\">"
                                                                : "<a class='movieTrailerLink' href='https://www.youtube.com/watch?v=" + serial.Tr + "'>" +
                                                                    "<img src=\"Imgs/Seriale/poster-" + serial.Id + ".jpg\" data-movieId=\"" + serial.Id + "\">" +
                                                                  "</a>"
                                                        ) +

                                                        "</td>" +
                                                        "<td style=\"vertical-align: top;\">";

                    var sezonNo = 0;
					var firstSeason = true;

                    episoadeSerial.forEach(function (episod) {
                        if (episod.Sezon > sezonNo) {
                            if (sezonNo > 0) {
								firstSeason = false;

                                sectionHtml +=
                                                            "</table>";
                            }
                            sezonNo = episod.Sezon;

                            sectionHtml +=
                                                            "<table class=\"tableWrapper\">" +
                                                                "<tr class=\"seasonLine noselect lineWithDetails\">" +
                                                                    "<td class=\"markerCol\">" +
                                                                        "<div class=\"markerSymbol sezonExpander " + (firstSeason ? "expanded" : "collapsed") + "\" data-serialId=\"" + serial.Id + "\" data-sezon=\"" + episod.Sezon + "\">" +
                                                                        "</div>" +
                                                                    "</td>" +
                                                                    "<td colspan='6'>" +
                                                                        "Season " + episod.Sezon +
                                                                    "</td>" +
                                                                "</tr>";
                        }

                        sectionHtml +=
                                                                "<tr class=\"episoadeLine\" data-serialId=\"" + serial.Id + "\" data-sezon=\"" + episod.Sezon + "\" style=\"" + (firstSeason ? "display: table-row;" : "display: none;") + "\">" +
                                                                    "<td style=\"width: 30px;\">" +
                                                                    "</td>" +
                                                                    "<td>" +
                                                                        episod.FN +
                                                                    "</td>" +
                                                                    "<td class=\"detailCell w80\">" +
                                                                        CalitateIndexToStr(serial.Q) +
                                                                    "</td>" +
                                                                    "<td class=\"detailCell w100\">" +
                                                                        episod.S +
                                                                    "</td>" +
                                                                    "<td class=\"detailCell w100\">" +
                                                                        episod.A +
                                                                    "</td>" +
                                                                    "<td class=\"detailCell w125\">" +
                                                                        episod.Y +
                                                                    "</td>" +
                                                                    "<td class=\"detailCell w123\">" +
                                                                        episod.T +
                                                                    "</td>" +
                                                                "</tr>";
                    });

                    sectionHtml +=
                                                            "</table>" +
                                                        "</td>" +
                                                    "</tr>" +
                                                "</table>" +
                                            "</td>" +
                                        "</tr>" +
                                    "</table>" +
                                "</td>" +
                            "</tr>";

                });

                sectionHtml +=
                        "</table>" +
                    "</div>";

                $(".about-message-img").css("display", "none");
                $("#sections-wrapper").html(sectionHtml);

                setTimeout(function () {
                    RebindSeriesEvents();

                    var h = window.innerHeight - $(".master-toolbar").outerHeight() - $("footer").height() - $("#seriesHeaderTable").height();
                    $(".detailsTableWrapper").height(h);

                    $(".detailsTableWrapper").slimScroll({
                        height: h
                    });
                    $("#sections-wrapper").slimScroll({
                        height: $("#sections-wrapper").height()
                    });

                    $(".movieTrailerLink").YouTubePopUp();
                }, 100);

                CloseSideNav();

                break;

            case 4: //Collections
                SoftCloseSearch();

                $(".about-message-img").css("display", "none");
                $("#sections-wrapper").html("<div style=\"font-size: 72px; padding-top: 150px; width: 100px; margin: 0 auto;\" title=\"No data available ... yet!\">😔</div>");
                $("#snapshotStat").html("Nothing to see here ... :(");

                $("#moviesSections span").removeClass("selected-subSection");
                $("#rootNav span").removeClass("selected-subSection");
                $(this).addClass("selected-subSection");

                CloseSideNav();

                break;
        }
    });
});

function RebindSeriesEvents() {
    $(".serialExpander").on("click", function (evt) {
        evt.stopPropagation();
        ToggleExpandSeries($(this));
    });

    $(".sezonExpander").on("click", function (evt) {
        evt.stopPropagation();
        ToggleExpandSezon($(this));
    });


    $(".seriesLine.lineWithDetails").on("click", function (e) {
        ToggleExpandSeries($(this).find(".markerSymbol"));
    });

    $(".seasonLine.lineWithDetails").on("click", function (e) {
        ToggleExpandSezon($(this).find(".markerSymbol"));
    });
}

function ToggleExpandSeries(s) {
    var detailsRow = $(".detailSerieLine[data-serialId='" + $(s).data("serialid") + "']");
    ToggleDetailVisibility(detailsRow, s);
};

function ToggleExpandSezon(s) {
    var detailsRow = $("tr[data-serialId='" + $(s).data("serialid") + "'][data-sezon='" + $(s).data("sezon") + "']");
    ToggleDetailVisibility(detailsRow, s);
};

function ToggleDetailVisibility(detailsRow, s) {
    if ($(detailsRow).css("display") == "none") {
        $(s).removeClass("collapsed");
        $(s).addClass("expanded");
        $(detailsRow).css("display", "table-row");
    }
    else {
        $(s).removeClass("expanded");
        $(s).addClass("collapsed");
        $(detailsRow).css("display", "none");
    }
}

function setPageCount() {
    $("#jsGrid").jsGrid("option", "pageSize", $("#gridPageCount")[0].value);
}

var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

$(window).resize(function () {
    //triggering the recalculation only when the resize has stop
    waitForFinalEvent(function () {
        ResizeMoviesSection();
    }, 100, "contentWrapper");
});

function SoftCloseSearch() {
    if ($("#searchCtrl").hasClass("focus")) {
        // if (searchResultTimer != null) {
        //     clearInterval(searchResultTimer);
        // }
        $("#searchCtrl").removeClass("focus");
        $("#searchCtrl").val("");
    }
}

function DisplayHome() {
    SoftCloseSearch();

    $("#sections-wrapper").html($("#homeWarning").html());
    $("#moviesSections span").removeClass("selected-subSection");
    $(".about-message-img").css("display", "");

    $("#genVersion").html("v" + detaliiGenerare);

    $("#mobileWarning").css("display", isMobile() ? "block" : "none");
    $("#snapshotStat").html("");
}

function CloseSideNav() {
    $("#sideNav").css("width", "0");
    $(".sideNav-overlay").css("display", "none");
    $("#sections-wrapper").removeClass("sideNav-overlay-content-transform")
};

function ResizeMoviesSection() {
    var h = window.innerHeight - $(".master-toolbar").outerHeight() - $("footer").height();
    $("#sections-wrapper").height(h);

    $("#sections-wrapper").slimScroll({
        height: h
    });

    //not working ok?
    if ($("#jsGrid").length > 0) {
        var gridWrapperHeight = h - $(".jsgrid-pager-container").height() - 1;
        $("#jsGrid").height(gridWrapperHeight);

        setTimeout(function () {
            $(".jsgrid-grid-body").height(gridWrapperHeight - $(".jsgrid-grid-header").height())
        }, 100);
    }

    if ($(".detailsTableWrapper").length > 0) {
        $(".detailsTableWrapper").height(h - $("#seriesHeaderTable").height());
    }
}

function CalitateIndexToStr(c) {
    switch (c) {
        case -1: return "NotSet";
        case 0: return "FullHD";
        case 1: return "HD";
        case 2: return "SD";
        case 3: return "HD_up";
        case 4: return "Mix";
    }

}

function isMobile() {
    var a = navigator.userAgent || navigator.vendor || window.opera;
    return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4));
}