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

			<h3>Analyse-Fortschritt</h3>
			<div id="systemStatusAnalysisProgress">
				<c:choose>
					<c:when test="${empty systemstatus.pendingSongs}">
						<div class="progress">
							<div class="bar bar-success" style="width: 100%;">100%;</div>
						</div>
						<div>
							<p>Analyse abgeschlossen. Keine Musikstücke zur Analyse
								pendent.</p>
						</div>
					</c:when>
					<c:otherwise>
						<div class="progress progress-striped active">
							<div class="bar bar-success"
								style="width: ${systemstatus.progress}%;">${systemstatus.progress}%</div>
						</div>
						<div id="systemStatusHead">
							Titel <span>Fortschritt</span>
						</div>
						<ul class="table unstyled" id="pendingSongs">
							<c:forEach var="song" items="${systemstatus.pendingSongs}">
								<li>${song.title} - ${song.artist} <span>in
										Wartestellung</span>
								</li>
							</c:forEach>
						</ul>
					</c:otherwise>
				</c:choose>
			</div>
		</div>
	</c:when>
</c:choose>