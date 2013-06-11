package ch.hsr.mixtape.webapp;

import javax.servlet.ServletContextEvent;

import org.springframework.web.context.ContextLoaderListener;

import ch.hsr.mixtape.application.ApplicationFactory;

/**
 * This context listener just makes sure everything within mixtape is shut down
 * properly.
 * 
 * @author Stefan Derungs
 * 
 */
public class MixtapeServletContextListener extends ContextLoaderListener {

	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		ApplicationFactory.getServerService().shutdown();
		super.contextDestroyed(sce);
	}

}
