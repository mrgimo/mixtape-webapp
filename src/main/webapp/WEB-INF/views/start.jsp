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
							<li class="active"><a href="#start">Start</a></li>
							<li class="divider-vertical"></li>
							<li><a href="#music">Wiedergabeliste &amp; Musikwunsch</a></li>
							<li class="divider-vertical"></li>
							<li><a href="#about">Über</a></li>
							<li class="divider-vertical"></li>
						</ul>
						<ul class="nav pull-right">
							<li class="dropdown"><a class="dropdown-toggle"
								data-toggle="dropdown" href="#"> Einstellungen <b
									class="caret"></b>
							</a>
								<ul class="dropdown-menu">
									<li><a href="#playlistSettings">Wiedergabelisten-Konfiguration</a>
									</li>
									<li><a href="#systemStatus">Systemstatus</a></li>
									<li><a href="#systemSettings">Systemeinstellungen</a></li>
								</ul></li>
						</ul>
					</div>
				</div>
			</div>
		</div>


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
						<p>Legt die Anzahl BPM fest, die ein Musikstück haben muss, um
							in die Wiedergabeliste aufgenommen werden zu können. Im
							Hintergrund nimmt mixTape automatisch eine Abweichung von +/- 10
							BPMs an.</p>
						<input type="number" min="20" max="250" class="span1" id="bpm"
							name="bpm" placeholder="BPM" /> <input type="submit"
							class="btn btn-primary" value="Wiedergabeliste generieren" />

					</form>
				</div>
				<div class="tab-pane" id="systemStatus">
					<h2>Systemstatus</h2>
					<h3>Systemübersicht</h3>
					<p class="text-info">Diese Anzeige aktualisiert sich
						automatisch alle 5 Sekunden.</p>
					<table class="table">
						<thead>
							<tr>
								<th>Verfügbare Prozessoren</th>
								<th>Verfügbarer Arbeitsspeicher</th>
								<th>Aktuelle Systemlast</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>4</td>
								<td>8 GB</td>
								<td>20%</td>
							</tr>
						</tbody>
					</table>
					<table class="table">
						<thead>
							<tr>
								<th>Datenbankgrösse</th>
								<th>Anzahl erfasste Musikstücke</th>
								<th>Anzahl analysierte Musikstücke</th>
								<th>Anzahl Musikstücke in der Warteschlange</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>25 GB</td>
								<td>64'283</td>
								<td>64'180</td>
								<td>103</td>
							</tr>
						</tbody>
					</table>
					<a href="#" class="btn btn-primary btn-mini">Datenverzeichnis
						neu einlesen</a>

					<h3>Analyse-Fortschritt</h3>
					<div class="progress progress-striped active">
						<div class="bar bar-success" style="width: 10%;"></div>
					</div>
					<table class="table">
						<thead>
							<tr>
								<th>Titel</th>
								<th>Fortschritt</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>A Song for you - Interpret 1</td>
								<td>45%</td>
							</tr>
							<tr>
								<td>Singing all Night long - Interpret 1</td>
								<td>20%</td>
							</tr>
							<tr>
								<td>Gravity - Interpret 1</td>
								<td>68%</td>
							</tr>
							<tr>
								<td>Upon the City - Interpret 1</td>
								<td>37%</td>
							</tr>
							<tr>
								<td>Song1 - Interpret 1</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song2 - Interpret 1</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song3 - Interpret 1</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song4 - Interpret 1</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song5 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song6 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song7 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song8 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song9 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song10 - Interpret 2</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song11 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song12 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song13 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song14 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song15 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song16 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
							<tr>
								<td>Song17 - Interpret 3</td>
								<td>In Wartestellung</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="tab-pane" id="systemSettings">
					<h2>Systemeinstellungen</h2>
					<p>In diesem Abschnitt kannst du die grundlegenden
						Einstellungen deiner mixTape Installation festlegen.</p>
					<form class="form-horizontal">
						<h4>Datenpfad</h4>
						<p>Der Serverpfad zu deiner Musik-Sammlung.</p>
						<div class="control-group">
							<label class="control-label" for="path">Datenpfad</label>
							<div class="controls">
								<input type="text" id="path" name="path" placeholder="Datenpfad"
									required="required"> <a href="#"
									class="btn btn-primary btn-mini">Datenverzeichnis neu
									einlesen</a>
							</div>
						</div>

						<h4>Server Port</h4>
						<p>Wenn du diese Einstellung änderst, ändert sich ggf. die
							Zugriffsadresse, welche du dann manuell im Browser anpassen
							musst. Nach dem Ändern dieser Einstellung wird der Server neu
							gestartet, was eine gewisse Zeit in Anspruch nehmen kann.</p>
						<div class="control-group">
							<label class="control-label" for="serverPort">Server Port</label>
							<div class="controls">
								<input type="number" min="1" max="65535" value="8080"
									id="serverPort" name="serverPort" placeholder="Server Port"
									required="required"> <span class="help-inline">Gültige
									Werte zwischen 1 und 65535, Standart: 8080</span>
							</div>
						</div>

						<h4>Passwort Änderung</h4>
						<p>Hier kannst du das Passwort für den geschützten
							Konfigurationsbereich von mixTape ändern.</p>
						<div class="control-group">
							<label class="control-label" for="currentPassword">Aktuelles
								Passwort</label>
							<div class="controls">
								<input type="password" id="currentPassword"
									name="currentPassword" placeholder="Aktuelles Passwort"
									autocomplete="off">
							</div>
						</div>
						<div class="control-group">
							<label class="control-label" for="newPassword1">Neues
								Passwort</label>
							<div class="controls">
								<input type="password" id="newPassword1" name="newPassword1"
									placeholder="Neues Passwort" autocomplete="off">
							</div>
						</div>
						<div class="control-group">
							<label class="control-label" for="newPassword2">Passwort
								Wiederholung</label>
							<div class="controls">
								<input type="password" id="newPassword2" name="newPassword2"
									placeholder="Passwort Wiederholung" autocomplete="off">
							</div>
						</div>
					</form>
				</div>
			</div>

			<hr>

			<div>
				<p class="text-center">
					mixTape 2013, Publiziert unter der <a
						href="http://www.gnu.org/licenses/gpl.html">GNU/GPL 3.0</a>
					Lizenz.
				</p>
			</div>

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

		<script src="<c:url value="/resources/js/jquery-1.9.1.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui-1.10.3.custom.min.js" />"></script>
		<script
			src="<c:url value="/resources/js/jquery-ui.touch-punch.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap.min.js" />"></script>
		<script src="<c:url value="/resources/js/bootstrap-tooltip.js" />"></script>
		<script src="<c:url value="/resources/js/jquery.atmosphere.js" />"></script>
		<script src="<c:url value="/resources/js/init.js" />" /></script>

	</div>

</body>
</html>
