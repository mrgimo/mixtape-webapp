package ch.hsr.mixtape.webapp;

import org.slf4j.Logger;
import org.springframework.util.ClassUtils;
import org.springframework.web.servlet.ModelAndView;

import ch.hsr.mixtape.exception.InvalidPlaylistException;
import ch.hsr.mixtape.exception.PlaylistChangedException;

/**
 * This class is only a helper for keeping the exception handler in each
 * controller as simple as possible.
 * 
 * @author Stefan Derungs
 */
public class MixtapeExceptionHandler {

	public static ModelAndView handleException(Exception e, Logger log) {
		String message;
		if (e instanceof InvalidPlaylistException) {
			log.error("Handling " + InvalidPlaylistException.class + ".", e);
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

		ModelAndView mav = new ModelAndView("error_viewhelper");
		mav.addObject("class", ClassUtils.getShortName(e.getClass()));
		mav.addObject("message", message);
		return mav;
	}

}
