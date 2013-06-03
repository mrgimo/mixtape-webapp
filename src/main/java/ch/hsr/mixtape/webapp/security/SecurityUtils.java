package ch.hsr.mixtape.webapp.security;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.web.util.ELRequestMatcher;
import org.springframework.security.web.util.RequestMatcher;

public class SecurityUtils {

	public static final String AJAX_AUTH_HEADER = "X-AjaxAuthentication_result";

	public static final String AUTH_OK_HEADER_VALUE = "auth_ok";

	public static final String AUTH_FAILED_HEADER_VALUE = "auth_failure";

	private static final RequestMatcher requestMatcher = new ELRequestMatcher(
			"hasHeader('X-Requested-With','XMLHttpRequest')");

	public static boolean isAjaxRequest(HttpServletRequest request) {
		return requestMatcher.matches(request);
	}

}
