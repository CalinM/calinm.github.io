
                var movieId = 0;
                var movieDetailsObj = null;

                $(document).ready(function() {	
	                $('.element-selectie').on('click', function() {
                        if (!$(this).hasClass('selected'))
		                    document.location=$(this).data('file');
	                });

	                $('.movie-detail').on('click', function() {
						movieId = $(this).data('movieid');

						var detailsObjArray = $.grep(detailsHD, function(e){ return e.Id == movieId; });
						
						if (detailsObjArray.length == 0) {
							alert('Eroare! Detaliile filmului nu au fost gasite!');
						}
						else {
                            movieDetailsObj = detailsObjArray[0];
							$('.title-wrapper').text(movieDetailsObj.Titlu);
                            $('#an').text(movieDetailsObj.An);
							$('#audio').text(movieDetailsObj.Audio);
							$('#subtitrari').text(movieDetailsObj.Subtitrari);
							$('#tematica').text(movieDetailsObj.Tematica);
							$('#dimensiune').text(movieDetailsObj.Dimensiune);
							$('#obs').text(movieDetailsObj.Obs != '' ? movieDetailsObj.Obs : '-');

                            $('#recomandat').text(movieDetailsObj.Recomandat);
							$('#imgCalitate').attr('src', movieDetailsObj.Calitate == 'Full HD' ? 'Images/FullHD_logo.png' : 'Images/HD_logo.png');
							$('#imgCalitate').attr('title', 'Birate: ' + movieDetailsObj.Bitrate);

							var trailerLink = movieDetailsObj.TrailerEmbeded;
							if (trailerLink != null && trailerLink != '') {
								$('#trailer-wrapper').html(
									'<object id=\"trailerPlayerObj\" style =\"width: 600px; height: 350px;\" '+
                                    '	data=\"' + trailerLink + '\" + > ' +
                                    '</object>')
							}
							else {
								$('#trailer-wrapper').html('LInk negasit!');
                            }

							$('#myModal').css('display', 'block');
						}
	                });

	                $('.close').on('click', function() {
                        $('#trailerPlayerObj').remove(); //to stop a playing trailer
                        $('#myModal').css('display', 'none');
                    });

                    $('#recomandat-wrapper').on('click', function() {
                        if (movieDetailsObj != null) {
                            if (movieDetailsObj.RecomandatLink == null || movieDetailsObj.RecomandatLink == '') {
                                alert('Informatie indisponibila sau incorect specificata!')
                            }
                            else
                                window.open(movieDetailsObj.RecomandatLink, '_blank');
                        }
                        else
                            alert('Eroare! Detaliile filmului nu au fost gasite!');
                    });                
                });