"use strict";

window.Mixtape = {

	serverStatusCheckInterval : 5000,
	queryInputFireDelay : 500,

	/**
	 * Modal Object
	 * 
	 * Use this to display default (error) messages, login form, etc.
	 */
	modal : {
		isDisplayingAuthForm : false,
		/* To prevent closing other error messages */
		isDisplayingServerState : false,
		defaultFooter : $('.modal .modal-footer').html().trim(),
		reset : function() {
			$('.modal').modal('hide');
			$('.modal .modal-header h4').text('');
			$('.modal .modal-body').text('');
			$('.modal .modal-footer').html(this.defaultFooter);
			$('.modal .btn-primary').text('OK');
			$('.modal .modal-header').show();
			$('.modal .modal-body').show();
			$('.modal .modal-footer').show();
			$('.modal .btn-primary').show();
			this.isDisplayingAuthForm = false;
			this.isDisplayingServerState = false;
		},
		displayError : function(XmlHttpRequest) {
			if (this.isDisplayingServerState)
				return;

			Mixtape.modal.reset();
			$('.modal h4').text('Fehler ' + XmlHttpRequest.status);

			if (XmlHttpRequest.status == '404')
				$('.modal .modal-body').text(
						'Die Anfrage konnte nicht verarbeitet werden.');
			else if (XmlHttpRequest.status == '400')
				$('.modal .modal-body').html(XmlHttpRequest.responseText);
			else
				$('.modal .modal-body').text(XmlHttpRequest.responseText);

			$('.modal').modal({
				backdrop : 'static',
				keyboard : true
			});

			$('.modal button').click(function(event) {
				Mixtape.modal.reset();
			});
		},
	},

	/**
	 * Authentication
	 */
	authentication : {
		onPageLoad : function() {
			this.displayLogoutMessage();
		},
		showLoginForm : function(pendingAjaxRequest) {
			if (Mixtape.modal.isDisplayingServerState
					|| Mixtape.modal.isDisplayingAuthForm) {
				return;
			}

			$('.modal .modal-header h4').text('Anmeldung erforderlich');
			$('.modal .modal-body').html($('.login').html());
			$('.modal .modal-body .login-submit').remove();
			$('.modal .modal-footer').html($('.login .login-submit'));

			$('.modal').modal({
				backdrop : 'static',
				keyboard : true
			});

			$('.modal').on('shown', function() {
				$('.modal input:first').focus();
			});

			$('.modal input[type=submit]').click(function(event) {
				event.preventDefault();
				$('.modal input[type=submit]').prop('disabled', true);
				Mixtape.authentication.processLogin(event);
			});

			Mixtape.modal.isDisplayingAuthForm = true;
		},
		displayLogoutMessage : function() {
			if (location.search.indexOf("logout=1") !== -1) {
				$('.modal .modal-header h4').text('Logout erfolgt.');
				$('.modal .modal-body').hide();

				$('.modal').modal({
					backdrop : 'static',
					keyboard : true
				});

				$('.modal button').click(function(event) {
					Mixtape.modal.reset();
				});
				Mixtape.modal.isDisplayingAuthForm = true;
			}
		},
		isAuthenticationSuccessful : function(jqXHR) {
			var result = jqXHR
					.getResponseHeader('X-MixTape-AuthenticationResult');
			return result !== null && result !== "auth_failure"
					&& result === "auth_ok";
		},
		displayAuthenticationError : function(error) {
			if ((error != undefined && error != "")
					|| (location.search != "" && location.search
							.indexOf("logout") === -1))
				$('.login-view .error').css('visibility', 'visible');
		},
		handleAuthenticationError : function(error) {
			$('.modal .error small').text(error);
			this.displayAuthenticationError(error);
			$('.modal input:first').focus();
			$('.modal input[type=submit]').prop('disabled', false);
		},
		processLogin : function(event) {
			var username = $('.modal input[name=j_username]').val();
			var password = $('.modal input[name=j_password]').val();

			$.ajax({
				url : document.location.pathname + 'j_spring_security_check',
				data : {
					j_username : username,
					j_password : password
				},
				type : 'POST',
				cache : false,
				success : function(PlainObjectData, textStatus, jqXHR) {
					if (!Mixtape.authentication
							.isAuthenticationSuccessful(jqXHR)) {
						Mixtape.authentication
								.handleAuthenticationError(jqXHR.responseText);
					} else {
						Mixtape.modal.reset();
						// show requested data
						// console.log("LOCATION:");
						// console.debug(window.location);
					}
				},
				error : function(jqXHR, textStatus, errorThrown) {
					Mixtape.authentication
							.handleAuthenticationError(jqXHR.responseText);
				}
			});
		}
	},

	/**
	 * Server Status
	 * 
	 * Checks server availability and displays message if server is unreachable.
	 */
	server : {
		displayStatus : function() {
			// This modal mode overrides all other modals.
			Mixtape.modal.reset();

			$('.modal h4').text('Server offline');

			$('.modal .modal-body').html(
					'Der Server ist im Augenblick nicht verfügbar. <br />'
							+ 'Sobald der Server wieder verfügbar ist, '
							+ 'wird diese Meldung automatisch ausgeblendet.');

			$('.modal .modal-footer').hide();

			$('.modal').modal({
				backdrop : 'static',
				keyboard : false
			});
			Mixtape.modal.isDisplayingServerState = true;
		},
		hideStatusAndReload : function() {
			if (Mixtape.modal.isDisplayingServerState) {
				Mixtape.modal.reset();
				Mixtape.playlist.update.connect();
			}
		},
		checkStatus : function() {
			$.ajax({
				url : document.location.pathname + 'server/checkStatus',
				cache : false,
				statusCode : {
					401 : function() {
						console.log("Not authorized for checkStatus!");
						return;
					}
				},
				success : function(PlainObjectData, textStatus, jqXHR) {
					console.log("Received server status update.");
					if ($('.modal h4').is(':visible'))
						Mixtape.server.hideStatusAndReload();
					setTimeout(Mixtape.server.checkStatus,
							Mixtape.serverStatusCheckInterval);
				},
				error : function(jqXHR, textStatus, errorThrown) {
					Mixtape.server.displayStatus(jqXHR);
					setTimeout(Mixtape.server.checkStatus,
							Mixtape.serverStatusCheckInterval);
				}

			// TODO: cleanup statusCodes and errorHandling working?
			});
		}
	},

	/**
	 * Query
	 * 
	 * Handler for input fields.
	 */
	query : {
		defaultContent : $('#wishQueryResults ul').html(),
		disabledContent : $('<li>Suche inaktiv aufgrund fehlender Wiedergabeliste.</li>'),
		initAllQueryInputHandlers : function() {
			$('input.querySong').on('input keyup', function() {
				var $this = $(this);

				if ($this.val().length < 2)
					return;

				clearTimeout($this.data('timer'));
				$this.data('timer', setTimeout(function() {
					$this.removeData('timer');
					var max = $this.attr('data-maxResults');
					var target = $this.attr('data-queryTarget');
					Mixtape.query.querySong($this.val(), max, target);
				}, Mixtape.queryInputFireDelay));
			});
		},
		enableWishInputHandler : function() {
			if ($('form[name=wishSong] input.querySong').attr('disabled') !== 'disabled')
				return;

			$('form[name=wishSong] input.querySong').removeAttr('disabled');
			$('#wishQueryResults ul').html(this.defaultContent);
			$('form[name=wishSong]').submit(function(event) {
				event.preventDefault();
			});
		},
		disableWishInputHandler : function() {
			$('form[name=wishSong] input.querySong').attr('disabled',
					'disabled');
			$('#wishQueryResults ul').html(this.disabledContent);
		},

		/**
		 * @param term
		 *            Song query parameter
		 * @param maxResults
		 *            [optional] Set a custom maximum of query results. This
		 *            value is limited server-side to prevent exploit.
		 * @param targetElementId
		 *            Successful results are placed in the element with this id.
		 */
		querySong : function(term, maxResults, targetElementId) {
			var requestUrl = document.location.pathname + 'search?term=' + term;

			var parsed_maxResults = parseInt(maxResults);
			if (!isNaN(parsed_maxResults))
				requestUrl += '&maxResults=' + parsed_maxResults;

			$
					.ajax({
						url : requestUrl,
						success : function(PlainObjectData, textStatus, jqXHR) {
							$('#' + targetElementId).html(PlainObjectData);

							// Initialize handlers for query results.
							if (targetElementId.indexOf('wish') !== -1) {
								Mixtape.playlist.initWishHandler();
							} else if (targetElementId
									.indexOf('playlistSettings') !== -1) {
								Mixtape.playlistSettings
										.initStartSongSelector();

							}
						},
						error : function(jqXHR, textStatus, errorThrown) {
							Mixtape.modal.displayError(jqXHR);
						}
					});
		}
	},

	playback : {
		audio : {},
		init : function() {
			// When playlist is already playing.
			if ($('.player audio').attr('src') !== undefined
					&& Mixtape.playback.audio.paused !== false)
				return;

			if ($('#playlist').length !== 0 && $('.noPlaylist').length === 0) {
				$('.player').removeClass('hidden');
				Mixtape.playback.listen();
			}

			$('#playbackPause').click(function() {
				Mixtape.playback.audio.pause();
			});
			$('#playbackPlay').click(function() {
				Mixtape.playback.audio.play();
			});
			$('#playbackNextSong').click(function() {
				Mixtape.playlist.advance();
			});
		},
		listen : function() {
			$.ajax({
				url : document.location.pathname + 'playback/listen',
				type : 'GET',
				cache : false,
				success : function(PlainObjectData) {
					if (Mixtape.playback.audio.paused === false)
						Mixtape.playback.audio.pause();

					var song = decodeURIComponent(PlainObjectData);
					Mixtape.playback.audio = new Audio("");
					Mixtape.playback.audio.src = document.location.pathname
							+ song;
					Mixtape.playback.audio.addEventListener('canplay',
							function() {
								Mixtape.playback.audio.play();
							}, false);

					var startPos = parseInt(song.lastIndexOf('/')) + 1;
					var endPos = parseInt(song.lastIndexOf('.'));
					$('#playbackCurrentSong').text(
							song.substr(startPos, endPos - startPos));

					$('.playerContainer').html('');
					$('.playerContainer').prepend(Mixtape.playback.audio);
					$('.playerContainer audio').addClass('hidden');
					$('.playerContainer audio').bind('ended', function() {
						Mixtape.playlist.advance();
					})
				},
				error : function(jqXHR) {
					Mixtape.modal.displayError(jqXHR);
				}
			});
		}
	},

	/**
	 * Playlist
	 */
	playlist : {
		tooltipWidthIsSet : false,

		/**
		 * Initializes all handlers for playlist functionality. This method must
		 * be called each time the playlist gets updated. This method is
		 * overwritten in initAuthenticated.js!
		 */
		init : function(isPlaylistInitialized) {
			if (isPlaylistInitialized) {
				Mixtape.query.enableWishInputHandler();
				if (!Mixtape.playlist.userAddedWish) {
					Mixtape.playback.init();
					Mixtape.playback.listen();
				}
				Mixtape.playlist.userAddedWish = false;
			} else
				Mixtape.query.disableWishInputHandler();

			Mixtape.playlist.initTooltips();
		},

		/**
		 * Hook function for setting tooltip width to the same width as the
		 * playlist.
		 */
		setTooltipWidth : function() {
			if (this.tooltipWidthIsSet)
				return;

			Mixtape.playlist.tooltipWidthIsSet = true;
			$('.tooltip > div').css(
					'width',
					parseFloat($('.tooltip').parent().css('width'))
							- 2
							* parseFloat($('.tooltip').css('padding-left'))
							- 2
							* parseFloat(($('.tooltip > div')
									.css('padding-left'))));
		},

		/**
		 * Initializes tooltip hover and click functionality for playlist
		 * elements.
		 */
		initTooltips : function() {
			Mixtape.playlist.tooltipWidthIsSet = false;
			$('.tooltip').hover(function() {
				Mixtape.playlist.setTooltipWidth();
				$(this).find('div').show();
			}, function() {
				$(this).find('div').hide();
			});
			$('.tooltip').click(function() {
				Mixtape.playlist.setTooltipWidth();
				$(this).find('div').toggle();
			});
			$('.tooltip > div').click(function() {
				$(this).hide();
			});
		},

		advance : function() {
			$.ajax({
				url : document.location.pathname + 'playlist/advance',
				type : 'POST',
				cache : false,
				success : function(PlainObjectData) {
					if ($('#playlist tr').length > 1) {
						$('#playbackNextSong').removeClass('hidden');
					} else {
						$('#playbackNextSong').addClass('hidden');
					}
					Mixtape.playback.listen();
				},
				error : function(jqXHR) {
					Mixtape.modal.displayError(jqXHR);
				}
			});
		},

		/**
		 * Here comes the ServerPush functions for updating the playlist
		 * content.
		 */
		update : {
			socket : $.atmosphere,
			transport : 'websocket',
			request : {
				url : document.location.pathname + 'playlist/push',
				contentType : 'text/html',
				// To solve intermixed messages problem.
				trackMessageSize : true,
				// Share a connection amongst open windows/tabs.
				shared : true,
				transport : this.transport,
				fallbackTransport : 'long-polling',
				onOpen : function(response) {
					console.log('Atmosphere connected using '
							+ response.transport + '.');
					this.transport = response.transport;

					var isPlaylistInitialized = response.headers['X-MixTape-isPlaylistInitialized'] === "true";
					if (isPlaylistInitialized)
						Mixtape.query.enableWishInputHandler();
				},
				onTransportFailure : function(errorMsg, request) {
					console.log('Atmosphere transport failure occurred!');
					console.log(errorMsg);
					if (window.EventSource) {
						request.fallbackTransport = 'sse';
						this.transport = 'see';
					}
				},
				onMessage : function(response) {
					console.log('Atmosphere message received.');
					$('#playlist').html(response.responseBody);

					Mixtape.playlist.userAddedWish = $(
							'#playlistUpdateIsUserAddedWish').val() !== "0" ? true
							: false;

					if (Mixtape.playlist.initAuthenticated !== undefined)
						Mixtape.playlist.initAuthenticated(true);
					else
						Mixtape.playlist.init(true);
				},
				onClose : function(response) {
					console.log('Atmosphere disconnected.');
				}
			},

			/**
			 * Use this method to connect and send data to the server. Once
			 * subscribed, we are ready so receive and send data.
			 */
			connect : function() {
				console.log('Atmosphere connecting...');
				this.socket.subscribe(this.request);
			}
		},

		initWishHandler : function() {
			$('#wishQueryResults li').click(function(event) {
				event.preventDefault();
				Mixtape.playlist.addWish(this);
			});
		},

		/**
		 * Adds a wish to the playlist upon user selection.
		 */
		addWish : function(element) {
			$.ajax({
				url : document.location.pathname + 'playlist/wish?songId='
						+ $(element).find('input').val(),
				type : 'POST',
				cache : false,
				success : function(PlainObjectData, textStatus, jqXHR) {
					console.log('Success adding wish.');
				},
				error : function(jqXHR, textStatus, errorThrown) {
					Mixtape.modal.displayError(jqXHR);
				}
			});
		},

		userAddedWish : false
	// TODO
	}
}

$(document).ready(function() {
	/**
	 * Initialize everything.
	 */
	Mixtape.authentication.onPageLoad();
	Mixtape.query.initAllQueryInputHandlers();
	Mixtape.playback.init();
	Mixtape.playlist.init();
	// Mixtape.server.checkStatus();
	Mixtape.playlist.update.connect();
});

$(window).load(function() {
	/**
	 * Tab-handling upon URL-call.
	 */
	var hash = location.hash;
	var hashPieces = hash.split('?');
	var activeTab = $('[href=' + hashPieces[0] + ']');
	activeTab && activeTab.tab('show');
	$('.nav a').click(function(event) {
		// No event.preventDefault() here

		// Hook: Without this, main-nav-elements keep active when selecting
		// elements in pull-right-nav and vice-versa.
		$('.nav .active').removeClass('active');

		$(this).tab('show');
	});
	$('#startButton').click(function(event) {
		$('.nav a[href="#music"]').tab('show');
	});
})