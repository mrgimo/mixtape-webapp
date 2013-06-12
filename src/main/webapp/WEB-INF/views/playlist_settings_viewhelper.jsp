<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<form:form class="form-horizontal playlistSettings" method="POST"
	name="playlistSettings" action="/playlist/create"
	modelAttribute="playlistSettings">
	<div class="clearfix">
		<h4>Ausgangslieder</h4>
		<p>Wähle eins oder mehrere Lieder, von welchen aus eine zufällige
			Wiedergabeliste generiert werden soll.</p>
		<div>
			<div class="span4">
				<input type="text" name="term" class="input-block-level querySong"
					placeholder="Titel, Interpreten oder Album suchen..."
					data-queryTarget="playlistSettingsQueryResults"
					data-maxResults="10" />
			</div>
			<div class="clearfix"></div>
			<div class="span9 no-lateral-margin">
				<div id="playlistSettingsQueryResults" class="span4">
					<%@ include file="/WEB-INF/views/songquery_viewhelper.jsp"%>
				</div>
				<div id="playlistSettingsSelectedSongs" class="span4">
					<ul class="unstyled">
						<li class="ul-placeholder">Gewünschte Lieder hineinziehen.</li>
					</ul>
				</div>
			</div>
			<div class="playlistSettingsSongSelect hidden">
				<form:select path="startSongs" multiple="multiple" itemValue="id"
					items="${startSongs}" />
			</div>
		</div>
	</div>

	<hr />

	<div class="clearfix">
		<h4>Dauer der Wiedergabeliste</h4>
		<p>
			In diesem Abschnitt kannst du die anfängliche Länge der
			Wiedergabeliste einstellen. Du kannst wählen zwischen einer
			zeitlichen Länge <strong>oder</strong> einer minimalen Anzahl an
			Musikstücken.
		</p>
		<div>
			<dl class="dl-horizontal">
				<dt>
					<form:label path="startLengthInMinutes">Länge in Minuten</form:label>
				</dt>
				<dd>
					<form:input type="number" path="startLengthInMinutes"
						cssClass="span2" value="0" />
				</dd>
			</dl>
			<dl class="dl-horizontal">
				<dt>
					<form:label path="startLengthInSongs">Anzahl Musikstücken</form:label>
				</dt>
				<dd>
					<form:input type="number" path="startLengthInSongs"
						cssClass="span2" value="20" />
				</dd>
			</dl>
		</div>
	</div>

	<hr />

	<div class="clearfix">
		<h4>Ähnlichkeitsfaktoren</h4>
		<p>Nachfolgend kannst du die Ähnlichkeitsparameter definieren,
			welche zwischen zwei aufeinanderfolgenden Liedern gelten müssen, um
			durch das Pathfinding in die Wiedergabeliste aufgebnommen zu werden.
			Ein höherer Ähnlichkeitsfaktor bedeutet ein langsameres Fortschreiten
			bezüglich Änderung der Musikrichtung - das heisst, Lieder müssen sehr
			ähnlich sein. Ein niedrigerer Ähnlichkeitsfaktor bedeutet, dass
			Lieder sich mehr unterscheiden dürfen. Dadurch können schnellere
			Wechsel in der Musikrichtung stattfinden.</p>
		<div>
			<dl class="slider-container span6">
				<dt>
					Harmonischer Ähnlichkeitsfaktor: <span id="harmonicSimilarityLabel"
						class="valueLabel"></span>
				</dt>
				<dd>
					<p>Bedeutung: ...</p>
					<form:hidden path="harmonicSimilarity" id="harmonicSimilarity" />
					<div class="input-prepend input-append">
						<span class="add-on">tief</span>
						<div class="slider"></div>
						<span class="add-on">hoch</span>
					</div>
				</dd>
			</dl>
			<dl class="slider-container span6">
				<dt>
					Wahrnehmungs-bezogener Ähnlichkeitsfaktor: <span
						id="perceptualSimilarityLabel" class="valueLabel"></span>
				</dt>
				<dd>
					<p>Bedeutung: ...</p>
					<form:hidden path="perceptualSimilarity" id="perceptualSimilarity" />
					<div class="input-prepend input-append">
						<span class="add-on">tief</span>
						<div class="slider"></div>
						<span class="add-on">hoch</span>
					</div>
				</dd>
			</dl>
			<dl class="slider-container span6">
				<dt>
					Spektraler Ähnlichkeitsfaktor: <span id="spectralSimilarityLabel"
						class="valueLabel"></span>
				</dt>
				<dd>
					<p>Bedeutung: ...</p>
					<form:hidden path="spectralSimilarity" id="spectralSimilarity" />
					<div class="input-prepend input-append">
						<span class="add-on">tief</span>
						<div class="slider"></div>
						<span class="add-on">hoch</span>
					</div>
				</dd>
			</dl>
			<dl class="slider-container span6">
				<dt>
					Rhythmischer Ähnlichkeitsfaktor: <span id="temporalSimilarityLabel"
						class="valueLabel"></span>
				</dt>
				<dd>
					<p>Bedeutung: ...</p>
					<form:hidden path="temporalSimilarity" id="temporalSimilarity" />
					<div class="input-prepend input-append">
						<span class="add-on">tief</span>
						<div class="slider"></div>
						<span class="add-on">hoch</span>
					</div>
				</dd>
			</dl>
		</div>
	</div>

	<hr />

	<input type="submit" class="btn btn-primary"
		value="Wiedergabeliste generieren" />

	<input type="reset" class="btn" value="Eingaben zurücksetzen" />

</form:form>