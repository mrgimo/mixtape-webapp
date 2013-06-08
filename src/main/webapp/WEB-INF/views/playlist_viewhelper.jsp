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
				<c:forEach items="${playlist.item}" var="item">
					<tr>
						<td class="tooltip" data-toggle="tooltip"><c:choose>
								<c:when test="${not empty item.antecessor}">
									<i class="icon-tasks"></i>
									<div>
										<p>
											Ähnlichkeit zwischen<br /> <small>»
												${item.current.title} - ${item.current.artist}</small> <small>»
												${item.antecessor.title} - ${item.antecessor.artist}</small>
										</p>
										<hr />
										<div class='similarities'>
											<label>Gesamt: <span class='valueLabel'>${item.total}%</span></label>
											<div class='progress'>
												<div class='bar' style='width: ${item.total}%;'></div>
											</div>
											<small>Harmonisch: <span class='valueLabel'>${item.harmonic}%</span></small>
											<div class='progress'>
												<div class='bar' style='width: ${song.harmonic}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Wahrnehmend: <span class='valueLabel'>${item.perceptual}%</span></small>
											<div class='progress'>
												<div class='bar' style='width: ${item.perceptual}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Spektral: <span class='valueLabel'>${song.spectral}%</span></small>
											<div class='progress'>
												<div class='bar' style='width: ${item.spectral}%;'></div>
											</div>
											<div class='clearfix'></div>
											<small>Rhythmisch: <span class='valueLabel'>${item.temporal}%</span></small>
											<div class='progress'>
												<div class='bar' style='width: ${item.temporal}%;'></div>
											</div>
											<div class='clearfix'></div>
										</div>
									</div>
								</c:when>
							</c:choose></td>
						<td><strong
							<c:if test="${item.userWish}">class="userWish"</c:if>>${item.current.title}</strong>
							<small>${item.current.artist}</small> <input type="hidden"
							value="${item.current.id}" /></td>
						<td><c:if test="${isAuthenticated}">
								<div class="input-prepend input-append">
									<a class="btn btn-info"> <i class="icon-move"></i>
									</a>
									<button class="btn btn-danger">
										<i class="icon-remove"></i>
									</button>
								</div>
							</c:if></td>
					</tr>
				</c:forEach>
			</c:when>
		</c:choose>
	</tbody>
</table>
