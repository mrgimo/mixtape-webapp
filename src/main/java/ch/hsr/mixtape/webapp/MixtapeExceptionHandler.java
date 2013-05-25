package ch.hsr.mixtape.webapp;

import org.slf4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import ch.hsr.mixtape.exception.PlaylistChangedException;
import ch.hsr.mixtape.exception.UninitializedPlaylistException;

/**
 * This class is only a helper for keeping the exception handler in each
 * controller as simple as possible.
 * 
 * @author Stefan Derungs
 */
public class MixtapeExceptionHandler {

	public static ResponseEntity<String> handleException(Exception e, Logger log) {
		String message;
		if (e instanceof UninitializedPlaylistException) {
			log.error("Handling " + UninitializedPlaylistException.class + ".",
					e);
			message = e.getMessage();
		} else if (e instanceof PlaylistChangedException) {
			log.error("Handling " + PlaylistChangedException.class + ".", e);
			message = e.getMessage();
		} else if (e instanceof GUIException) {
			log.error("Handling " + GUIException.class + ".", e);
			message = e.getMessage();
		} else {
			log.error("Handling unexpected exception.", e);
			if (log.isDebugEnabled())
				message = "An unexpected exception occurred. " + e.getMessage();
			else
				message = "An unexpected exception occurred. "
						+ "Please see server log for more information.";
		}

		return new ResponseEntity<String>(message, HttpStatus.BAD_REQUEST);
	}

}
