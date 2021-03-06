package ch.hsr.mixtape.webapp.controller;

import static ch.hsr.mixtape.application.ApplicationFactory.getPlaylistService;
import static ch.hsr.mixtape.application.ApplicationFactory.getServerService;

import java.security.Principal;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

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

	/**
	 * This is the handling method for homepage calls.
	 * 
	 * @throws InvalidPlaylistException
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/")
	public ModelAndView start(HttpServletRequest request, Principal principal)
			throws InvalidPlaylistException {
		ModelMap model = new ModelMap();

		model.addAttribute("loginIncludeCancel", true);

		if (getPlaylistService().isPlaylistInitialized())
			model.addAttribute("playlist", getPlaylistService().getPlaylist());
		else
			model.addAttribute("noPlaylist", true);

		model.addAttribute("queriedSongs", new ArrayList<Song>());

		if (principal != null) {
			model.addAttribute("isAuthenticated", true);

			model.addAttribute("systemstatus", getServerService()
					.getSystemStatus());

			try {
				model.addAttribute("playlistSettings", getPlaylistService()
						.getPlaylistSettings());
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
	ModelAndView handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
