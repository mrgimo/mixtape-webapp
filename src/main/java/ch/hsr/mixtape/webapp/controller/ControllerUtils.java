package ch.hsr.mixtape.webapp.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * @author Stefan Derungs
 */
public class ControllerUtils {

	public static <T> ResponseEntity<T> getResponseEntity(HttpStatus status,
			String warningMessage) {
		Map<String, String> headerValues = new HashMap<String, String>();
		headerValues.put("Warning", warningMessage);
		return getResponseEntity(status, headerValues);
	}

	public static <T> ResponseEntity<T> getResponseEntity(HttpStatus status,
			Map<String, String> headerValues) {
		if (!headerValues.isEmpty()) {
			HttpHeaders httpHeaders = new HttpHeaders();
			for (Entry<String, String> s : headerValues.entrySet())
				httpHeaders.set(s.getKey(), s.getValue());

			return new ResponseEntity<T>(httpHeaders, status);
		}
		return new ResponseEntity<T>(status);
	}

	public static <T> ResponseEntity<T> getResponseEntity(HttpStatus status) {
		return new ResponseEntity<T>(status);
	}

}
