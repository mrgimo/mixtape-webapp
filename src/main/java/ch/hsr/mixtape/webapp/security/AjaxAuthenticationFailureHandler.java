package ch.hsr.mixtape.webapp.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

/**
 * Custom authentication failure handler for combined use with AJAX-based and
 * also login-page based authentication. For AJAX-based authentication, the
 * response header is modified in order to be able to handle authentication
 * failures through javascript in the front end. For login-page based
 * authentication, the default behaviour is kept.
 * 
 * @author Stefan Derungs
 */
public class AjaxAuthenticationFailureHandler extends
		SimpleUrlAuthenticationFailureHandler {

	private static final Logger LOG = LoggerFactory
			.getLogger(AjaxAuthenticationFailureHandler.class);

	private static final String DEFAULT_FAILURE_URL = "/login?loginFailed=1";

	@Override
	public void onAuthenticationFailure(HttpServletRequest request,
			HttpServletResponse response, AuthenticationException exception)
			throws IOException, ServletException {
		LOG.error("Handling failed authentication request.");

		if (SecurityUtils.isAjaxRequest(request)) {
			response.setHeader(SecurityUtils.AJAX_AUTH_HEADER,
					SecurityUtils.AUTH_FAILED_HEADER_VALUE);
			response.getWriter().print(exception.getMessage());
			response.getWriter().flush();
		} else {
			setDefaultFailureUrl(DEFAULT_FAILURE_URL);
			super.onAuthenticationFailure(request, response, exception);
		}
	}

}