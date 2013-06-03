"use strict";

window.Mixtape = {

	serverStatusCheckInterval : 5000,
	queryInputFireDelay : 500,
	isDisplayingAuthForm : false,
	/* To prevent closing other error messages */
	isDisplayingServerState : false,

	/**
	 * Modal Object
	 * 
	 * Use this to display default (error) messages, login form, etc.
	 */
	modal : {
		reset : function() {
			$('.modal').modal('hide');
			$('.modal .modal-header h4').text('');
			$('.modal .modal-body').text('');
			$('.modal .modal-footer').text('');
			$('.modal .btn-primary').text('OK');
			$('.modal .modal-header').show();
			$('.modal .modal-body').show();
			$('.modal .modal-footer').show();
			$('.modal .btn-primary').show();
			this.isDisplayingAuthForm = false;
			this.isDisplayingServerState = false;
		},
		displayError : function(XmlHttpRequest) {
			if (isDisplayingServerState)
				return;

			Mixtape.modal.reset();
			$('.modal h4').text('Fehler ' + XmlHttpRequest.status);

			if (XmlHttpRequest.status == '404') {
				$('.modal .modal-body').text(
						'Die Anfrage konnte nicht verarbeitet werden.');
			} else {
				$('.modal .modal-body').text(XmlHttpRequest.responseText);
			}

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
		pendingAuthentications : new Array(),
		onPageLoad : function() {
			this.displayLogoutMessage();
		},
		handlePendingAuthentications : function() {
			if (this.pendingAuthentications.length === 0)
				return;
			this.showLoginForm(this.pendingAuthentications.pop());
		},
		showLoginForm : function(pendingAjaxRequest) {
			if (Mixtape.isDisplayingServerState || Mixtape.isDisplayingAuthForm) {
				this.pendingAuthentications.push(pendingAjaxRequest);
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

			Mixtape.isDisplayingAuthForm = true;
		},
		displayLogoutMessage : function() {
			if (location.search.indexOf("logout=1") !== -1) {
				console.log("should display logout now");
				$('.modal .modal-header h4').text('Logout erfolgt.');
				$('.modal .modal-body').hide();

				$('.modal').modal({
					backdrop : 'static',
					keyboard : true
				});

				$('.modal button').click(function(event) {
					Mixtape.modal.reset();
					this.handlePendingAuthentications();
				});
				Mixtape.isDisplayingAuthForm = true;
			}
		},
		isAuthenticationSuccessful : function(jqXHR) {
			var result = jqXHR.getResponseHeader('X-AjaxAuthentication_result');
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
			Mixtape.isDisplayingServerState = true;
		},
		hideStatusAndReload : function() {
			if (Mixtape.isDisplayingServerState) {
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
					console.log("REQUEST 1:");
					console.debug(jqXHR);
					return;
					console.log("Received server status update.");
					if ($('.modal h4').is(':visible'))
						Mixtape.server.hideStatusAndReload();
					setTimeout(Mixtape.server.checkStatus,
							Mixtape.serverStatusCheckInterval);
					return true;
				},
				error : function(jqXHR, textStatus, errorThrown) {
					console.log("REQUEST 2:");
					console.debug(jqXHR);
					console.debug(textStatus);
					console.debug(errorThrown);
					return;
					console.log("Error on server status update request.");
					displayStatus(jqXHR);
					setTimeout(Mixtape.server.checkStatus,
							Mixtape.serverStatusCheckInterval);
					return false;
				}
			});
		}
	},

	/**
	 * Query
	 * 
	 * Handler for input fields.
	 */
	query : {
		initInputHandler : function() {
			$('input.querySong').on(
					'input keyup',
					function() {
						var $this = $(this);

						if ($this.val().length < 2)
							return;

						clearTimeout($this.data('timer'));
						$this.data('timer', setTimeout(function() {
							$this.removeData('timer');
							Mixtape.query.querySong($this.val(), $this
									.attr('data-queryTarget'));
						}, Mixtape.queryInputFireDelay));
					});
		},

		/**
		 * @param term
		 *            Song query parameter
		 * @param targetElementId
		 *            Successful results are placed in the element with this id.
		 */
		querySong : function(term, targetElementId) {
			$.ajax({
				url : document.location.pathname + 'search?term=' + term,
				success : function(PlainObjectData, textStatus, jqXHR) {
					$('#' + targetElementId).html(PlainObjectData);

					// Initialize clickhandler for wishes.
					$('.queryResults li').click(function(event) {
						event.preventDefault();
						Mixtape.playlist.addWish(this);
					});
				},
				error : function(jqXHR, textStatus, errorThrown) {
					displayError(jqXHR);
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
		init : function() {
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
					Mixtape.playlist.init();
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
					displayError(jqXHR);
				}
			});
		}
	}
}

$(document).ready(function() {
	/**
	 * Bootstrap
	 */
	// Tab-handling upon URL-call.
	$(function() {
		var hash = location.hash;
		var hashPieces = hash.split('?');
		var activeTab = $('[href=' + hashPieces[0] + ']');
		activeTab && activeTab.tab('show');
	});
	// Tab-Switching with no default-behaviour prevention.
	$('.nav a').click(function() {
		// No e.preventDefault() here
		$(this).tab('show');
	});
	$('#startButton').click(function() {
		$('.nav a[href="#music"]').tab('show');
	});

	/**
	 * Initialize everything.
	 */
	Mixtape.authentication.onPageLoad();
	Mixtape.query.initInputHandler();
	Mixtape.playlist.init();
	// Mixtape.server.checkStatus();
	Mixtape.playlist.update.connect();
});
