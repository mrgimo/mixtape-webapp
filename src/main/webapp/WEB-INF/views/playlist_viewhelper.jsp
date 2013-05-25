<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<table class="table table-hover">
	<tbody>
		<c:choose>
			<c:when test="${empty playlist}">
				<tr>
					<td>Die Wiedergabeliste ist derzeit leer.</td>
				</tr>
			</c:when>
			<c:when test="${not empty playlist}">
				<c:forEach items="${playlist}" var="song">
					<tr>
						<td class="tooltip" data-toggle="tooltip"><c:choose>
								<c:when test="${empty song.songSimilarity}">
								</c:when>
								<c:when test="${not empty song.songSimilarity}">
									<i class="icon-tasks"></i>
									<div>
										<p>
											Ähnlichkeit zwischen<br /> <small>» ${song.title} -
												${song.artist}</small> <small>»
												${song.songSimilarity.antecessor.title} -
												${song.songSimilarity.antecessor.artist}</small>
										</p>
										<hr />
										<div class='similarities'>
											<label>Gesamt: <span class='valueLabel'>${song.songSimilarity.total}%</span></label>
											<div class='progress'>
												<div class='bar'
													style='width: ${song.songSimilarity.total}%;'></div>
											</div>
											<small>Tempo: <span class='valueLabel'>${song.songSimilarity.rhythmic}%</span></small>
											<div class='progress'>
												<div class='bar'
													style='width: ${song.songSimilarity.rhythmic}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Melodie: <span class='valueLabel'>${song.songSimilarity.melodic}%</span></small>
											<div class='progress'>
												<div class='bar'
													style='width: ${song.songSimilarity.melodic}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Instrumentalisierung/MFCC: <span
												class='valueLabel'>${song.songSimilarity.mfcc}%</span></small>
											<div class='progress'>
												<div class='bar'
													style='width: ${song.songSimilarity.mfcc}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Perceptional Features: <span
												class='valueLabel'>${song.songSimilarity.perceptional}%</span></small>
											<div class='progress'>
												<div class='bar'
													style='width: ${song.songSimilarity.perceptional}%;'></div>
											</div>
											<div class='clearfix'></div>
										</div>
									</div>
								</c:when>
							</c:choose></td>
						<td><strong
							<c:if test="${song.userWish}">class="userWish"</c:if>>${song.title}</strong>
							<small>${song.artist}</small> <input type="hidden"
							value="${song.id}" /></td>
						<td><div class="input-prepend input-append">
								<a class="btn btn-info">
									<i class="icon-move"></i>
								</a>
								<button class="btn btn-danger">
									<i class="icon-remove"></i>
								</button>
							</div></td>
					</tr>
				</c:forEach>
			</c:when>
		</c:choose>
	</tbody>
</table>
