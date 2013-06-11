package ch.hsr.mixtape.webapp.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

import ch.hsr.mixtape.webapp.MixtapeExceptionHandler;
import ch.hsr.mixtape.webapp.MixtapeExceptionHandling;
import ch.hsr.mixtape.webapp.security.SecurityUtils;

/**
 * @author Stefan Derungs
 */
@Controller
public class AuthenticationController implements MixtapeExceptionHandling {

	private static final Logger LOG = LoggerFactory
			.getLogger(AuthenticationController.class);

	@RequestMapping(method = RequestMethod.GET, value = "/login")
	public ModelAndView login(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication) {
		LOG.debug("Requesting login.");

		ModelAndView modelAndView = new ModelAndView("login");
		if (SecurityUtils.isAjaxRequest(request)) {
			modelAndView.addObject("loginIncludeCancel", false);
			return modelAndView;
		} else {
			modelAndView.addObject("loginIncludeCancel", false);
			if (request.getParameter("loginFailed") != null) {
				modelAndView.addObject("loginFailed", true);
			} else if (request.getParameter("timeout") != null) {
				modelAndView.addObject("timeout", true);
			} else if (request.getParameter("authError") != null) {
				modelAndView.addObject("authError", true);
			}
			return modelAndView;
		}
	}

	@Override
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public @ResponseBody
	ModelAndView handleException(Exception e) {
		return MixtapeExceptionHandler.handleException(e, LOG);
	}

}
