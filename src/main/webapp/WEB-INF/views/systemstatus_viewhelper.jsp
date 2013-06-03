<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<c:choose>
	<c:when test="${empty systemstatus}">
		<div>
			<p>Zurzeit sind keine Daten über das System verfügbar.</p>
		</div>
	</c:when>
	<c:when test="${not empty systemstatus}">
		<div>
			<table class="table">
				<thead>
					<tr>
						<th>Verfügbare Prozessoren</th>
						<th>Verfügbarer Arbeitsspeicher</th>
						<th>Aktuelle Systemlast</th>
						<th>Datenbankgrösse</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${systemstatus.numberOfCores}</td>
						<td>${systemstatus.availableMemory}</td>
						<td>${systemstatus.currentSystemLoad}</td>
						<td>${systemstatus.databaseSize}</td>
					</tr>
				</tbody>
			</table>
			<table class="table">
				<thead>
					<tr>
						<th>Anzahl erfasste Musikstücke</th>
						<th>Anzahl analysierte Musikstücke</th>
						<th>Anzahl Musikstücke in der Warteschlange</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${systemstatus.totalNumberOfSongs}</td>
						<td>${systemstatus.numberOfAnalyzedSongs}</td>
						<td>${systemstatus.numberOfPendingSongs}</td>
					</tr>
				</tbody>
			</table>
			<a href="#" class="btn btn-primary btn-mini">Datenverzeichnis neu
				einlesen</a>

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
	</c:when>
</c:choose>