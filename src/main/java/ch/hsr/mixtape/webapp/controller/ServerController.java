package ch.hsr.mixtape.webapp.controller;

import java.util.HashMap;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

import ch.hsr.mixtape.application.service.ApplicationFactory;
import ch.hsr.mixtape.application.service.SystemService;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandler;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandling;

/**
 * This controller is responsible for handling all server status (core) related
 * requests.
 * 
 * @author Stefan Derungs
 */
@Controller
public class ServerController implements MixtapeExceptionHandling {

	private static final Logger LOG = LoggerFactory
			.getLogger(ServerController.class);

	private static final SystemService SYSTEM_SERVICE = ApplicationFactory
			.getSystemService();

	@PreAuthorize("permitAll")
	@RequestMapping(method = RequestMethod.GET, value = "/server/checkStatus")
	public ResponseEntity<String> checkServerStatus() {
		return ControllerUtils.getResponseEntity(HttpStatus.OK, "");
	}

	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.GET, value = "/server/getStatistics")
	public ModelAndView getServerStatistics() {
		return new ModelAndView("systemstatus_viewhelper", "systemstatus",
				SYSTEM_SERVICE.getSystemStatus());
	}

	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.GET, value = "/server/scanDirectory")
	public ResponseEntity<String> scanMusicDirectory(
			HttpServletResponse response) {
		if (SYSTEM_SERVICE.scanMusicDirectory()) {
			response.setHeader("X-AJAX-mixtape-isScanning", "true");
			return ControllerUtils.getResponseEntity(HttpStatus.OK,
					(new HashMap<String, String>()).put("isScanning", "true"));
		} else {
			response.setHeader("X-AJAX-mixtape-isScanning", "false");
			return ControllerUtils.getResponseEntity(HttpStatus.BAD_REQUEST,
					(new HashMap<String, String>()).put("isScanning", "false"));
		}
	}

	@PreAuthorize("isAuthenticated and hasRole('ROLE_ADMIN')")
	@RequestMapping(method = RequestMethod.GET, value = "/server/isScanningDirectory")
	public ResponseEntity<String> isServerScanningMusicDirectory(
			HttpServletResponse response) {
		String is = SYSTEM_SERVICE.isScanningMusicDirectory() ? "true"
				: "false";
		response.setHeader("X-AJAX-mixtape-isScanning", is);
		return ControllerUtils.getResponseEntity(HttpStatus.OK,
				(new HashMap<String, String>()).put("isScanning", is));
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseEntity<String> handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
