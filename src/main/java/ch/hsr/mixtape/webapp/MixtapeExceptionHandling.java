package ch.hsr.mixtape.webapp;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;

/**
 * This interface must be implemented by each controller in order to have a
 * proper error handling and displaying in the frontend.
 * 
 * @author Stefan Derungs
 */
public interface MixtapeExceptionHandling {

	/**
	 * @return A string as @ResponseBody containing the error message. Moreover
	 *         the Http-Response-Status is set to {@link HttpStatus#BAD_REQUEST}
	 */
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
	public @ResponseBody ModelAndView handleException(Exception e);

}
