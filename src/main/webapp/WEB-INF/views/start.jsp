<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>
<!DOCTYPE html>
<html lang="de">
<head>

<title>mixTape</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<link rel="stylesheet"
	href="<c:url value="/resources/css/jquery-ui-1.10.3.custom.min.css" />"
	media="screen" />
<link rel="stylesheet"
	href="<c:url value="/resources/css/bootstrap.min.css" />"
	media="screen" />
<link rel="stylesheet"
	href="<c:url value="/resources/css/mixtape-webapp.css" />"
	media="screen" />

</head>

<body>
	<div class="container-fluid">

		<%@ include file="/WEB-INF/views/navigation_viewhelper.jsp"%>

		<div class="container-fluid">
			<div class="tab-content">
				<div class="tab-pane active" id="start">
					<h2>Start</h2>
					<p>
						<strong>mixTape</strong> ist ein Projekt dreier Studenten der <abbr
							title="Hochschule Rapperswil">HSR</abbr>, welches im Rahmen einer
						Bachelorarbeit umgesetzt wurde. Ziel dieser Applikation ist das
						finden von Ähnlichkeiten zwischen verschiedenen Musikstücken auf
						der Basis von extrahierten Eigenschaften. Dabei wurden sowohl
						bestehenden Komponenten und Libraries verwendet, wie auch eigene
						Ideen umgesetzt.
					</p>
					<p class="lead">Schau dir an, was als nächstes gespielt wird
						oder platziere einen eigenen Musikwunsch!</p>
					<p>
						<a href="#music" id="startButton"
							class="btn btn-primary btn-large">Hier gehts weiter »</a>
					</p>
					<p>Komplett auf HTML5 und CSS3 - ohne Rücksicht auf
						Browserkompatibilität ggb. älteren Browsern. Ziel war,
						herauszufinden, was man alles mit den neuen Technologien HTML5 und
						CSS3 umsetzen kann - wo die Arbeit vereinfacht wird und wo nicht.
					</p>
					<div class="player">
						<audio controls="controls" preload="metadata">
							<source src="/mixtape-webapp/resources/TEMP_CanonSample.ogg"
								type="audio/ogg"></source>
							<p>Dein Browser unterstützt die Wiedergabe nicht.</p>
						</audio>
					</div>
				</div>
				<div class="tab-pane" id="music">
					<div class="row-fluid">
						<div class="span8">
							<h2>Musikwunsch abgeben</h2>
							<p>Suche in der Datenbank nach einem Lied und platziere
								deinen Musikwunsch. Die Anwendung wird dann automatisch aufgrund
								der aktuellen Wiedergabeliste den besten Zeitpunkt fürs
								Abspielen deines Liedes wählen.</p>
							<form:form method="get" name="wishSong" action="/search">
								<span class="help-block visible-phone">Suche nach einem
									Titel, Interpreten oder Album...</span>
								<input type="text" name="term"
									class="input-block-level querySong"
									placeholder="Titel, Interpreten oder Album suchen..."
									data-queryTarget="wishQueryResults" />
							</form:form>
							<div id="wishQueryResults" class="queryResults">
								<%@ include file="/WEB-INF/views/songquery_viewhelper.jsp"%>
							</div>
						</div>
						<div class="span4">
							<h2>Aktuelle Wiedergabeliste</h2>
							<p>Folgende Lieder werden als nächstes abgespielt.
								Hervorgehobene Einträge stellen Wünsche von Benutzern dar.</p>
							<div id="playlist">
								<%@ include file="/WEB-INF/views/playlist_viewhelper.jsp"%>
							</div>
						</div>
					</div>
				</div>
				<div class="tab-pane" id="about">
					<h2>Über</h2>
				</div>
				<c:if test="${isAuthenticated}">
					<div class="tab-pane" id="playlistSettings">
						<h2>Wiedergabelisten-Konfiguration</h2>
						<p>mixTape wird mit den hier definierten Eigenschaften die
							Wiedergabeliste generieren.</p>
						<form class="form-horizontal" method="get" name="querySong"
							action="/search">
							<h4>Zufallsliste generieren</h4>
							<p>Wähle ein Musikstück, von welchem aus eine zufällige
								Wiedergabeliste generiert werden soll.</p>
							<div class="input-append">
								<input type="text" class="form-search span4" id="randomSong"
									name="randomSong"
									placeholder="Titel, Interpreten oder Album suchen..." />
								<button type="button" class="btn btn-primary">Suchen</button>
							</div>
							<div class="randomSongSearchResults"></div>
							<input type="hidden" name="songId" value="" />

							<hr />

							<label class="checkbox"> <input type="checkbox" value="1"
								title="Wenn aktiviert, wird die Abstandsfunktion in die Generierung miteinbezogen, andernfalls nicht." />
								<small>Abstandsfunktion</small>
							</label>
							<p>Legt fest, wie gross die Ähnlichkeit zwischen zwei
								aufeinanderfolgende Lieder sein muss. Eine höhere Ähnlichkeit
								bedeutet ein langsameres Fortschreiten bei einer
								Musikrichtungsänderung. Eine tiefere Ähnlichkeit bedeutet eine
								grössere Änderungsmöglichkeit zwischen zwei Musikstücken.</p>
							<div>
								Ähnlichkeitsfaktor: <span id="amountLabel" class="valueLabel"></span>
							</div>
							<input type="hidden" id="amount" name="amount" />
							<div class="input-prepend input-append">
								<span class="add-on">tief</span>
								<div id="slider"></div>
								<span class="add-on">hoch</span>
							</div>

							<hr />

							<label class="checkbox"> <input type="checkbox" value="1"
								title="Wenn aktiviert, wird die BPM-Angabe in die Generierung miteinbezogen, andernfalls nicht." />
								<small> Anzahl <abbr title="Beats per Minute">BPM</abbr>
							</small>
							</label>
							<p>Legt die Anzahl BPM fest, die ein Musikstück haben muss,
								um in die Wiedergabeliste aufgenommen werden zu können. Im
								Hintergrund nimmt mixTape automatisch eine Abweichung von +/- 10
								BPMs an.</p>
							<input type="number" min="20" max="250" class="span1" id="bpm"
								name="bpm" placeholder="BPM" /> <input type="submit"
								class="btn btn-primary" value="Wiedergabeliste generieren" />

						</form>
					</div>
				</c:if>
				<c:if test="${isAuthenticated}">
					<div class="tab-pane" id="systemStatus">
						<h2>Systemstatus</h2>
						<h3>Systemübersicht</h3>
						<p class="text-info">Diese Anzeige aktualisiert sich
							automatisch alle 5 Sekunden.</p>
						<div id="systemStatusContainer">
							<%@ include file="/WEB-INF/views/systemstatus_viewhelper.jsp"%>
						</div>
					</div>
				</c:if>
			</div>

			<%@ include file="/WEB-INF/views/footer_viewhelper.jsp"%>

		</div>

		<div class="modal hide fade">
			<div class="modal-header">
				<h4></h4>
			</div>
			<div class="modal-body"></div>
			<div class="modal-footer">
				<button class="btn btn-primary">OK</button>
			</div>
		</div>

		<div class="login hide"><%@ include
				file="/WEB-INF/views/login_viewhelper.jsp"%>
		</div>

		<c:choose>
			<c:when test="not empty ${logout}">
				<script type="text/javascript">
					(function() {
						displayLogoutSuccess();
					});
				</script>
			</c:when>
			<c:when test="not empty ${loginFailed}">
				<script type="text/javascript">
					(function() {
						var errorMessage = {
							status : 'bei der Anmeldung!',
							responseText : 'Ein Fehler trat während der Anmeldung auf. Bitte versuche es nochmals.'
						};
						displayError(errorMessage);
					});
				</script>
			</c:when>
			<c:when test="not empty ${timeout}">
				<script type="text/javascript">
					(function() {
						var errorMessage = {
							status : '',
							responseText : 'Die Sitzung ist abgelaufen! Bitte neu anmelden.'
						};
						displayError(errorMessage);
					});
				</script>
			</c:when>
		</c:choose>

		<script src="<c:url value="/resources/js/jquery-1.9.1.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui-1.10.3.custom.min.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui.touch-punch.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap-tooltip.js" />"></script>
		<script src="<c:url value="/resources/js/jquery.atmosphere.js" />"></script>
		<script src="<c:url value="/resources/js/jquery.base64.min.js" />"></script>
		<script src="<c:url value="/resources/js/init.js" />" /></script>
		<c:if test="${isAuthenticated}">
			<script src="<c:url value="/resources/js/initAuthenticated.js" />" /></script>
		</c:if>

	</div>

</body>
</html>
