package ch.hsr.mixtape.webapp.controller;

import java.io.UnsupportedEncodingException;
import java.security.Principal;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.atmosphere.cpr.ApplicationConfig;
import org.atmosphere.cpr.AtmosphereResource;
import org.atmosphere.cpr.Broadcaster;
import org.atmosphere.cpr.BroadcasterFactory;
import org.atmosphere.cpr.FrameworkConfig;
import org.atmosphere.cpr.HeaderConfig;
import org.atmosphere.websocket.WebSocketEventListenerAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.ViewResolver;

import ch.hsr.mixtape.application.DummyData;
import ch.hsr.mixtape.application.service.ApplicationFactory;
import ch.hsr.mixtape.application.service.PlaylistService;
import ch.hsr.mixtape.exception.InvalidPlaylistException;
import ch.hsr.mixtape.webapp.GUIException;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandler;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandling;
import ch.hsr.mixtape.webapp.NoOpView;

/**
 * This controller is responsible for handling all AJAX requests.
 * 
 * @author Stefan Derungs
 */
@Controller
public class AjaxRequestController implements MixtapeExceptionHandling {

	private static final String ATMOSPHERE_PLAYLIST_PATH = "/playlist/push";

	private static final Logger LOG = LoggerFactory
			.getLogger(AjaxRequestController.class);

	@Autowired
	private ViewResolver viewResolver;

	private PlaylistService playlistService = ApplicationFactory
			.getPlaylistService();

	@PreAuthorize("permitAll")
	@RequestMapping(method = RequestMethod.GET, value = "/server/checkStatus")
	public ResponseEntity<Object> checkServerStatus() {
		return getResponseEntity(HttpStatus.OK, "");
	}

	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.GET, value = "/server/getStatistics")
	public ModelAndView getServerStatistics() {
		return new ModelAndView("systemstatus_viewhelper", "systemstatus",
				ApplicationFactory.getSystemService().getSystemStatus());
	}

	/**
	 * @param term
	 * @return songquery_viewhelper view
	 */
	@PreAuthorize("permitAll")
	@RequestMapping(method = RequestMethod.GET, value = "/search")
	public ModelAndView searchSong(@RequestParam("term") String term) {
		return new ModelAndView("songquery_viewhelper", "queriedSongs",
				ApplicationFactory.getQueryService().findSongsByTerm(term));
	}

	/**
	 * @return playlist_viewhelper view
	 * @throws InvalidPlaylistException
	 */
	@PreAuthorize("permitAll")
	@RequestMapping(method = RequestMethod.GET, value = "/playlist/get")
	public ModelAndView getPlaylist() throws InvalidPlaylistException {
		playlistService.createPlaylist(DummyData.getDummyPlaylistSettings());
		return new ModelAndView("playlist_viewhelper", "playlist",
				playlistService.getNextSongs());
	}

	/**
	 * @see ch.hsr.mixtape.application.service.PlaylistService#alterSorting See
	 *      PlaylistService.alterSorting for parameter information.
	 * @return In case an error occurred but no exception was thrown, the
	 *         HTTP-Response-Header `Warning` contains error description.
	 */
	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/sort")
	public ResponseEntity<Object> sortPlaylist(HttpServletRequest request,
			Principal principal, @RequestParam(value = "songId") long songId,
			@RequestParam(value = "oldPosition") int oldPosition,
			@RequestParam(value = "newPosition") int newPosition) {

		final String errorMessage = "Sorting playlist failed.";
		try {
			playlistService.alterSorting(songId, oldPosition, newPosition);
			notifyPlaylistSubscribers(request, principal);
			return getResponseEntity(HttpStatus.OK, "");
		} catch (GUIException e) {
			LOG.error("Notifying playlist subscribers failed ", e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		} catch (Exception e) {
			LOG.error(errorMessage, e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		}
	}

	/**
	 * @see ch.hsr.mixtape.application.service.PlaylistService#removeSong See
	 *      PlaylistService.alterSorting for parameter information.
	 * @return In case an error occurred but no exception was thrown, the
	 *         HTTP-Response-Header `Warning` contains error description.
	 */
	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/remove")
	public ResponseEntity<Object> removeSong(HttpServletRequest request,
			Principal principal, @RequestParam(value = "songId") long songId,
			@RequestParam(value = "songPosition") int songPosition) {
		final String errorMessage = "Removing song from playlist failed.";
		try {
			playlistService.removeSong(songId, songPosition);
			notifyPlaylistSubscribers(request, principal);
			return getResponseEntity(HttpStatus.OK, "");
		} catch (GUIException e) {
			LOG.error("Notifying playlist subscribers failed ", e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		} catch (Exception e) {
			LOG.error(errorMessage, e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		}
	}

	/**
	 * @return If an error occured, the HTTP-Response-Header `Warning` contains
	 *         error description.
	 */
	@PreAuthorize("permitAll")
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/wish")
	public @ResponseBody
	ResponseEntity<Object> addWish(HttpServletRequest request,
			Principal principal, @RequestParam(value = "songId") long songId) {
		final String errorMessage = "Adding wish to playlist failed.";
		try {
			playlistService.addWish(songId);
			notifyPlaylistSubscribers(request, principal);
			return getResponseEntity(HttpStatus.OK, "");
		} catch (GUIException e) {
			LOG.error("Notifying playlist subscribers failed ", e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		} catch (Exception e) {
			LOG.error(errorMessage, e);
			return getResponseEntity(HttpStatus.BAD_REQUEST, errorMessage);
		}
	}

	/**
	 * Atmosphere: This method takes a request to subscribe to the given
	 * URL-path.
	 * 
	 * @source `subscribe` at [https
	 *         ://github.com/Atmosphere/atmosphere-extensions/blob/master/spring
	 *         /samples
	 *         /spring-tiles/src/main/java/org/atmosphere/samples/pubsub/spring
	 *         /PubSubController.java]
	 * @param request
	 * @return ModelAndView
	 */
	@PreAuthorize("permitAll")
	@RequestMapping(value = ATMOSPHERE_PLAYLIST_PATH, method = RequestMethod.GET)
	public ModelAndView subscribeToPlaylist(HttpServletRequest request)
			throws Exception {
		LOG.debug("Subscribing client to playlist updates.");
		AtmosphereResource resource = (AtmosphereResource) request
				.getAttribute(FrameworkConfig.ATMOSPHERE_RESOURCE);

		registerClient(resource, request, resource.getResponse());

		// A NoOpView is returned to tell Spring Dispatcher framework not to
		// render anything since it is all Atmosphere-related code.
		return new ModelAndView(new NoOpView());
	}

	/**
	 * Atmosphere: See AtmosphereHandlerPubSub example - same code as GET.
	 * 
	 * @source `doGet` at [https
	 *         ://github.com/Atmosphere/atmosphere-extensions/blob/master/spring
	 *         /samples
	 *         /spring-tiles/src/main/java/org/atmosphere/samples/pubsub/spring
	 *         /PubSubController.java]
	 */
	private void registerClient(AtmosphereResource resource,
			HttpServletRequest request, HttpServletResponse response) {
		LOG.debug("Registering client for playlist updates.");
		// Log all events on the console, including WebSocket events.
		resource.addEventListener(new WebSocketEventListenerAdapter());

		response.setContentType("text/html;charset=UTF-8");

		Broadcaster broadcaster = lookupBroadcaster(request.getPathInfo());
		resource.setBroadcaster(broadcaster);

		String header = request.getHeader(HeaderConfig.X_ATMOSPHERE_TRANSPORT);
		if (HeaderConfig.LONG_POLLING_TRANSPORT.equalsIgnoreCase(header)) {
			request.setAttribute(ApplicationConfig.RESUME_ON_BROADCAST,
					Boolean.TRUE);
			resource.suspend(-1);
		} else {
			resource.suspend(-1);
		}
	}

	/**
	 * Atmosphere: See AtmosphereHandlerPubSub example - same code as POST
	 * 
	 * @see [https
	 *      ://github.com/Atmosphere/atmosphere-extensions/blob/master/spring
	 *      /samples
	 *      /spring-tiles/src/main/java/org/atmosphere/samples/pubsub/spring
	 *      /PubSubController.java]
	 * @throws GUIException
	 */
	private void notifyPlaylistSubscribers(HttpServletRequest request,
			Principal principal) throws GUIException {
		final String errorMessage = "Notifying playlist subscribers failed: ";
		try {
			LOG.debug("Notifying playlist subscribers about an update.");
			Broadcaster broadcaster = lookupBroadcaster(request.getPathInfo());

			// http://stackoverflow.com/questions/9705293/render-multiple-views-within-a-single-request
			View view = viewResolver.resolveViewName("playlist_viewhelper",
					Locale.GERMAN);

			ModelAndView playlistView = new ModelAndView(view, "playlist",
					playlistService.getNextSongs());
			if (principal != null)
				playlistView.addObject("isAuthenticated", true);

			MockHttpServletResponse mockResponse = new MockHttpServletResponse();
			playlistView.getView().render(playlistView.getModel(), request,
					mockResponse);

			broadcaster.broadcast(mockResponse.getContentAsString());
		} catch (InvalidPlaylistException e) {
			throw new GUIException(errorMessage + "No playlist available.", e);
		} catch (UnsupportedEncodingException e) {
			throw new GUIException(errorMessage + "Content could not be "
					+ "retrieved from mock response.", e);
		} catch (Exception e) {
			throw new GUIException(
					errorMessage + "View could not be resolved.", e);
		}
	}

	/**
	 * Retrieve the {@link Broadcaster} based on the request's path info.
	 * 
	 * @see [https
	 *      ://github.com/Atmosphere/atmosphere-extensions/blob/master/spring
	 *      /samples
	 *      /spring-tiles/src/main/java/org/atmosphere/samples/pubsub/spring
	 *      /PubSubController.java]
	 * @param pathInfo
	 * @return the {@link Broadcaster} based on the request's path info.
	 */
	private Broadcaster lookupBroadcaster(String pathInfo) {
		LOG.debug("Looking up broadcaster");
		if (pathInfo == null) {
			return BroadcasterFactory.getDefault().lookup(
					ATMOSPHERE_PLAYLIST_PATH, true);
		} else {
			String[] decodedPath = pathInfo.split(ATMOSPHERE_PLAYLIST_PATH);
			return BroadcasterFactory.getDefault().lookup(
					decodedPath[decodedPath.length - 1], true);
		}
	}

	private ResponseEntity<Object> getResponseEntity(HttpStatus status,
			String message) {
		if (!message.isEmpty()) {
			HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.set("Warning", message);
			return new ResponseEntity<Object>(httpHeaders, status);
		}
		return new ResponseEntity<Object>(status);
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseEntity<String> handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
