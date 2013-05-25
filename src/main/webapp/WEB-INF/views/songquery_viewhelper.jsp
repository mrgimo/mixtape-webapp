<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>

<c:if test="${not empty queriedSongs}">
	<ul class="unstyled">
		<c:forEach items="${queriedSongs}" var="song">
			<li><i class="icon-plus-sign"></i><strong>${song.title}</strong><br />
				<small>${song.artist} - ${song.album}</small> <input type="hidden"
				value="${song.id}" /></li>
		</c:forEach>
	</ul>
</c:if>