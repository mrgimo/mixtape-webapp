$(document)
		.ready(
				function() {
					"use strict";

					/**
					 * Settings
					 */
					var queryInputFireDelay = 1000;
					var checkServerStateInterval = 10000;
					/* To prevent closing other error messages */
					var isDisplayingServerState = false;
					var isDisplayingError = false;

					/**
					 * Error Handling & Server availability
					 */

					var resetModal = function() {
						$('.modal').modal('hide');
						$('.modal .modal-header h4').text('');
						$('.modal .modal-body').text('');
						$('.modal .modal-footer').text('');
						$('.modal .btn-primary').text('OK');
						$('.modal .modal-header').show();
						$('.modal .modal-body').show();
						$('.modal .modal-footer').show();
						$('.modal .btn-primary').show();
						isDisplayingError = false;
						isDisplayingServerState = false;
					};

					var displayError = function(XmlHttpRequest) {
						if (isDisplayingServerState)
							return;

						$('.modal h4').text('Fehler ' + XmlHttpRequest.status);

						if (XmlHttpRequest.status == '404') {
							$('.modal .modal-body')
									.text(
											'Die Anfrage konnte nicht verarbeitet werden.');
						} else {
							$('.modal .modal-body').text(
									XmlHttpRequest.responseText);
						}

						$('.modal').modal({
							backdrop : 'static',
							keyboard : true
						});

						$('.modal button').click(function(event) {
							resetModal();
						});

						isDisplayingError = true;
					};

					var displayServerStatus = function() {
						// This modal mode overrides all other modals.
						resetModal();

						$('.modal h4').text('Server offline');

						$('.modal .modal-body')
								.html(
										'Der Server ist im Augenblick nicht verfügbar. <br />'
												+ 'Sobald der Server wieder verfügbar ist, '
												+ 'wird diese Meldung automatisch ausgeblendet.');

						$('.modal .modal-footer').hide();

						$('.modal').modal({
							backdrop : 'static',
							keyboard : false
						});
						isDisplayingServerState = true;
					};

					var hideServerStatus = function() {
						if (isDisplayingServerState) {
							resetModal();
							playlistPusher.connect();
						}
					};

					var checkServerState = function() {
						$.ajax({
							url : document.location.pathname
									+ 'server/checkStatus',
							cache : false,
							success : function(PlainObjectData, textStatus,
									jqXHR) {
								if ($('.modal h4').is(':visible'))
									hideServerStatus();
								setTimeout(checkServerState,
										checkServerStateInterval);
								return true;
							},
							error : function(jqXHR, textStatus, errorThrown) {
								displayServerStatus(jqXHR);
								setTimeout(checkServerState,
										checkServerStateInterval);
								return false;
							}
						});
					};

					/**
					 * Wish and sort handling
					 */

					var initQueryInputHandler = function() {
						$('input.querySong').on(
								'input keyup',
								function() {
									var $this = $(this);

									if ($this.val().length < 2)
										return;

									clearTimeout($this.data('timer'));
									$this.data('timer', setTimeout(function() {
										$this.removeData('timer');
										querySong($this.val(), $this
												.attr('data-queryTarget'));
									}, queryInputFireDelay));
								});
					};

					var addWish = function(element) {
						$.ajax({
							url : document.location.pathname
									+ 'playlist/wish?songId='
									+ $(element).find('input').val(),
							type : 'POST',
							cache : false,
							success : function(PlainObjectData, textStatus,
									jqXHR) {
								console.log('Success adding wish');
							},
							error : function(jqXHR, textStatus, errorThrown) {
								displayError(jqXHR);
							}
						});
					};

					var sortPlaylist = function(songId, oldPosition,
							newPosition) {
						$.ajax({
							url : document.location.pathname
									+ 'playlist/sort?songId=' + songId
									+ '&oldPosition=' + oldPosition
									+ '&newPosition=' + newPosition,
							type : 'POST',
							cache : false,
							success : function(PlainObjectData, textStatus,
									jqXHR) {
								console.log('Success sorting.');
							},
							error : function(jqXHR, textStatus, errorThrown) {
								displayError(jqXHR);
							}
						});
					};

					/**
					 * Query Handling.
					 * 
					 * @param term
					 *            Song query parameter
					 * @param targetElementId
					 *            Successful results are placed in the element
					 *            with this id.
					 */
					var querySong = function(term, targetElementId) {
						$.ajax({
							url : document.location.pathname + 'search?term='
									+ term,
							success : function(PlainObjectData, textStatus,
									jqXHR) {
								$('#' + targetElementId).html(PlainObjectData);

								// Initialize clickhandler for wishes.
								$('.queryResults li').click(function(event) {
									event.preventDefault();
									addWish(this);
								});
							},
							error : function(jqXHR, textStatus, errorThrown) {
								displayError(jqXHR);
							}
						});
					};

					/**
					 * Remove song from playlist.
					 * 
					 * @param listIndex
					 *            Index of the playlist element to remove.
					 * @param songId
					 *            SongId to delete from playlist. For
					 *            double-check purposes to make sure the list
					 *            hasn't changed meanwhile.
					 */
					var removeSong = function(listIndex, songId) {
						var element = $('#playlist tbody tr:nth-child('
								+ (parseInt(listIndex) + 1) + ')');

						if ($(element).find('input').val() !== songId) {
							var errorMessage = {
								status : 'beim Löschen eines Songs',
								responseText : 'Playlist-Daten waren nicht mehr aktuell.'
							};
							displayError(errorMessage);
							return;
						}

						$.ajax({
							url : document.location.pathname
									+ 'playlist/remove?songId=' + songId
									+ '&songPosition=' + listIndex,
							type : 'POST',
							cache : false,
							success : function(PlainObjectData, textStatus,
									jqXHR) {
								console.log('Removing song successful.');
							},
							error : function(jqXHR, textStatus, errorThrown) {
								displayError(jqXHR);
							}
						});
					};

					/**
					 * Playlist handling.
					 */

					/**
					 * Initializes sorting capability of playlist elements.
					 */
					var initSorting = function() {
						var oldPosition;
						var songId;
						$('#playlist tbody')
								.sortable(
										{
											start : function(event, ui) {
												songId = $(ui.item).find(
														'input').val();
												console
														.log('songId: '
																+ songId);
												oldPosition = ui.item.index();
												console.log('oldPosition: '
														+ oldPosition);
											},
											stop : function(event, ui) {
												if (ui.item.index() !== oldPosition) {
													console.log('newPosition: '
															+ ui.item.index());
													sortPlaylist(songId,
															oldPosition,
															ui.item.index());
												}
											}
										});
						$('#playlist tbody').disableSelection();
					};

					/**
					 * Hook function for setting tooltip width to the same width
					 * as the playlist.
					 */
					var tooltipWidthIsSet = false;
					var setTooltipWidth = function() {
						if (tooltipWidthIsSet)
							return;

						tooltipWidthIsSet = true;
						$('.tooltip > div').css(
								'width',
								parseFloat($('.tooltip').parent().css('width'))
										- 2
										* parseFloat($('.tooltip').css(
												'padding-left'))
										- 2
										* parseFloat(($('.tooltip > div')
												.css('padding-left'))));
					};

					/**
					 * Initializes tooltip hover functionality for playlist
					 * elements.
					 */
					var initTooltip = function() {
						tooltipWidthIsSet = false;
						$('.tooltip').hover(function() {
							setTooltipWidth();
							$(this).find('div').show();
						}, function() {
							$(this).find('div').hide();
						});
						$('.tooltip').click(function() {
							setTooltipWidth();
							$(this).find('div').toggle();
						});
						$('.tooltip > div').click(function() {
							$(this).hide();
						});
					};

					/**
					 * Initializes handling for removing songs. Registers
					 * click-handler for opening modal window.
					 */
					var initRemoveSongHandling = function() {
						$("#playlist .btn-danger")
								.click(
										function(event) {
											if (isDisplayingError
													|| isDisplayingServerState)
												return;

											var row = $(this).closest('tr');
											var songId = $(row).find('input')
													.val();
											var listIndex = $(row).index();
											var message = 'Möchtest du <strong>"'
													+ $(row)
															.find(
																	'td:nth-child(2) strong')
															.text()
													+ '"</strong> wirklich entfernen?';
											var footer = $('<div id="deleteSongFooter">'
													+ '<button class="btn btn-danger" data-listIndex="'
													+ listIndex
													+ '" data-songId="'
													+ songId
													+ '">JA</button>'
													+ '<button class="btn">NEIN</button></div>');

											$('.modal .modal-header h4').html(
													message);
											$('.modal .modal-body').hide();
											$('.modal .modal-footer button')
													.hide();
											$('.modal .modal-footer').append(
													footer);
											$('.modal #deleteSongFooter button')
													.click(
															function(event) {
																if ($(this)
																		.hasClass(
																				'btn-danger')) {
																	var songId = $(
																			this)
																			.attr(
																					'data-songId');
																	var listIndex = $(
																			this)
																			.attr(
																					'data-listIndex');
																	removeSong(
																			listIndex,
																			songId);
																}
																resetModal();
																$(
																		'.modal .modal-footer')
																		.remove(
																				'#deleteSongFooter');
															});

											$('.modal').modal({
												backdrop : 'static',
												keyboard : false
											});
										});
					};

					/**
					 * Initializes all handlers for playlist functionality.
					 */
					var initPlaylist = function() {
						initSorting();
						initTooltip();
						initRemoveSongHandling();
					};

					/**
					 * @deprecated
					 */
					// var updatePlaylist = function() {
					// $.ajax({
					// url : document.location.pathname + 'playlist/get',
					// cache : false,
					// success : function(PlainObjectData, textStatus,
					// jqXHR) {
					// $('#playlist').html(PlainObjectData);
					// initPlaylist();
					// },
					// error : function(jqXHR, textStatus, errorThrown) {
					// displayError(jqXHR);
					// }
					// });
					// };
					/**
					 * Configure server push.
					 */
					var playlistPusher = new Object();
					playlistPusher.socket = $.atmosphere;
					playlistPusher.transport = 'websocket';

					// We are now ready to cut the request
					playlistPusher.request = {
						url : document.location.pathname/* document.location.toString() + */
								+ 'push',
						contentType : 'text/html',
						// To solve intermixed messages problem.
						trackMessageSize : true,
						// Share a connection amongst open windows/tabs.
						shared : true,
						transport : this.transport,
						fallbackTransport : 'long-polling'
					};

					playlistPusher.request.onOpen = function(response) {
						console.log('Atmosphere connected using '
								+ response.transport + '.');
						this.transport = response.transport;
					};

					playlistPusher.request.onTransportFailure = function(
							errorMsg, request) {
						console.log('Atmosphere transport failure occurred!');
						console.log(errorMsg);
						if (window.EventSource) {
							request.fallbackTransport = 'sse';
							this.transport = 'see';
						}
					};

					// Invoked every time we receive data from the server.
					playlistPusher.request.onMessage = function(response) {
						console.log('Atmosphere message received.');
						$('#playlist').html(response.responseBody);
						initPlaylist();
					};

					playlistPusher.request.onClose = function(response) {
						console.log('Atmosphere disconnected.');
					};

					// To connect and send data to the server.
					// Once subscribed, we are ready so receive and send data.
					playlistPusher.connect = function() {
						console.log('Atmosphere connecting...');
						this.socket.subscribe(this.request);
					};

					/**
					 * Setup
					 */
					var setup = function() {
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

						// Distance Slider
						$('#slider').slider({
							slide : function(event, ui) {
								$('#amountLabel').text(ui.value);
								$('#amount').val(ui.value);
							},
							value : 25,
							min : 0,
							max : 100,
							step : 10,
						});
						$('#amountLabel').text($('#slider').slider('value'));
						$('#amount').val($('#slider').slider('value'));

						initQueryInputHandler();
						initPlaylist();
						checkServerState();
						playlistPusher.connect();
					};

					setup();
				});
