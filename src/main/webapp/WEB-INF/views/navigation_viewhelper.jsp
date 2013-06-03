<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<div class="navbar navbar-inverse">
	<div class="navbar-inner">
		<div class="container">
			<a class="btn btn-navbar" data-toggle="collapse"
				data-target=".nav-collapse"> <span class="icon-bar"></span> <span
				class="icon-bar"></span> <span class="icon-bar"></span>
			</a> <a href="#" class="brand">mixTape</a>

			<div class="nav-collapse collapse navbar-responsive-collapse">
				<ul class="nav">
					<li class="divider-vertical"></li>
					<li class="active"><a href="<c:url value="./#start" />">Start</a></li>
					<li class="divider-vertical"></li>
					<li><a href="<c:url value="./#music" />">Wiedergabeliste &amp; Musikwunsch</a></li>
					<li class="divider-vertical"></li>
					<li><a href="<c:url value="./#about" />">Über</a></li>
					<li class="divider-vertical"></li>
				</ul>
				<ul class="nav pull-right">
					<c:choose>
						<c:when test="${isAuthenticated}">
							<li class="dropdown"><a class="dropdown-toggle"
								data-toggle="dropdown" href="#"> Einstellungen <b
									class="caret"></b>
							</a>
								<ul class="dropdown-menu">
									<li><a href="#playlistSettings">Wiedergabelisten-Konfiguration</a>
									</li>
									<li><a href="#systemStatus">Systemstatus</a></li>
									<li><a href="<c:url value="./logout" />">Logout</a></li>
						</c:when>
						<c:otherwise>
							<li><a href="<c:url value="./login" />">Login</a></li>
						</c:otherwise>
					</c:choose>
				</ul>
				</li>
				</ul>
			</div>
		</div>
	</div>
</div>