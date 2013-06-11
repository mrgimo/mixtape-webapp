"use strict";

/**
 * Forcing Web Audio Api to not being Picky about files. This should be done by
 * api itself; and hopefully will...
 * 
 * @source http://stackoverflow.com/questions/10365335/decodeaudiodata-returning-a-null-error#14277082
 * 
 * @param Audio
 *            node
 * @returns Boolean
 */
function syncStream(node) {
	var buf8 = new Uint8Array(node.buf);
	buf8.indexOf = Array.prototype.indexOf;
	var i = node.sync, b = buf8;
	while (1) {
		node.retry++;
		i = b.indexOf(0xFF, i);
		if (i == -1 || (b[i + 1] & 0xE0 == 0xE0))
			break;
		i++;
	}
	if (i != -1) {
		var tmp = node.buf.slice(i); // Carefull, there it returns copy.
		delete (node.buf);
		node.buf = null;
		node.buf = tmp;
		node.sync = i;
		return true;
	}
	return false;
}

/**
 * For browsers where the typed arrays aren't available.
 * 
 * @source https://gist.github.com/notmasteryet/1057924
 */
function registerUint8Array() {
	if (window.Uint8Array)
		return;

	(function() {
		try {
			var a = new Uint8Array(1);
			return; // no need
		} catch (e) {
		}

		function subarray(start, end) {
			return this.slice(start, end);
		}

		function set_(array, offset) {
			if (arguments.length < 2)
				offset = 0;
			for ( var i = 0, n = array.length; i < n; ++i, ++offset)
				this[offset] = array[i] & 0xFF;
		}

		// we need typed arrays
		function TypedArray(arg1) {
			var result;
			if (typeof arg1 === "number") {
				result = new Array(arg1);
				for ( var i = 0; i < arg1; ++i)
					result[i] = 0;
			} else
				result = arg1.slice(0);
			result.subarray = subarray;
			result.buffer = result;
			result.byteLength = result.length;
			result.set = set_;
			if (typeof arg1 === "object" && arg1.buffer)
				result.buffer = arg1.buffer;

			return result;
		}

		window.Uint8Array = TypedArray;
		window.Uint32Array = TypedArray;
		window.Int32Array = TypedArray;
	})();
}

/**
 * @source http://phpjs.org/functions/base64_decode/
 */
function base64_decode(data) {
	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];

	if (!data) {
		return data;
	}

	data += '';

	do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
			tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
			tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	} while (i < data.length);

	dec = tmp_arr.join('');

	return dec;
}

window.Mixtape.modal.isDisplayingError = false;

window.Mixtape.server.statisticsFetchInterval = 10000;

window.Mixtape.server.getStatistics = function() {
	$.ajax({
		url : document.location.pathname + 'server/getStatistics',
		cache : false,
		success : function(PlainObjectData, textStatus, jqXHR) {
			console.log("Retrieved server statistics.");
			$('#systemStatusContainer').html(PlainObjectData);
			setTimeout(Mixtape.server.getStatistics,
					Mixtape.server.statisticsFetchInterval);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == "401") {
				Mixtape.authentication.showLoginForm(this);
				return;
			}
			console.log("Error while retrieving server statistics.");
			Mixtape.modal.displayError(jqXHR);
			setTimeout(Mixtape.server.getStatistics,
					Mixtape.server.statisticsFetchInterval);
		}
	});
};

window.Mixtape.server.musicDirectory = {
	checkInterval : 5000,
	timeout : {},
	scan : function() {
		this.disableBtn();
		$
				.ajax({
					url : document.location.pathname + 'server/scanDirectory',
					cache : false,
					success : function(PlainObjectData, textStatus, jqXHR) {
						var result = jqXHR
								.getResponseHeader("X-MixTape-isScanning");
						if (result === "true")
							Mixtape.server.musicDirectory.isScanningDirectory();
					},
					error : function(jqXHR, textStatus, errorThrown) {
						if (jqXHR.status == "401") {
							Mixtape.authentication.showLoginForm(this);
							return;
						}
						console
								.log("Error while submitting command for scanning directory.");
						Mixtape.modal.displayError(jqXHR);
						Mixtape.server.musicDirectory.enableBtn();
					}
				});
	},
	isScanningDirectory : function() {
		if (Mixtape.modal.isDisplayingServerState)
			return;

		$.ajax({
			url : document.location.pathname + 'server/isScanningDirectory',
			cache : false,
			success : function(PlainObjectData, textStatus, jqXHR) {
				var result = jqXHR.getResponseHeader("X-MixTape-isScanning");
				if (result === "false") {
					Mixtape.server.musicDirectory.enableBtn();
					return;
				}

				Mixtape.server.musicDirectory.timeout = setTimeout(
						Mixtape.server.musicDirectory.isScanningDirectory,
						Mixtape.server.musicDirectory.checkInterval);
			},
			error : function(jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == "401") {
					Mixtape.authentication.showLoginForm(this);
					return;
				}
			}
		});
	},
	disableBtn : function() {
		$('#scanMusicDirectory a').attr('disabled', 'disabled');
		$('#scanMusicDirectory a').removeClass('btn-primary');
		$('#scanMusicDirectory span').show();
	},
	enableBtn : function() {
		$('#scanMusicDirectory span').hide();
		$('#scanMusicDirectory a').addClass('btn-primary');
		$('#scanMusicDirectory a').removeAttr('disabled');
	}
}

/**
 * Additional playlist functionality after login.
 */
// Overwrite existing init-function.
window.Mixtape.playlist.initAuthenticated = function() {
	Mixtape.playlist.init();
	Mixtape.playlist.initTooltips();
	Mixtape.playlist.initRemoveSongHandler();
}
window.Mixtape.playlist.sort = function(songId, oldPosition, newPosition) {
	$
			.ajax({
				url : document.location.pathname + 'playlist/sort?songId='
						+ songId + '&oldPosition=' + oldPosition
						+ '&newPosition=' + newPosition,
				type : 'POST',
				cache : false,
				success : function(PlainObjectData, textStatus, jqXHR) {
					console.log('Success sorting.');
				},
				error : function(jqXHR, textStatus, errorThrown) {
					Mixtape.modal.displayError(jqXHR);
				}
			});
};
window.Mixtape.playlist.initSortHandler = function() {
	var oldPosition;
	var songId;
	$('#playlist tbody').sortable({
		start : function(event, ui) {
			songId = $(ui.item).find('input').val();
			oldPosition = ui.item.index();
		},
		stop : function(event, ui) {
			if (ui.item.index() !== oldPosition) {
				Mixtape.playlist.sort(songId, oldPosition, ui.item.index());
			}
		}
	});
	$('#playlist tbody').disableSelection();
};
window.Mixtape.playlist.removeSong = function(listIndex, songId) {
	var element = $('#playlist tbody tr:nth-child(' + (parseInt(listIndex) + 1)
			+ ')');

	if ($(element).find('input').val() !== songId) {
		var errorMessage = {
			status : 'beim Löschen eines Songs',
			responseText : 'Playlist-Daten waren nicht mehr aktuell.'
		};
		Mixtape.modal.displayError(errorMessage);
		return;
	}

	$.ajax({
		url : document.location.pathname + 'playlist/remove?songId=' + songId
				+ '&songPosition=' + listIndex,
		type : 'POST',
		cache : false,
		success : function(PlainObjectData, textStatus, jqXHR) {
			console.log('Removing song successful.');
		},
		error : function(jqXHR, textStatus, errorThrown) {
			Mixtape.modal.displayError(jqXHR);
		}
	});
};
window.Mixtape.playlist.initRemoveSongHandler = function() {
	$("#playlist .btn-danger").click(
			function(event) {
				if (Mixtape.modal.isDisplayingError
						|| Mixtape.modal.isDisplayingServerState)
					return;

				var row = $(this).closest('tr');
				var songId = $(row).find('input').val();
				var listIndex = $(row).index();
				var message = 'Möchtest du <strong>"'
						+ $(row).find('td:nth-child(2) strong').text()
						+ '"</strong> wirklich entfernen?';
				var footer = $('<div id="deleteSongFooter">'
						+ '<button class="btn btn-danger" data-listIndex="'
						+ listIndex + '" data-songId="' + songId
						+ '">JA</button>'
						+ '<button class="btn">NEIN</button></div>');

				$('.modal .modal-header h4').html(message);
				$('.modal .modal-body').hide();
				$('.modal .modal-footer button').hide();
				$('.modal .modal-footer').append(footer);
				$('.modal #deleteSongFooter button').click(function(event) {
					if ($(this).hasClass('btn-danger')) {
						var songId = $(this).attr('data-songId');
						var listIndex = $(this).attr('data-listIndex');
						Mixtape.playlist.removeSong(listIndex, songId);
					}
					Mixtape.modal.reset();
					$('.modal .modal-footer').remove('#deleteSongFooter');
				});

				$('.modal').modal({
					backdrop : 'static',
					keyboard : false
				});
			});
};

window.Mixtape.playlistSettings = {
	resultPlaceholder : $('#playlistSettingsQueryResults ul:first').html()
			.trim(),
	placeholder : $('#playlistSettingsSelectedSongs ul:first').html().trim(),
	initialSliderValue : 30,
	init : function() {
		var $form = $('form#playlistSettings');
		$form.submit(function(event) {
			event.preventDefault();

			if ($('form#playlistSettings input[name=term]').is(':focus'))
				return;

			$.ajax({
				url : $form.attr('action'),
				type : 'POST',
				data : $form.serialize(),
				cache : false,
				success : function(PlainObjectData, textStatus, jqXHR) {
					console.log('Success creating playlist.');
					('.nav a[href="#music"]').tab('show');
				},
				error : function(jqXHR, textStatus, errorThrown) {
					Mixtape.modal.displayError(jqXHR);
				}
			});
		});

		$('#playlistSettings input[type=reset]').click(function() {
			Mixtape.playlistSettings.reset();
		});
		this.initStartSongSelector();
		this.reset();
	},
	initStartSongSelector : function() {
		var placeholderSelector = '#playlistSettingsSelectedSongs .ul-placeholder';
		$('#playlistSettings ul').sortable({
			connectWith : '#playlistSettings ul',
			over : function(event, ui) {
				$(placeholderSelector).hide();
			},
			out : function(event, ui) {
				$(placeholderSelector).show();
			},
			stop : function(event, ui) {
				var listSize = $('#playlistSettingsSelectedSongs li').length;
				if (listSize >= 1) {
					$('.ul-placeholder').remove();
					Mixtape.playlistSettings.updateSelectContainer();
				} else if (listSize == 0) {
					var placeholder = Mixtape.playlistSettings.placeholder;
					$('#playlistSettingsSelectedSongs ul').html(placeholder);
					Mixtape.playlistSettings.updateSelectContainer();
				} else {
					$('.ul-placeholder').show();
				}

			}
		});
		$('#playlistSettings ul').disableSelection();
	},
	updateSelectContainer : function() {
		$('.playlistSettingsSongSelect select').html('');

		if ($('#playlistSettingsSelectedSongs li').length <= 1
				&& $('#playlistSettingsSelectedSongs li.ul-placeholder').length !== 0) {
			return;
		}

		$('#playlistSettingsSelectedSongs li').each(function(index) {
			$('.playlistSettingsSongSelect select').append($('<option>', {
				selected : 'selected',
				value : $(this).find('input').val()
			}));
		});
	},
	reset : function() {
		$('#playlistSettings ul').html('');
		$('#playlistSettingsQueryResults ul').html(this.resultPlaceholder);
		$('#playlistSettingsSelectedSongs ul').html(this.placeholder);
		this.updateSelectContainer();

		$('#startLengthInMinutes').change(function() {
			$('#startLengthInSongs').val('0');
		});
		$('#startLengthInSongs').change(function() {
			$('#startLengthInMinutes').val('0');
		})

		$('.slider').slider(
				{
					slide : function(event, ui) {
						$(event.target).closest('.slider-container').find(
								'.valueLabel').text(ui.value);
						$(event.target).closest('.slider-container').find(
								'input[type=hidden]').val(ui.value);
					},
					value : Mixtape.playlistSettings.initialSliderValue,
					min : 0,
					max : 100,
					step : 10
				});
		$('.slider-container .valueLabel').text(this.initialSliderValue);
		$('.slider-container input[type=hidden]').val(this.initialSliderValue);
	}
};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.Mixtape.streaming = {
	audio : new Audio(),
	// audioContext : new AudioContext(),
	source : {},
	buffers : [],
	socket : $.atmosphere,
	transport : 'websocket',
	// To connect and send data to the server.
	// Once subscribed, we are ready so receive and send
	// data.
	connect : function() {
		console.log('Atmosphere connecting to stream...');
		// this.audioOutput.mozSetup(2, 44100);
		var audio = Mixtape.streaming.audio;
		audio.controls = true;
		audio.autoplay = true;
		audio.volume = 0.5;
		audio.oncanplay = function() {
			console.log("Has audio to play.");
			// audio.play();
		};
		document.body.appendChild(audio);
		console.log("Can play type: " + audio.canPlayType("audio/ogg"));

		// this.source = this.audioContext.createMediaElementSource(audio);

		this.source = this.audioContext.createBufferSource();
		this.socket.subscribe(this.request);
	},

	request : {
		url : document.location.pathname + 'playlist/listen',
		contentType : 'arraybuffer',
		// To solve intermixed messages problem.
		trackMessageSize : true,
		// Share a connection amongst open windows/tabs.
		shared : true,
		transport : this.transport,

		fallbackTransport : 'long-polling',

		onOpen : function(response) {
			console.log('Atmosphere connected to stream using '
					+ response.transport + '.');
			this.transport = response.transport;
		},

		onTransportFailure : function(errorMsg, request) {
			console.log('Atmosphere transport failure occurred on stream!');
			console.log(errorMsg);
			if (window.EventSource) {
				request.fallbackTransport = 'sse';
				this.transport = 'see';
			}
		},
		// Invoked every time we receive data from the
		// server.
		onMessage : function(response) {
			console.log("Receiving streaming data.");
			try {
				var json = $.parseJSON(response.responseBody);

				if (json == "EOS") {
					console.log("End of stream received.");
					Mixtape.streaming.socket.unsubscribe();
					return;
				}

				var blob = new Blob(json, {
					type : 'arraybuffer'
				});

				// var blob = new Blob(response.responseBody, {
				// type : 'arraybuffer'
				// });

				// var blob = response.responseBody;

				var fileReader = new FileReader();
				fileReader.onload = function() {
					console.log("File read!");

					// Mixtape.streaming.source.buffer = this.result;
					// Mixtape.streaming.audio.play();
					// Mixtape.streaming.source.start(0);

					Mixtape.streaming.audioContext
							.decodeAudioData(
									// Type: ArrayBuffer
									this.result,
									function(decodedBuffer) {
										console.log("AUDIO:");
										Mixtape.streaming.source.buffer = decodedBuffer;
										Mixtape.streaming.source
												.connect(Mixtape.streaming.audioContext.destination);
										Mixtape.streaming.source.start(0);
										// Mixtape.streaming.audio.play();
									},
									function(error) {
										console
												.log("An error in decodeAudioData");
									});
				};
				fileReader.readAsArrayBuffer(blob);
			} catch (error) {
				console.log("OOOOPPPS!");
				console.log(error);
			}
		},

		onClose : function(response) {
			console.log('Atmospheredisconnected from stream.');
		}
	}
}

$(document).ready(function() {
	/**
	 * Initialize additional functionality.
	 */
	Mixtape.playlist.initAuthenticated();
	Mixtape.playlistSettings.init();
	Mixtape.server.getStatistics();

	$('#scanMusicDirectory a').click(function(event) {
		Mixtape.server.musicDirectory.scan();
	});
});

window.addEventListener('load', function(e) {
	// if (!window.Uint8Array)
	// registerUint8Array();
	// Mixtape.streaming.connect();
});