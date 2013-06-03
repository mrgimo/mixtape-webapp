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

import ch.hsr.mixtape.application.ApplicationFactory;
import ch.hsr.mixtape.application.DummyData;
import ch.hsr.mixtape.exception.UninitializedPlaylistException;
import ch.hsr.mixtape.model.Song;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandler;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandling;

/**
 * This controller is called upon page load.
 * 
 * @author Stefan Derungs
 */
@Controller
public class PageRequestController implements MixtapeExceptionHandling {

	private static final Logger LOG = LoggerFactory
			.getLogger(PageRequestController.class);

	@RequestMapping(method = RequestMethod.GET, value = "/")
	public ModelAndView start(HttpServletRequest request, Principal principal) {
		ModelMap model = new ModelMap();

		model.addAttribute("loginIncludeCancel", true);
		model.addAttribute("playlist", getPlaylist());
		model.addAttribute("queriedSongs", new ArrayList<Song>());

		if (principal != null) {
			model.addAttribute("isAuthenticated", true);
			
			model.addAttribute("systemstatus", ApplicationFactory
					.getSystemService().getSystemStatus());
			try {
				model.addAttribute("playlistsettings", ApplicationFactory
						.getPlaylistService().getCurrentPlaylistSettings());
			} catch (UninitializedPlaylistException e) {
				LOG.error("Error while fetching current playlist settings. "
						+ "Ommiting for Frontend output.", e);
			}
		} else {
			model.addAttribute("isAuthenticated", false);
		}

		return new ModelAndView("start", model);
	}

	private ArrayList<Song> getPlaylist() {
		ApplicationFactory.getPlaylistService().createPlaylist(
				DummyData.getDummyPlaylistSettings()); // TODO: dummy remove

		ArrayList<Song> playlist;
		try {
			playlist = ApplicationFactory.getPlaylistService().getNextSongs();
		} catch (UninitializedPlaylistException e) {
			playlist = new ArrayList<Song>();
		}
		return playlist;
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public @ResponseBody
	ResponseEntity<String> handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
