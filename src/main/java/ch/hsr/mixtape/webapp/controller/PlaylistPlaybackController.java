package ch.hsr.mixtape.webapp.controller;

import static ch.hsr.mixtape.application.ApplicationFactory.getPlaylistPlaybackService;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import ch.hsr.mixtape.exception.InvalidPlaylistException;

/**
 * This controller is only intended for demo purposes.
 * 
 * @author Stefan Derungs
 */
@Controller
public class PlaylistPlaybackController {

	private static final Logger LOG = LoggerFactory
			.getLogger(PlaylistPlaybackController.class);

	@PreAuthorize("permitAll")
	@RequestMapping(value = "/playback/listen", method = RequestMethod.GET)
	public @ResponseBody
	String listenToPlaylist(HttpServletRequest request) {
		String song = "";
		try {
			song = getPlaylistPlaybackService().getCurrentSong();
		} catch (InvalidPlaylistException | IOException e) {
			LOG.error("An error occurred during playback.", e);
		}
		return song;
	}

}
