package ch.hsr.mixtape.webapp;

import static ch.hsr.mixtape.application.ApplicationFactory.getServerService;

import javax.servlet.ServletContextEvent;

import org.springframework.web.context.ContextLoaderListener;

/**
 * This context listener just makes sure everything within mixtape is shut down
 * properly.
 * 
 * @author Stefan Derungs
 * 
 */
public class MixtapeServletContextListener extends ContextLoaderListener {

	@Override
	public void contextInitialized(ServletContextEvent sce) {
		super.contextInitialized(sce);
		getServerService().startUp();
	}
	
	@Override
	public void contextDestroyed(ServletContextEvent sce) {
		getServerService().shutdown();
		super.contextDestroyed(sce);
	}

}
