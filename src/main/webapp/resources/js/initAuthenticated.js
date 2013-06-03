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

window.Mixtape.serverStatisticsFetchInterval = 5000;
window.Mixtape.isDisplayingError = false;
window.Mixtape.server.getStatistics = function() {
	$.ajax({
		url : document.location.pathname + 'server/getStatistics',
		cache : false,
		success : function(PlainObjectData, textStatus, jqXHR) {
			console.log("Retrieved server statistics.");
			$('#systemStatusContainer').html(PlainObjectData);
			setTimeout(Mixtape.server.getStatistics,
					serverStatisticsFetchInterval);
			return true;
		},
		error : function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == "401") {
				console.log("NOT  AUTHORIZED!");
				console.debug(this);
				Mixtape.authentication.showLoginForm(this);
				return;
			}
			console.log("Error while retrieving server statistics.");
			console.debug(jqXHR);
			Mixtape.modal.displayError(jqXHR);
			setTimeout(Mixtape.server.getStatistics,
					serverStatisticsFetchInterval);
			return false;
		}
	});
};

/**
 * Additional playlist functionality after login.
 */
// Overwrite existing init-function.
window.Mixtape.playlist.init = function() {
	Mixtape.playlist.initTooltips();
	Mixtape.playlist.initSortHandler();
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
			console.log('songId: ' + songId);
			oldPosition = ui.item.index();
			console.log('oldPosition: ' + oldPosition);
		},
		stop : function(event, ui) {
			if (ui.item.index() !== oldPosition) {
				console.log('newPosition: ' + ui.item.index());
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
				if (Mixtape.isDisplayingError || Mixtape.isDisplayingServerState)
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

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.Mixtape.streaming = {
	audio : new Audio(),
	audioContext : new AudioContext(),
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
			console.debug(response);
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
					console.debug(this.result);

					// Mixtape.streaming.source.buffer = this.result;
					// Mixtape.streaming.audio.play();
					// Mixtape.streaming.source.start(0);

					Mixtape.streaming.audioContext
							.decodeAudioData(
									// Type: ArrayBuffer
									this.result,
									function(decodedBuffer) {
										console.log("AUDIO:");
										console.debug(Mixtape.streaming.source);
										Mixtape.streaming.source.buffer = decodedBuffer;
										Mixtape.streaming.source
												.connect(Mixtape.streaming.audioContext.destination);
										Mixtape.streaming.source.start(0);
										// Mixtape.streaming.audio.play();
									},
									function(error) {
										console
												.log("An error in decodeAudioData");
										console.debug(error);
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
	 * Initialize `Distance Slider` for playlist settings
	 */
	$('#slider').slider({
		slide : function(event, ui) {
			$('#amountLabel').text(ui.value);
			$('#amount').val(ui.value);
		},
		value : 25,
		min : 0,
		max : 100,
		step : 10
	});
	$('#amountLabel').text($('#slider').slider('value'));
	$('#amount').val($('#slider').slider('value'));

	/**
	 * Initialize additional functionality.
	 */
	Mixtape.playlist.init();
	// Mixtape.server.getStatistics();
	// if (!window.Uint8Array)
	// registerUint8Array();
});

window.addEventListener('load', function(e) {
	//Mixtape.streaming.connect();
});