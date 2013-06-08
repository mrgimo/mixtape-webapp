<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<ul class="unstyled">
	<c:choose>
		<c:when test="${not empty queriedSongs}">
			<c:forEach items="${queriedSongs}" var="song">
				<li><i class="icon-plus-sign"></i> <strong>${song.title}</strong><br />
					<small>${song.artist} - ${song.album}</small> <input type="hidden"
					value="${song.id}" /></li>
			</c:forEach>
		</c:when>
		<c:otherwise>
			<li>Tippe deine Suche ins obige Suchfeld ein.</li>
		</c:otherwise>
	</c:choose>
</ul>