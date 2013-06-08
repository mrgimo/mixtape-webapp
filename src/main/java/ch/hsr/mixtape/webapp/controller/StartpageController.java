package ch.hsr.mixtape.webapp.controller;

import java.security.Principal;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

import ch.hsr.mixtape.application.service.ApplicationFactory;
import ch.hsr.mixtape.application.service.PlaylistService;
import ch.hsr.mixtape.exception.InvalidPlaylistException;
import ch.hsr.mixtape.model.PlaylistSettings;
import ch.hsr.mixtape.model.Song;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandler;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandling;

/**
 * This controller is called upon page load.
 * 
 * @author Stefan Derungs
 */
@Controller
public class StartpageController implements MixtapeExceptionHandling {

	private static final Logger LOG = LoggerFactory
			.getLogger(StartpageController.class);

	private static final PlaylistService PLAYLIST_SERVICE = ApplicationFactory
			.getPlaylistService();

	/**
	 * This is the handling method for homepage calls.
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/")
	public ModelAndView start(HttpServletRequest request, Principal principal) {
		ModelMap model = new ModelMap();

		model.addAttribute("loginIncludeCancel", true);
		try {
			model.addAttribute("playlist", PLAYLIST_SERVICE.getPlaylist());
		} catch (InvalidPlaylistException e) {
			model.addAttribute("playlist", null);
		}

		model.addAttribute("queriedSongs", new ArrayList<Song>());

		if (principal != null) {
			model.addAttribute("isAuthenticated", true);

			model.addAttribute("systemstatus", ApplicationFactory
					.getSystemService().getSystemStatus());

			try {
				model.addAttribute("playlistSettings",
						PLAYLIST_SERVICE.getPlaylistSettings());
			} catch (InvalidPlaylistException e) {
				model.addAttribute("playlistSettings", new PlaylistSettings());
			}
		} else {
			model.addAttribute("isAuthenticated", false);
		}

		return new ModelAndView("start", model);
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public @ResponseBody
	ResponseEntity<String> handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
