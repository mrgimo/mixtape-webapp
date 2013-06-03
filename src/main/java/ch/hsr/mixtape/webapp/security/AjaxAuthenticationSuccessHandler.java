package ch.hsr.mixtape.webapp.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

/**
 * Custom authentication success handler for combined use with AJAX-based and
 * also login-page based authentication. For AJAX-based authentication, the
 * response header is modified in order to be able to handle authentication
 * failures through javascript in the front end. For login-page based
 * authentication, the default behaviour is kept.
 * 
 * @author Stefan Derungs
 */
public class AjaxAuthenticationSuccessHandler extends
		SimpleUrlAuthenticationSuccessHandler {

	private static final Logger LOG = LoggerFactory
			.getLogger(AjaxAuthenticationSuccessHandler.class);

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		LOG.debug("Handling successful authentication request.");

		if (SecurityUtils.isAjaxRequest(request)) {
			response.setHeader(SecurityUtils.AJAX_AUTH_HEADER,
					SecurityUtils.AUTH_OK_HEADER_VALUE);
		} else {
			super.onAuthenticationSuccess(request, response, authentication);
		}
	}

}