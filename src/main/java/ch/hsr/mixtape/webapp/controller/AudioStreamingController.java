package ch.hsr.mixtape.webapp.controller;

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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.ViewResolver;

import ch.hsr.mixtape.application.service.ApplicationFactory;
import ch.hsr.mixtape.application.service.StreamSubscriber;
import ch.hsr.mixtape.webapp.ByteArrayToBase64TypeAdapter;
import ch.hsr.mixtape.webapp.NoOpView;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * This controller is responsible for streaming the playlist over the web.
 * 
 * @author Stefan Derungs
 */
@Controller
public class AudioStreamingController implements StreamSubscriber {

	private static final Logger LOG = LoggerFactory
			.getLogger(AudioStreamingController.class);

	private static final String ATMOSPHERE_PLAYLIST_STREAM_PATH = "/playlist/listen";

	private static final Gson gson = new GsonBuilder()
			.registerTypeHierarchyAdapter(byte[].class,
					new ByteArrayToBase64TypeAdapter()).create();

	// private static final Gson gson = new GsonBuilder().create();

	@Autowired
	private ViewResolver viewResolver;

	private Broadcaster broadcaster;

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
	@RequestMapping(value = ATMOSPHERE_PLAYLIST_STREAM_PATH, method = RequestMethod.GET)
	public ModelAndView subscribeToStream(HttpServletRequest request)
			throws Exception {
		LOG.debug("Subscribing client to audio stream.");
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
		LOG.debug("Registering client to audio stream.");
		// Log all events on the console, including WebSocket events.
		resource.addEventListener(new WebSocketEventListenerAdapter());

		response.setContentType("arraybuffer");
		response.setCharacterEncoding("UTF-8");

		broadcaster = lookupBroadcaster(request.getPathInfo());
		resource.setBroadcaster(broadcaster);

		ApplicationFactory.getPlaylistStreamService().subscribe(this);

		String header = request.getHeader(HeaderConfig.X_ATMOSPHERE_TRANSPORT);
		if (HeaderConfig.LONG_POLLING_TRANSPORT.equalsIgnoreCase(header)) {
			request.setAttribute(ApplicationConfig.RESUME_ON_BROADCAST,
					Boolean.TRUE);
			resource.suspend(-1);
		} else {
			resource.suspend(-1);
		}
		LOG.debug("Client registered to the stream.");
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
		LOG.debug("Looking up broadcaster.");
		if (pathInfo == null) {
			return BroadcasterFactory.getDefault().lookup(
					ATMOSPHERE_PLAYLIST_STREAM_PATH, true);
		} else {
			String[] decodedPath = pathInfo
					.split(ATMOSPHERE_PLAYLIST_STREAM_PATH);
			return BroadcasterFactory.getDefault().lookup(
					decodedPath[decodedPath.length - 1], true);
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
	 */
	@Override
	public void provideData(byte[] data) {
		String json = gson.toJson(data);
		if (json.charAt(0) == '"')
			json = json.substring(1);

		if (json.charAt(json.length() - 1) == '"')
			json = json.substring(0, json.length() - 1);

		broadcaster.broadcast(json);
		// broadcaster.broadcast(data);
	}

	@Override
	public void notifyEndOfStream() {
		LOG.debug("Notifying subscriber about end of stream.");
		broadcaster.broadcast(gson.toJson("EOS"));
		broadcaster.destroy();
	}

	@Override
	public boolean subscriberIsAlive() {
		return !broadcaster.isDestroyed();
	}

}
