package ch.hsr.mixtape.webapp.controller;

import java.io.UnsupportedEncodingException;
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

import ch.hsr.mixtape.application.ApplicationFactory;
import ch.hsr.mixtape.application.DummyData;
import ch.hsr.mixtape.exception.PlaylistChangedException;
import ch.hsr.mixtape.exception.UninitializedPlaylistException;
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

	private static final String ATMOSPHERE_PLAYLIST_PATH = "/push";

	private static final Logger LOG = LoggerFactory
			.getLogger(AjaxRequestController.class);

	@Autowired
	private ViewResolver viewResolver;

	@RequestMapping(method = RequestMethod.GET, value = "/server/checkStatus")
	public ResponseEntity<Object> checkServerStatus() {
		return getResponseEntity(HttpStatus.OK, "", null);
	}

	/**
	 * @param term
	 * @return songquery_viewhelper view
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/search")
	public ModelAndView searchSong(@RequestParam("term") String term) {
		return new ModelAndView("songquery_viewhelper", "queriedSongs",
				ApplicationFactory.getQueryService().findSongsByTerm(term));
	}

	/**
	 * @return playlist_viewhelper view
	 * @throws UninitializedPlaylistException
	 */
	@RequestMapping(method = RequestMethod.GET, value = "/playlist/get")
	public ModelAndView getPlaylist() throws UninitializedPlaylistException {
		ApplicationFactory.getPlaylistService().createPlaylist(
				DummyData.getDummyPlaylistSettings());
		return new ModelAndView("playlist_viewhelper", "playlist",
				ApplicationFactory.getPlaylistService().getCurrentPlaylist());
	}

	/**
	 * @see ch.hsr.mixtape.application.service.PlaylistService#alterSorting See
	 *      PlaylistService.alterSorting for parameter information.
	 * @return In case an error occurred but no exception was thrown, the
	 *         HTTP-Response-Header `Warning` contains error description.
	 * @throws UninitializedPlaylistException
	 * @throws PlaylistChangedException
	 * @throws GUIException
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/sort")
	public ResponseEntity<Object> sortPlaylist(HttpServletRequest request,
			@RequestParam(value = "songId") long songId,
			@RequestParam(value = "oldPosition") int oldPosition,
			@RequestParam(value = "newPosition") int newPosition)
			throws UninitializedPlaylistException, PlaylistChangedException,
			GUIException {
		if (ApplicationFactory.getPlaylistService().alterSorting(songId,
				oldPosition, newPosition)) {
			try {
				notifyPlaylistSubscribers(request);
			} catch (Exception e) {
				subscriberNotificationFailed(e);
			}
			return getResponseEntity(HttpStatus.OK, "", null);
		} else {
			return getResponseEntity(HttpStatus.BAD_REQUEST,
					"Sorting playlist failed.", null);
		}
	}

	/**
	 * @see ch.hsr.mixtape.application.service.PlaylistService#removeSong See
	 *      PlaylistService.alterSorting for parameter information.
	 * @return In case an error occurred but no exception was thrown, the
	 *         HTTP-Response-Header `Warning` contains error description.
	 * @throws UninitializedPlaylistException
	 * @throws PlaylistChangedException
	 * @throws GUIException
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/remove")
	public ResponseEntity<Object> removeSong(HttpServletRequest request,
			@RequestParam(value = "songId") long songId,
			@RequestParam(value = "songPosition") int songPosition)
			throws UninitializedPlaylistException, PlaylistChangedException,
			GUIException {
		if (ApplicationFactory.getPlaylistService().removeSong(songId,
				songPosition)) {
			try {
				notifyPlaylistSubscribers(request);
			} catch (Exception e) {
				subscriberNotificationFailed(e);
			}
			return getResponseEntity(HttpStatus.OK, "", null);
		} else {
			return getResponseEntity(HttpStatus.BAD_REQUEST,
					"Removing song from playlist failed.", null);
		}
	}

	/**
	 * @return If an error occured, the HTTP-Response-Header `Warning` contains
	 *         error description.
	 * @throws UninitializedPlaylistException
	 * @throws GUIException
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/playlist/wish")
	public @ResponseBody
	ResponseEntity<Object> addWish(HttpServletRequest request,
			@RequestParam(value = "songId") long songId)
			throws UninitializedPlaylistException, GUIException {
		try {
			if (ApplicationFactory.getPlaylistService().addWish(songId)) {
				LOG.debug("Adding wish to playlist succeeded.");
				notifyPlaylistSubscribers(request);
				return getResponseEntity(HttpStatus.OK, "", null);
			} else {
				LOG.error("Adding wish to playlist failed.");
				return getResponseEntity(HttpStatus.PRECONDITION_FAILED,
						"Adding wish to playlist failed.", null);
			}
		} catch (Exception e) {
			String message = "An error occurred while updating playlist to the registered clients.";
			LOG.error(message, e);
			GUIException ex = new GUIException(message);
			ex.addSuppressed(e);
			throw ex;
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
	@RequestMapping(value = ATMOSPHERE_PLAYLIST_PATH, method = RequestMethod.GET)
	public ModelAndView subscribeToPlaylist(HttpServletRequest request)
			throws Exception {
		System.err.println("subscribeToPlaylist");
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
		System.err.println("registerClient");
		// Log all events on the console, including WebSocket events.
		resource.addEventListener(new WebSocketEventListenerAdapter());

		// res.setContentType("text/html;charset=ISO-8859-1");
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
	 * @throws UninitializedPlaylistException
	 *             If playlist has not been initialized.
	 * @throws UnsupportedEncodingException
	 *             If it fails to retrieve the content from the response.
	 * @throws Exception
	 *             If the view cannot be rendered.
	 */
	private void notifyPlaylistSubscribers(HttpServletRequest request)
			throws Exception {
		System.err.println("notifyPlaylistSubscribers");
		Broadcaster broadcaster = lookupBroadcaster(request.getPathInfo());

		// http://stackoverflow.com/questions/9705293/render-multiple-views-within-a-single-request
		View view = viewResolver.resolveViewName("playlist_viewhelper",
				Locale.GERMAN);
		ModelAndView playlistView = new ModelAndView(view, "playlist",
				ApplicationFactory.getPlaylistService().getCurrentPlaylist());
		MockHttpServletResponse mockResponse = new MockHttpServletResponse();
		playlistView.getView().render(playlistView.getModel(), request,
				mockResponse);

		broadcaster.broadcast(mockResponse.getContentAsString());
	}

	private void subscriberNotificationFailed(Exception e) throws GUIException {
		LOG.error("Notifying playlist subscribers failed "
				+ "because view could not be rendered.", e);
		GUIException ex = new GUIException(
				"An error occurred while updating playlist "
						+ "to the registered clients.");
		ex.addSuppressed(e);
		throw ex;
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
			String message, Throwable e) {
		if (!message.isEmpty()) {
			HttpHeaders httpHeaders = new HttpHeaders();
			httpHeaders.set("Warning", message);
			return new ResponseEntity<>(httpHeaders, status);
		}
		return new ResponseEntity<>(status);
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseEntity<String> handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
