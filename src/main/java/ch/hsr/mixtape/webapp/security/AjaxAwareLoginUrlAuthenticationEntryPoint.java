package ch.hsr.mixtape.webapp.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

/**
 * @source <a href=
 *         "http://bmchild.blogspot.ch/2013/05/spring-security-return-401-unauthorized.html"
 *         >Spring Security: Return a 401 UNAUTHORIZED for AJAX Requests</a>
 * @authors bchild, Stefan Derungs
 */
public class AjaxAwareLoginUrlAuthenticationEntryPoint extends
		LoginUrlAuthenticationEntryPoint {

	@SuppressWarnings("deprecation")
	public AjaxAwareLoginUrlAuthenticationEntryPoint() {
		super();
	}

	public AjaxAwareLoginUrlAuthenticationEntryPoint(String loginFormUrl) {
		super(loginFormUrl);
	}

	@Override
	public void commence(final HttpServletRequest request,
			final HttpServletResponse response,
			final AuthenticationException authException) throws IOException,
			ServletException {
		if (isPreflight(request))
			response.setStatus(HttpServletResponse.SC_NO_CONTENT);
		else if (SecurityUtils.isAjaxRequest(request))
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
					"Unauthorized");
		else
			super.commence(request, response, authException);
	}

	/**
	 * Checks if this is a X-domain pre-flight request.
	 * 
	 * @param request
	 * @return
	 */
	private boolean isPreflight(HttpServletRequest request) {
		return "OPTIONS".equals(request.getMethod());
	}

}