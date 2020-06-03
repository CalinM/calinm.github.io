var currentSeriesTypeViewDataM;
var currentSeriesTypeViewDataD;
var showingSeries;

function RenderSeriesTypeView() {
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

    currentSeriesTypeViewDataM.forEach(function (serial) {
        serialIndex++;

        var link = serial.DL != null ? serial.DL : "www.imdb.com";
        var tooltip = serial.N != "" ? serial.N + "\n" : "";
        tooltip += "Click for details ... (external link!)";

        //var episoadeSerial = $.grep(currentSeriesTypeViewDataD, function (el) { return el.SId == serial.Id; });
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
                "<td class=\"detailCell w25\">" +
                    "<a href=\"" + link + "\" target=\"_blank\" title=\"" + tooltip + "\">" +
                        "<img src=\"Images\\info.png\" class=\"infoSign\" alt=\"i\">" +
                    "</a>" +
                "</td>" +
                "<td class=\"detailCell w100\">" +
                    (serial.R != ""
                        ? "<a class='recommended' style='float: unset; margin: 0px;' title='Recomandat: " + serial.R + "\nClick for details ... (external link!)' href='" + serial.RL + "' target='_blank'>" + serial.R.replace("+", "") + "</a>"
                        : "<div class='recommended' style='float: unset; margin: 0px;' title='Recomandare necunoscuta'>?</div>") +
                "</td>" +
                "<td class=\"detailCell w80\">" +
                    serial.Q +
                "</td>" +
                "<td class=\"detailCell w100\">" +
                    serial.S + " GB" +
                "</td>" +
                "<td class=\"detailCell w100\" " + differentAudioStyle + ">" +
                    serial.A +
                "</td>" +
                "<td class=\"detailCell w125\">" +
                    serial.Y +
                "</td>" +
                "<td class=\"detailCell w125\">" +
                    serial.Ec +
                "</td>" +
            "</tr>" +

            "<tr class=\"detailSerieLine " + alternateRowClass + "\" data-serialId=\"" + serial.Id + "\" style=\"display: none;\">" +
                "<td style=\"width: 30px;\">" +
                "</td>" +
                "<td id=\"detailSerie-inner" + serial.Id + "\" colspan=\"8\">" +
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

        if (!isMobile()) {
            var h = window.innerHeight - $(".master-toolbar").outerHeight() - $("footer").height() - $("#seriesHeaderTable").height();
            $(".detailsTableWrapper").height(h);

            $(".detailsTableWrapper").slimScroll({
                height: h
            });
            $("#sections-wrapper").slimScroll({
                height: $("#sections-wrapper").height()
            });
        }

        //$(".movieTrailerLink").YouTubePopUp();
    }, 100);

    CloseSideNav();
}

function RebindSeriesEvents() {
    $(".serialExpander").off("click").on("click", function (evt) {
        evt.stopPropagation();
        ToggleExpandSeries($(this));
    });

    $(".sezonExpander").off("click").on("click", function (evt) {
        evt.stopPropagation();
        ToggleExpandSezon($(this));
    });


    $(".seriesLine.lineWithDetails").off("click").on("click", function (e) {
        ToggleExpandSeries($(this).find(".markerSymbol"));
    });

    $(".seasonLine.lineWithDetails").off("click").on("click", function (e) {
        ToggleExpandSezon($(this).find(".markerSymbol"));
    });

    $(".movieStillDisplay").off("click").on("click", function (evt) {
        evt.stopPropagation();

        if (evt.ctrlKey) {
            $(this).closest("table").find(".thRow").each(function (el) {
                $(this).css("display", "none");
            })        
        }
        else
        {
            var currentRow = $(this).closest("tr");
            var episodeId = currentRow.data("episodeid");
            var thumbnailRow = $("#th-" + episodeId);
    
            if (thumbnailRow.length > 0) //it was previously generated
            {
                if ($(thumbnailRow).css("display") == "none")
                    $(thumbnailRow).css("display", "table-row");
                else
                    $(thumbnailRow).css("display", "none");
            }
            else
            {
                var thumbnailRowStr =
                    "<tr id=\"th-" +episodeId + "\" class=\"thRow\" style=\"display: table-row;\" data-serialId=\"" + currentRow.data("serialid") + "\" data-sezon=\"" + currentRow.data("sezon") + "\" >" +
                        "<td style=\"width: 30px;\">" +
                        "</td>" +
                        "<td colspan=\"8\">" +
                            "<table class=\"thumbnails-wrapper\">" +
                                "<tr>" +
                                    "<td class=\"thumbnailStillCell\">" +
                                        "<img src=\"Imgs\\Series\\Thumbnails\\thumb-" + episodeId + "-0.jpg\" alt=\"?\">" +
                                    "</td>" +
                                    "<td class=\"thumbnailStillCell\">" +
                                        "<img src=\"Imgs\\Series\\Thumbnails\\thumb-" + episodeId + "-1.jpg\" alt=\"?\">" +
                                    "</td>" +
                                    "<td class=\"thumbnailStillCell\">" +
                                        "<img src=\"Imgs\\Series\\Thumbnails\\thumb-" + episodeId + "-2.jpg\" alt=\"?\">" +
                                    "</td>" +
                                "</tr>" +
                            "</table>" +
                            "</td>" +
                    "</tr>"; 
    
                $(currentRow).after(thumbnailRowStr);
            }
        }
    });
}

function ToggleExpandSeries(s) {
    var seriesId = $(s).data("serialid");

    var toggleExpand = function () {
        var detailsRow = $(".detailSerieLine[data-serialId='" + seriesId + "']");
        ToggleDetailVisibility(detailsRow, s);
    }

    var seriesDetailsEl = $("#detailSerie-inner" + seriesId);
    if (seriesDetailsEl.text() == '') {

        var seriesSeasons = new Array();

        unique(
            $.grep(currentSeriesTypeViewDataD,
                function (el) {
                    return el.SId == seriesId;
                })
                .map(function (el) {
                    return el.SZ;
                })
        ).forEach(function (seasonNo) {
            seriesSeasons.push({ SeasonId: seasonNo, SeasonName: isNumeric(seasonNo) ? "Season " + seasonNo : seasonNo })
        });

        var sortedSeasons =
            seriesSeasons.sort((a, b) => a.SeasonName.localeCompare(b.SeasonName, undefined, { numeric: true, sensitivity: 'base' }));


        var serialDetails = $.grep(currentSeriesTypeViewDataM, function (el) { return el.Id == seriesId });

        if (sortedSeasons.length == 0 || serialDetails.length == 0) {
            console.warn("invalid data");
            return;
        }

        var serial = serialDetails[0];

        var seriesDetailsHtml =
            "<table class=\"tableWrapper\">" +
            "<tr>" +
            "<td style=\"width:250px; vertical-align: top;\">" +

            (
                serial.Tr == null || serial.Tr == ""
                    ? "<img src=\"Imgs/" + (showingSeries ? "Series" : "Recordings") + "/poster-" + serial.Id + ".jpg\" data-movieId=\"" + serial.Id + "\">"
                    : "<a class='movieTrailerLink' href='https://www.youtube.com/watch?v=" + serial.Tr + "'>" +
                    "<img src=\"Imgs/Series/poster-" + serial.Id + ".jpg\" data-movieId=\"" + serial.Id + "\">" +
                    "</a>"
            ) +

            "</td>" +
            "<td style=\"vertical-align: top;\">";

        var firstSeason = true;

        var addSeason = function (seasonObj) {
            var seasonSection =
                "<table class=\"tableWrapper\">" +
                "<tr class=\"seasonLine noselect lineWithDetails\">" +
                "<td class=\"markerCol\">" +
                "<div class=\"markerSymbol sezonExpander " + (firstSeason ? "expanded" : "collapsed") + "\" data-serialId=\"" + seriesId + "\" data-sezon=\"" + seasonObj.SeasonId + "\">" +
                "</div>" +
                "</td>" +
                "<td colspan='6'>" +
                seasonObj.SeasonName +
                "</td>" +
                "</tr>";

            var episodesInSeason = $.grep(currentSeriesTypeViewDataD, function (el) { return el.SId == seriesId && el.SZ == seasonObj.SeasonId; });

            episodesInSeason.forEach(function (episode) {
                seasonSection +=
                    "<tr class=\"episoadeLine\" data-serialId=\"" + seriesId + "\" data-sezon=\"" + seasonObj.SeasonId + "\" data-episodeId=\"" + episode.Id +
                    "\" style=\"" + (firstSeason ? "display: table-row;" : "display: none;") + "\">" +

                    "<td style=\"width: 30px;\">" +
                    "</td>" +
                    "<td>" +
                    episode.FN +
                    "</td>" +
                    "<td class=\"detailCell w25\">" +
                    (episode.Th == 0
                        ? ""
                        : "<img src=\"Images\\thumbnail.png\" class=\"infoSign movieStillDisplay\" style=\"cursor: pointer;\" title=\"Click to expand/collapse the thumbnails section for this file.\nPress CTRLCTRL while clicking to collapse all thumbnails sections in the current season.\" alt=\"^\">"
                    ) +
                    "</td>" +
                    "<td class=\"detailCell w100\">" +
                    "</td>" +
                    "<td class=\"detailCell w80\">" +
                    episode.Q +
                    "</td>" +
                    "<td class=\"detailCell w100\">" +
                    episode.S +
                    "</td>" +
                    "<td class=\"detailCell w100\">" +
                    episode.A +
                    "</td>" +
                    "<td class=\"detailCell w125\">" +
                    episode.Y +
                    "</td>" +
                    "<td class=\"detailCell w123\">" +
                    episode.T +
                    "</td>" +
                    "</tr>";
            });

            seasonSection +=
                "</table>";

            return seasonSection;
        }

        sortedSeasons.forEach(function (seasonObj) {
            seriesDetailsHtml += addSeason(seasonObj);
            firstSeason = false;
        });

        seriesDetailsHtml +=
            "</td>" +
            "</tr>" +
            "</table>";

        seriesDetailsEl.html(seriesDetailsHtml);
        RebindSeriesEvents();

        toggleExpand();
    }
    else
        toggleExpand();
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