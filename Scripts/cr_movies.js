

function BuildMoviesGridSection() {
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
			return $.grep(moviesData, function (el) {
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

	$.each(moviesData, function (index, movie) {
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

	/*
	//faster way:
	unique(
		moviesData.map(function (el) {
							return el.R.replace(/\D/g,'');
						})).sort(function (a, b) {
				var a1 = parseInt(a),
					b1 = parseInt(b);

				if (a1 == b1) return 0;
				return a1 > b1 ? 1 : -1;
			})
	*/
	
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
			{ Name: "FullHD", Id: "FullHD" }, //Id: 0
			{ Name: "HD", Id: "HD" }, //Id: 1
			{ Name: "SD", Id: "SD" },	//Id: 2
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
				name: "FN", title: "Title", type: "text", width: 150,
				itemTemplate: function (value, item) {

					var link = item.DL != null ? item.DL : "www.imdb.com";
					//var tooltip = item.N != "" ? "title=\"" + item.N + "\"" : "";
					var tooltip = "Click for detailed movie info ...\n(external link!)";
					if (item.N != "") {
						tooltip += "\n\nMovie notes:\n" + item.N;
					}

					tooltip = "title=\"" + tooltip + "\"";

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
			{ name: "Y", title: "Year", type: "text", width: 50, align: "center" },
			{
				name: "R", title: "Recommended", type: "select", width: 50, items: db.distinctRecomandat, valueField: "Id", textField: "Name",
				itemTemplate: function (value, item) {
					return item.RL != ""
						? $("<a>").attr("href", item.RL).attr("target", "_blank").text(value)
						: value;
				},
			},
			{
				name: "L", title: "Length", type: "text", width: 50, align: "center",
				itemTemplate: function (value) {
					return value == "00:00:00" ? "?" : value;
				},
				//filtering: false
			},
			{
				name: "Q", title: "Quality", type: "select", width: 50, align: "center", items: db.calitate, valueField: "Id", textField: "Name",
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
				name: "A", type: "text", width: 50, align: "center",
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
			{ name: "SU", title: "Subtitles", type: "text", width: 50, align: "center" },
			{
				name: "T", title: "Theme", type: "select", width: 50, align: "center", items: db.distinctTematica, valueField: "Id", textField: "Name",
				filterTemplate: function () {
					var $select = jsGrid.fields.select.prototype.filterTemplate.call(this);
					$select.prepend($("<option>").prop("value", "").text("All").attr("selected", "selected"));
					return $select;
				}
			},
			{
				name: "S", title: "Size", type: "text", width: 50, align: "right",
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

function setPageCount() {
    $("#jsGrid").jsGrid("option", "pageSize", $("#gridPageCount")[0].value);
}