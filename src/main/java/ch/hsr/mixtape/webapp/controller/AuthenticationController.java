package ch.hsr.mixtape.webapp.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import ch.hsr.mixtape.webapp.security.SecurityUtils;

@Controller
public class AuthenticationController {

	private static final Logger LOG = LoggerFactory
			.getLogger(AuthenticationController.class);

	@RequestMapping(method = RequestMethod.GET, value = "/login")
	public ModelAndView login(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication) {
		System.err.println("SUBMITTED FOR LOGIN:"); // TODO: remove
		LOG.debug("Requesting login.");

		if (SecurityUtils.isAjaxRequest(request)) {
			System.err.println("Requesting AJAX-Login");
			return null; // TODO
		} else {
			System.err.println("Requesting Normal Login");
			ModelAndView modelAndView = new ModelAndView("login");
			modelAndView.addObject("loginIncludeCancel", false);

			if (request.getParameter("loginFailed") != null) {
				System.err.println("LOGIN FAILED IF");
				modelAndView.addObject("loginFailed", true);
			} else if (request.getParameter("timeout") != null) {
				System.err.println("TIMEOUT IF");
				modelAndView.addObject("timeout", true);
			} else if (request.getParameter("authError") != null) {
				System.err.println("AUTHERROR IF");
				modelAndView.addObject("authError", true);
			}
			return modelAndView;
		}
	}

//	@RequestMapping(method = RequestMethod.GET, value = "/logout")
//	public String logout(ModelMap model) {
//		System.err.println("SUBMITTED FOR LOGOUT:");
//		for (Entry<String, Object> s : model.entrySet())
//			System.out.println(s.getKey() + ": " + s.getValue());
//		LOG.debug("Requesting logout.");
//		return "redirect:/?logout=1";
//	}

}
