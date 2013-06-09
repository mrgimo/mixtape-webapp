<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ page contentType="text/html; charset=UTF-8"%>
<div class="error">
	<c:if test="${not empty class}">
		<h4>${class}</h4>
	</c:if>
	<c:if test="${not empty message}">
		<p>${message}</p>
	</c:if>
</div>
