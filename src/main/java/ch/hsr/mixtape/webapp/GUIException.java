package ch.hsr.mixtape.webapp;

/**
 * This is a general exception to use in frontend to wrap all kind of exceptions
 * from the server side as the normal webapp user does not have to know the
 * specific details of a server error.
 * 
 * @author Stefan Derungs
 */
public class GUIException extends Exception {

	private static final long serialVersionUID = 928843708491669132L;

	public GUIException(String string, Exception e) {
		super(string, e);
	}

}
